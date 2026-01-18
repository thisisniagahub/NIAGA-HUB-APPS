
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

const getApiUrl = () => {
    // Safely access import.meta.env for Vite environments
    const env = (import.meta as any).env;
    return env?.VITE_API_URL || 'http://localhost:3000';
};

const API_URL = getApiUrl();

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initAuth = async () => {
        const token = localStorage.getItem('startupos_token');
        const cachedUser = localStorage.getItem('startupos_user');

        if (token) {
            try {
                // Validate token with backend
                const res = await fetch(`${API_URL}/api/auth/me`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                if (res.ok) {
                    const userData = await res.json();
                    setUser(userData);
                } else {
                    // If 401/403, token is invalid. 
                    // If 500 or connection refused (catch block), we might want to fallback.
                    if (res.status === 401 || res.status === 403) {
                        localStorage.removeItem('startupos_token');
                        // Only remove user if we are sure token is invalid, not if server is just down
                        // But strictly speaking, if token is sent and rejected, we should logout.
                    }
                }
            } catch (e) {
                console.warn("Auth server unreachable. Falling back to offline mode.");
                // Fallback: If we have a cached user from a previous session (or demo login), restore it.
                if (cachedUser) {
                    setUser(JSON.parse(cachedUser));
                }
            }
        } else if (cachedUser) {
            // No token but cached user (legacy or persistent demo state)
            setUser(JSON.parse(cachedUser));
        }
        setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email: string, password: string, role: User['role'] = 'FOUNDER') => {
    setIsLoading(true);
    setError(null);
    
    try {
        const res = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (res.ok) {
            setUser(data.user);
            localStorage.setItem('startupos_token', data.token);
            localStorage.setItem('startupos_user', JSON.stringify(data.user)); // Keep for legacy sync
        } else {
            setError(data.error || 'Login failed');
        }
    } catch (err) {
        // Fallback for Demo without backend running
        console.warn("Backend unreachable. Using Demo Auth.");
        if (email === 'admin@startupos.com' && password === 'admin123') {
            const mockUser: User = { id: 'u_admin', name: 'Admin User', role: 'ADMIN' };
            setUser(mockUser);
            localStorage.setItem('startupos_token', 'mock_token');
            localStorage.setItem('startupos_user', JSON.stringify(mockUser));
        } else {
            setError("Connection to server failed.");
        }
    } finally {
        setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('startupos_token');
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
