// context/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import apiClient from '../lib/api';
import { useRouter } from 'next/router';
import { User, LoginResponse } from '@/types'; // Using absolute paths if configured, else use '../types'

interface AuthContextType {
  user: Omit<User, 'password'> | null;
  token: string | null;
  isLoading: boolean; // Tracks loading state for auth operations
  isAuthCheckComplete: boolean; // Tracks if initial token check is done
  login: (loginIdentifier: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<Omit<User, 'password'> | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false); // For specific login/register actions
  const [isAuthCheckComplete, setIsAuthCheckComplete] = useState(false); // For initial load
  const router = useRouter();

  // Effect for initial token check on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      const storedToken = localStorage.getItem('authToken');
      if (storedToken) {
        console.log('Auth Check: Found token, verifying...');
        setToken(storedToken);
        try {
          // apiClient already includes the token via interceptor
          const response = await apiClient.get<Omit<User, 'password'>>('/auth/profile');
          setUser(response.data);
          console.log('Auth Check: Token verified, user set.');
        } catch (error: any) {
          console.error('Auth Check: Token verification failed.', error.response?.data || error.message);
          localStorage.removeItem('authToken'); // Clean up invalid token
          setToken(null);
          setUser(null);
           // Don't redirect here, let pages handle protection if needed
        }
      } else {
          console.log('Auth Check: No token found.');
      }
      setIsAuthCheckComplete(true); // Mark check as complete
    };
    checkAuthStatus();
  }, []); // Run only once on mount

  const login = async (loginIdentifier: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await apiClient.post<LoginResponse>('/auth/login', { loginIdentifier, password });
      const { access_token, user: loggedInUser } = response.data;
      localStorage.setItem('authToken', access_token);
      setToken(access_token);
      setUser(loggedInUser);
      console.log('Login successful:', loggedInUser.username);
    } catch (error: any) {
      console.error('Login failed:', error.response?.data || error.message);
      throw error; // Re-throw for the component to handle UI feedback
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      // Assuming register endpoint returns the created user (without password)
      await apiClient.post<Omit<User, 'password'>>('/auth/register', { username, email, password });
      console.log('Registration successful');
    } catch (error: any) {
      console.error('Registration failed:', error.response?.data || error.message);
      throw error;
    } finally {
        setIsLoading(false);
    }
  };

  const logout = () => {
    console.log('Logging out...');
    localStorage.removeItem('authToken');
    setToken(null);
    setUser(null);
    // Redirect to home or login page after logout
    // Using replace to prevent going back to protected pages via browser history
    router.replace('/auth/login');
  };

  const isAuthenticated = (): boolean => {
    // Check both token and user object for more robust check
    return !!token && !!user;
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, isAuthCheckComplete, login, register, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};