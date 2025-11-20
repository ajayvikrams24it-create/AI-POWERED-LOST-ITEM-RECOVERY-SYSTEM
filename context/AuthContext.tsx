import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (userData: Omit<User, 'id' | 'createdAt'> & { password: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
  updateProfile: (name: string, phone: string, rollNo: string, institution: string) => Promise<boolean>;
}

const apiUrl = (import.meta && (import.meta as any).env && (import.meta as any).env.VITE_API_URL) || 'http://localhost:4000';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        setIsAuthenticated(true);
      } catch (e) {
        localStorage.removeItem('user');
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      if (!res.ok) {
        const data = await res.json();
        return { success: false, error: data.error || 'Invalid email or password' };
      }
      const data = await res.json();
      
      if (data.success && data.user) {
        setUser(data.user);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);
        return { success: true };
      }
      return { success: false, error: 'Invalid email or password' };
    } catch (err) {
      console.error('Login error', err);
      return { success: false, error: 'An error occurred. Please try again.' };
    }
  };

  const signup = async (userData: Omit<User, 'id' | 'createdAt'> & { password: string }): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(`${apiUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      
      if (!res.ok) {
        const data = await res.json();
        return { success: false, error: data.error || 'User already exists with this email or student ID' };
      }
      const data = await res.json();
      
      if (data.success) {
        // Auto-login after signup
        return await login(userData.email, userData.password);
      }
      return { success: false, error: 'Failed to create account' };
    } catch (err) {
      console.error('Signup error', err);
      return { success: false, error: 'An error occurred. Please try again.' };
    }
  };

  const updateProfile = async (name: string, phone: string, rollNo: string, institution: string): Promise<boolean> => {
    try {
      if (!user) return false;
      
      const res = await fetch(`${apiUrl}/api/auth/profile/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, rollNo, institution })
      });
      
      if (!res.ok) return false;
      
      const updated = { ...user, name, phone, rollNo, institution };
      setUser(updated);
      localStorage.setItem('user', JSON.stringify(updated));
      return true;
    } catch (err) {
      console.error('Profile update error', err);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isAuthenticated, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};