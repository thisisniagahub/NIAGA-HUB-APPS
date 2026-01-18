import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, role?: User['role']) => Promise<void>;
  logout: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check local storage for persisted session
    const storedUser = localStorage.getItem('startupos_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, role: User['role'] = 'FOUNDER') => {
    setIsLoading(true);
    setError(null);
    
    // Simulate API Network Delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Simple credential check for demo purposes
    if (email === 'admin@startupos.com' && password === 'admin123') {
        const mockUser: User = {
          id: 'u_admin',
          name: 'Admin User',
          role: 'ADMIN',
          avatarUrl: undefined
        };
        setUser(mockUser);
        localStorage.setItem('startupos_user', JSON.stringify(mockUser));
    } else {
        // Fallback generic login for other emails (Demo mode flexibility)
        // In a real app, this would reject invalid creds
        if (password.length > 0) {
             const mockUser: User = {
              id: `u_${Date.now()}`,
              name: email.split('@')[0],
              role: role,
              avatarUrl: undefined
            };
            setUser(mockUser);
            localStorage.setItem('startupos_user', JSON.stringify(mockUser));
        } else {
            setError("Invalid credentials. Please use the admin login.");
        }
    }
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('startupos_user');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};