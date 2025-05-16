
import React, { createContext, useState, useContext, useEffect } from 'react';
import { User, UserRole } from '../types/auth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Local storage key for admin user
const ADMIN_USER_STORAGE_KEY = 'safeguard70e_admin_user';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Helper to save admin user to localStorage
  const saveAdminUser = (adminUser: User) => {
    localStorage.setItem(ADMIN_USER_STORAGE_KEY, JSON.stringify(adminUser));
  };

  // Helper to get admin user from localStorage
  const getAdminUserFromStorage = (): User | null => {
    const storedUser = localStorage.getItem(ADMIN_USER_STORAGE_KEY);
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch (e) {
        console.error("Error parsing stored admin user:", e);
        localStorage.removeItem(ADMIN_USER_STORAGE_KEY);
      }
    }
    return null;
  };

  // Check for an existing session on initial load
  useEffect(() => {
    const checkSession = async () => {
      try {
        // First check if we have an admin user in localStorage
        const adminUser = getAdminUserFromStorage();
        if (adminUser) {
          setUser(adminUser);
          setIsLoading(false);
          return;
        }

        // Set up auth state change listener first
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (session && session.user) {
              // Fetch additional user data from profiles
              const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('name, email, role')
                .eq('id', session.user.id)
                .single();

              if (profileError) {
                console.error('Error fetching user profile:', profileError);
                setUser(null);
              } else if (profileData) {
                const userData = {
                  id: session.user.id,
                  name: profileData.name,
                  email: profileData.email,
                  role: profileData.role as UserRole,
                };
                setUser(userData);
              }
            } else {
              setUser(null);
            }
            setIsLoading(false);
          }
        );

        // Then check for existing session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session && session.user) {
          // Fetch additional user data from profiles
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('name, email, role')
            .eq('id', session.user.id)
            .single();

          if (profileError) {
            console.error('Error fetching user profile:', profileError);
            setUser(null);
          } else if (profileData) {
            const userData = {
              id: session.user.id,
              name: profileData.name,
              email: profileData.email,
              role: profileData.role as UserRole,
            };
            setUser(userData);
          }
        }
        
        setIsLoading(false);

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Session check error:', error);
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      // Add retry logic for network issues
      let retries = 2;
      let error = null;
      
      while (retries >= 0) {
        try {
          const result = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                name,
              },
            }
          });
          
          if (result.error) throw result.error;
          
          toast({
            title: 'Account created',
            description: 'Please sign in with your new account.',
          });
          
          return;
        } catch (err: any) {
          error = err;
          // Only retry network or timeout errors
          if (err.status !== 504 && err.message !== 'Load failed') {
            throw err;
          }
          retries--;
          // Wait before retrying
          if (retries >= 0) await new Promise(r => setTimeout(r, 1000));
        }
      }
      
      // If we've exhausted retries, throw the last error
      if (error) throw error;
      
    } catch (error: any) {
      console.error('Signup error:', error);
      toast({
        variant: 'destructive',
        title: 'Signup failed',
        description: error.message || 'Could not create account.',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Special login for admin user for testing
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Special handling for the test admin account
      if (email === 'admin@example.com' && password === 'password123') {
        // Create a mock admin user
        const adminUser: User = {
          id: 'admin-test-id',
          name: 'Admin User',
          email: 'admin@example.com',
          role: 'admin' as UserRole
        };
        
        // Save admin user to localStorage for persistence
        saveAdminUser(adminUser);
        setUser(adminUser);
        
        toast({
          title: 'Login successful',
          description: 'Welcome back, Admin!',
        });
        
        return;
      }
      
      // For regular users, proceed with Supabase auth
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        variant: 'destructive',
        title: 'Login failed',
        description: error.message || 'Please check your credentials and try again.',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      // If using test admin account, clear localStorage and user state
      if (user?.email === 'admin@example.com') {
        localStorage.removeItem(ADMIN_USER_STORAGE_KEY);
        setUser(null);
        toast({
          title: 'Logged out',
          description: 'You have been signed out successfully.',
        });
        return;
      }
      
      // For regular users, sign out through Supabase
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: 'Logged out',
        description: 'You have been signed out successfully.',
      });
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        variant: 'destructive',
        title: 'Error signing out',
        description: 'Please try again.',
      });
    }
  };

  const value = {
    user,
    login,
    signUp,
    logout,
    isAuthenticated: !!user,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
