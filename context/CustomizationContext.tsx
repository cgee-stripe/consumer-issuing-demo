'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface CustomizationSettings {
  companyLogo: string | null; // base64 data URL or null for default
  primaryColor: string; // hex color
  customerName: string;
  companyName: string;
}

interface CustomizationContextType {
  settings: CustomizationSettings;
  updateSettings: (newSettings: Partial<CustomizationSettings>) => void;
  resetToDefaults: () => void;
}

const defaultSettings: CustomizationSettings = {
  companyLogo: null,
  primaryColor: '#FF6B35', // Default Dogs R Us orange
  customerName: 'Christina',
  companyName: 'Dogs R Us',
};

const CustomizationContext = createContext<CustomizationContextType | undefined>(undefined);

export function CustomizationProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<CustomizationSettings>(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('portalCustomization');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettings({ ...defaultSettings, ...parsed });
      } catch (e) {
        console.error('Failed to parse customization settings:', e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('portalCustomization', JSON.stringify(settings));

      // Update CSS variable for primary color
      document.documentElement.style.setProperty('--color-primary', settings.primaryColor);
    }
  }, [settings, isLoaded]);

  const updateSettings = (newSettings: Partial<CustomizationSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const resetToDefaults = () => {
    setSettings(defaultSettings);
  };

  return (
    <CustomizationContext.Provider value={{ settings, updateSettings, resetToDefaults }}>
      {children}
    </CustomizationContext.Provider>
  );
}

export function useCustomization() {
  const context = useContext(CustomizationContext);
  if (!context) {
    throw new Error('useCustomization must be used within CustomizationProvider');
  }
  return context;
}
