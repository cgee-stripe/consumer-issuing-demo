'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { ApiLogEntry } from '@/types/api';

interface ApiLoggerContextType {
  logs: ApiLogEntry[];
  addLog: (log: Omit<ApiLogEntry, 'id' | 'timestamp'>) => void;
  clearLogs: () => void;
  isConsoleOpen: boolean;
  toggleConsole: () => void;
}

const ApiLoggerContext = createContext<ApiLoggerContextType | undefined>(undefined);

export function ApiLoggerProvider({ children }: { children: React.ReactNode }) {
  const [logs, setLogs] = useState<ApiLogEntry[]>([]);
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);

  const addLog = useCallback((log: Omit<ApiLogEntry, 'id' | 'timestamp'>) => {
    const newLog: ApiLogEntry = {
      ...log,
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    };
    setLogs((prevLogs) => [newLog, ...prevLogs]); // Most recent first
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  const toggleConsole = useCallback(() => {
    setIsConsoleOpen((prev) => !prev);
  }, []);

  return (
    <ApiLoggerContext.Provider
      value={{
        logs,
        addLog,
        clearLogs,
        isConsoleOpen,
        toggleConsole,
      }}
    >
      {children}
    </ApiLoggerContext.Provider>
  );
}

export function useApiLogger() {
  const context = useContext(ApiLoggerContext);
  if (context === undefined) {
    throw new Error('useApiLogger must be used within an ApiLoggerProvider');
  }
  return context;
}
