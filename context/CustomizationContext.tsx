'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface RewardTier {
  id: string;
  name: string;
  threshold: number; // in dollars
  color: string; // hex color
}

interface RewardItem {
  id: string;
  name: string;
  description: string;
  cost: number; // in dollars
  category: 'toys' | 'treats' | 'supplies' | 'services';
  emoji: string;
  available: boolean;
}

interface CashbackEarningRule {
  id: string;
  name: string; // e.g., "Base Cashback"
  description: string; // e.g., "On all purchases"
  percentage: number; // e.g., 1 for 1%
  emoji: string; // e.g., "💳"
}

interface StoreItem {
  id: string;
  name: string;
  description: string;
  price: number; // in dollars
  category: string; // Stripe merchant category code
  emoji: string;
  available: boolean;
}

interface CustomizationSettings {
  companyLogo: string | null; // base64 data URL or null for default
  primaryColor: string; // hex color
  customerName: string;
  customerEmail: string;
  companyName: string;
  rewardsTiers: RewardTier[];
  rewardsItems: RewardItem[];
  cashbackRules: CashbackEarningRule[];
  storeItems: StoreItem[];
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
  customerEmail: 'customer@example.com',
  companyName: 'Dogs R Us',
  rewardsTiers: [
    { id: 'basic', name: 'Basic', threshold: 0, color: '#9CA3AF' },
    { id: 'bronze', name: 'Bronze', threshold: 20, color: '#F97316' },
    { id: 'silver', name: 'Silver', threshold: 40, color: '#D1D5DB' },
    { id: 'gold', name: 'Gold', threshold: 60, color: '#FBBF24' },
    { id: 'platinum', name: 'Platinum', threshold: 80, color: '#A855F7' },
  ],
  rewardsItems: [
    { id: 'rwd_001', name: 'Premium Dog Toy Bundle', description: 'A collection of durable, fun toys for your furry friend', cost: 5, category: 'toys', emoji: '🎾', available: true },
    { id: 'rwd_002', name: 'Gourmet Dog Treat Box', description: 'Healthy, delicious treats your dog will love', cost: 3, category: 'treats', emoji: '🦴', available: true },
    { id: 'rwd_003', name: '$50 PetSmart Gift Card', description: 'Use at any PetSmart location or online', cost: 10, category: 'supplies', emoji: '🛍️', available: true },
    { id: 'rwd_004', name: 'Professional Grooming Session', description: 'Full grooming service at a participating location', cost: 8, category: 'services', emoji: '✂️', available: true },
    { id: 'rwd_005', name: 'Dog Training Class', description: '6-week basic obedience course', cost: 15, category: 'services', emoji: '🎓', available: true },
  ],
  cashbackRules: [
    { id: 'base', name: 'Base Cashback', description: 'On all purchases', percentage: 1, emoji: '💳' },
    { id: 'pet_supplies', name: 'Pet Supplies Bonus', description: 'At participating retailers', percentage: 2, emoji: '🐕' },
    { id: 'veterinary', name: 'Veterinary Care Bonus', description: 'Help keep your pup healthy', percentage: 3, emoji: '🏥' },
  ],
  storeItems: [
    { id: 'prod_1', name: 'Dog Treats', description: 'Delicious treats your dog will love', price: 1, category: 'pet_shops_pet_food_and_supplies', emoji: '🦴', available: true },
    { id: 'prod_2', name: 'Chew Toy', description: 'Durable toy to keep your dog entertained', price: 5, category: 'pet_shops_pet_food_and_supplies', emoji: '🎾', available: true },
    { id: 'prod_3', name: 'Dog Food Bag', description: 'Nutritious food your dog will love', price: 10, category: 'pet_shops_pet_food_and_supplies', emoji: '🍖', available: true },
    { id: 'prod_4', name: 'Dog Grooming', description: 'Professional grooming service', price: 20, category: 'laundry_cleaning_services', emoji: '✂️', available: true },
    { id: 'prod_5', name: 'Dog Bed', description: 'Comfortable bed for your furry friend', price: 20, category: 'pet_shops_pet_food_and_supplies', emoji: '🛏️', available: true },
    { id: 'prod_6', name: 'Vet Checkup', description: 'Complete health examination', price: 10, category: 'veterinary_services', emoji: '🩺', available: true },
  ],
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
