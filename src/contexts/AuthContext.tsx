
import React, { createContext, useState, useContext, useEffect } from 'react';
import { User, UserRole } from '../types/auth';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Mock users for demo
const MOCK_USERS = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin' as UserRole,
    password: 'password123'
  },
  {
    id: '2',
    name: 'Tech User',
    email: 'tech@example.com',
    role: 'technician' as UserRole,
    password: 'password123'
  }
];

// Key for local storage
const USER_STORAGE_KEY = 'safeguard70e_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on initial render and set up storage event listener
  useEffect(() => {
    const loadUserFromStorage = () => {
      try {
        const storedUser = localStorage.getItem(USER_STORAGE_KEY);
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        }
      } catch (error) {
        console.error('Error loading user from storage:', error);
        // Clear potentially corrupted storage
        localStorage.removeItem(USER_STORAGE_KEY);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Initial load
    loadUserFromStorage();
    
    // Listen for storage changes in other tabs/windows
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === USER_STORAGE_KEY) {
        if (e.newValue) {
          setUser(JSON.parse(e.newValue));
        } else {
          setUser(null);
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Mock authentication logic
      const foundUser = MOCK_USERS.find(u => u.email === email && u.password === password);
      if (foundUser) {
        // Remove password from user object before storing
        const { password, ...userWithoutPassword } = foundUser;
        
        // Update state
        setUser(userWithoutPassword);
        
        // Store in localStorage with proper error handling
        try {
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userWithoutPassword));
        } catch (e) {
          console.error('Error saving to localStorage:', e);
        }
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem(USER_STORAGE_KEY);
    } catch (e) {
      console.error('Error removing from localStorage:', e);
    }
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    isLoading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
