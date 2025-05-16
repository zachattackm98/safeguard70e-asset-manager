
import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
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

// Local storage keys
const ADMIN_USER_STORAGE_KEY = 'safeguard70e_admin_user';
const AUTH_STATE_KEY = 'safeguard70e_auth_state';

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
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast } = useToast();
  const authSubscription = useRef<{ unsubscribe: () => void } | null>(null);
  
  // Helper to save admin user to localStorage
  const saveAdminUser = useCallback((adminUser: User) => {
    try {
      localStorage.setItem(ADMIN_USER_STORAGE_KEY, JSON.stringify(adminUser));
      localStorage.setItem(AUTH_STATE_KEY, 'admin');
    } catch (e) {
      console.error("Error saving admin user to localStorage:", e);
    }
  }, []);

  // Helper to get admin user from localStorage
  const getAdminUserFromStorage = useCallback((): User | null => {
    try {
      const storedUser = localStorage.getItem(ADMIN_USER_STORAGE_KEY);
      const authState = localStorage.getItem(AUTH_STATE_KEY);
      
      if (storedUser && authState === 'admin') {
        try {
          return JSON.parse(storedUser);
        } catch (e) {
          console.error("Error parsing stored admin user:", e);
          localStorage.removeItem(ADMIN_USER_STORAGE_KEY);
          localStorage.removeItem(AUTH_STATE_KEY);
        }
      }
    } catch (e) {
      console.error("Error retrieving admin user from localStorage:", e);
    }
    return null;
  }, []);

  // Setup Supabase auth listener - separate from initialization to avoid race conditions
  useEffect(() => {
    console.log('Setting up auth listener...');
    
    // Clean up any existing subscription
    if (authSubscription.current) {
      authSubscription.current.unsubscribe();
    }
    
    // Set up new subscription
    const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);
      
      if (event === 'SIGNED_OUT') {
        setUser(null);
        try {
          localStorage.removeItem(AUTH_STATE_KEY);
        } catch (e) {
          console.error("Error removing auth state from localStorage:", e);
        }
        return;
      }
      
      if (session?.user) {
        try {
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
            
            try {
              localStorage.setItem(AUTH_STATE_KEY, 'supabase');
            } catch (e) {
              console.error("Error saving auth state to localStorage:", e);
            }
            
            setUser(userData);
          }
        } catch (error) {
          console.error('Error in profile fetch:', error);
          setUser(null);
        }
      } else if (event !== 'INITIAL_SESSION') { 
        // Don't clear user for initial session event
        setUser(null);
        try {
          localStorage.removeItem(AUTH_STATE_KEY);
        } catch (e) {
          console.error("Error removing auth state from localStorage:", e);
        }
      }
    });
    
    // Store subscription for cleanup
    authSubscription.current = data.subscription;
    
    // Cleanup on unmount
    return () => {
      if (authSubscription.current) {
        authSubscription.current.unsubscribe();
        authSubscription.current = null;
      }
    };
  }, []); // Empty dependency array means this runs once on mount

  // Initialize auth state once on mount - after subscription is set up
  useEffect(() => {
    const initializeAuth = async () => {
      if (isInitialized) return;
      
      console.log('Initializing auth...');
      try {
        setIsLoading(true);
        
        // Check for admin user first
        const adminUser = getAdminUserFromStorage();
        const authState = localStorage.getItem(AUTH_STATE_KEY);
        
        if (adminUser && authState === 'admin') {
          // Using admin authentication
          console.log('Found admin user in localStorage');
          setUser(adminUser);
          setIsInitialized(true);
          setIsLoading(false);
          return;
        }
        
        console.log('Checking Supabase session...');
        // Get initial session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          console.log('Found existing Supabase session');
          try {
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
              try {
                localStorage.setItem(AUTH_STATE_KEY, 'supabase');
              } catch (e) {
                console.error("Error saving auth state to localStorage:", e);
              }
              setUser(userData);
            }
          } catch (error) {
            console.error('Error in profile fetch:', error);
            setUser(null);
          }
        } else {
          console.log('No existing session found');
          setUser(null);
          try {
            localStorage.removeItem(AUTH_STATE_KEY);
          } catch (e) {
            console.error("Error removing auth state from localStorage:", e);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setUser(null);
      } finally {
        setIsInitialized(true);
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [getAdminUserFromStorage, isInitialized]);

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

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Clear any existing auth state
      try {
        localStorage.removeItem(AUTH_STATE_KEY);
        localStorage.removeItem(ADMIN_USER_STORAGE_KEY);
      } catch (e) {
        console.error("Error clearing localStorage:", e);
      }
      
      // Sign out from Supabase if there's an existing session
      await supabase.auth.signOut();
      
      // Special handling for the test admin account
      if (email === 'admin@example.com' && password === 'password123') {
        console.log('Logging in as test admin user');
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
      
      console.log('Logging in with Supabase');
      // For regular users, proceed with Supabase auth
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      // Auth state listener will handle setting the user
      
      toast({
        title: 'Login successful',
        description: 'Welcome back!',
      });
      
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
      setIsLoading(true);
      let authState = null;
      
      try {
        authState = localStorage.getItem(AUTH_STATE_KEY);
      } catch (e) {
        console.error("Error accessing localStorage:", e);
      }
      
      if (authState === 'admin') {
        // Admin user logout
        console.log('Logging out admin user');
        try {
          localStorage.removeItem(ADMIN_USER_STORAGE_KEY);
          localStorage.removeItem(AUTH_STATE_KEY);
        } catch (e) {
          console.error("Error removing admin data from localStorage:", e);
        }
        setUser(null);
      } else {
        // Regular user logout through Supabase
        console.log('Logging out Supabase user');
        try {
          localStorage.removeItem(AUTH_STATE_KEY);
        } catch (e) {
          console.error("Error removing auth state from localStorage:", e);
        }
        await supabase.auth.signOut();
      }
      
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
    } finally {
      setIsLoading(false);
    }
  };

  // Stable context value to prevent unnecessary re-renders
  const authContextValue = React.useMemo(() => ({
    user,
    login,
    signUp,
    logout,
    isAuthenticated: !!user,
    isLoading,
  }), [user, isLoading]);

  return <AuthContext.Provider value={authContextValue}>{children}</AuthContext.Provider>;
};
