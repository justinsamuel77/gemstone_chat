import React, { createContext, useContext, useState, useEffect } from 'react';
import { systemApi } from '../lib/api';
import { useToast } from '../components/ui/toast';

interface User {
  id: string;
  email: string;
  name: string;
  profile?: {
    firstName: string;
    lastName: string;
    company?: string;
    jobTitle?: string;
  };
}

interface DataContextType {
  user: User;
  isLoading: boolean;
  refreshData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ 
  children, 
  user 
}: { 
  children: React.ReactNode; 
  user: User;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkSystemHealth();
  }, []);

  const checkSystemHealth = async () => {
    try {
      await systemApi.checkHealth();
      console.log('✅ System health check passed');
    } catch (error) {
      console.error('❌ System health check failed:', error);
      toast({
        title: 'System Warning',
        description: 'Server connection issues detected.',
        variant: 'destructive'
      });
    }
  };

  const refreshData = () => {
    setIsLoading(true);
    // Refresh logic here
    setTimeout(() => setIsLoading(false), 1000);
  };

  return (
    <DataContext.Provider value={{ user, isLoading, refreshData }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}