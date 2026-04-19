import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { 
  User, 
  DashboardStats, 
  AdminLog, 
  SystemSettings 
} from '../types/admin';

interface AdminContextType {
  currentUser: User | null;
  adminStats: DashboardStats | null;
  recentLogs: AdminLog[];
  settings: SystemSettings | null;
  setCurrentUser: (user: User | null) => void;
  setAdminStats: (stats: DashboardStats | null) => void;
  setRecentLogs: (logs: AdminLog[]) => void;
  setSettings: (settings: SystemSettings | null) => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [adminStats, setAdminStats] = useState<DashboardStats | null>(null);
  const [recentLogs, setRecentLogs] = useState<AdminLog[]>([]);
  const [settings, setSettings] = useState<SystemSettings | null>(null);

  const value: AdminContextType = {
    currentUser,
    adminStats,
    recentLogs,
    settings,
    setCurrentUser,
    setAdminStats,
    setRecentLogs,
    setSettings,
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminContextProvider');
  }
  return context;
};
