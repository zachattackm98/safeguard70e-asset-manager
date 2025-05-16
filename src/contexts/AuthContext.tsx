
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

// Storage key constant
const USER_STORAGE_KEY = 'safeguard70e_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage only once at component mount
  useEffect(() => {
    console.log("AuthProvider: Checking for stored user");
    const loadUser = () => {
      const storedUser = localStorage.getItem(USER_STORAGE_KEY);
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          console.log("User found in localStorage:", parsedUser);
          setUser(parsedUser);
        } catch (error) {
          console.error("Failed to parse stored user:", error);
          localStorage.removeItem(USER_STORAGE_KEY);
        }
      } else {
        console.log("No user found in localStorage");
      }
      setIsLoading(false);
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Mock authentication logic
      const foundUser = MOCK_USERS.find(u => u.email === email && u.password === password);
      if (foundUser) {
        // Remove password from user object before storing
        const { password, ...userWithoutPassword } = foundUser;
        console.log("Login successful for:", userWithoutPassword);
        
        // Update state and localStorage
        setUser(userWithoutPassword);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userWithoutPassword));
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
    console.log("Logging out");
    setUser(null);
    localStorage.removeItem(USER_STORAGE_KEY);
  };

  // Derived state for authentication status
  const isAuthenticated = user !== null;
  
  const value = {
    user,
    login,
    logout,
    isAuthenticated,
    isLoading
  };

  console.log("AuthProvider state:", { isAuthenticated, isLoading });
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
