
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { restoreSession, verifySession, forceSessionRefresh, syncSessionState } from '@/lib/sessionPersistence';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signInWithMicrosoft: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Function to refresh the session
  const refreshSession = useCallback(async () => {
    console.log('[AuthContext] Manual session refresh requested');
    setIsLoading(true);
    try {
      const { user: refreshedUser, error } = await forceSessionRefresh();
      if (error) {
        console.error('[AuthContext] Manual refresh failed:', error.message);
        setUser(null);
        return;
      }
      
      if (refreshedUser) {
        console.log('[AuthContext] Manual refresh succeeded');
        setUser(refreshedUser);
      } else {
        console.warn('[AuthContext] Manual refresh returned no user');
        setUser(null);
      }
    } catch (error) {
      console.error('[AuthContext] Error during manual refresh:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initialize auth state and set up listeners
  useEffect(() => {
    console.log('[AuthContext] Initializing auth context');
    let isMounted = true;
    setIsLoading(true);
    
    // Function to retrieve and set the current session
    const initializeAuth = async () => {
      try {
        // First, check if we have a session in localStorage directly
        // Get the Supabase URL from environment variables instead of accessing the protected property
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
        const storageKey = 'sb-' + new URL(supabaseUrl).hostname.split('.')[0] + '-auth-token';
        const storedSession = localStorage.getItem(storageKey);
        
        if (storedSession) {
          console.log('[AuthContext] Found raw session in localStorage, will attempt to use it');
        }
        
        // Try to get the current session
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('[AuthContext] Error getting initial session:', error.message);
          // Don't return yet, try to restore the session
        } else if (data?.session) {
          console.log('[AuthContext] Initial session found:', data.session.user.id);
          if (isMounted) {
            setUser(data.session.user);
            setIsLoading(false);
            return; // Successfully got session, no need to continue
          }
        }
        
        console.log('[AuthContext] No initial session found or error occurred, trying to restore');
        // Try to restore the session using our helper
        const session = await restoreSession();
        
        if (session && isMounted) {
          console.log('[AuthContext] Session restored successfully via helper');
          setUser(session.user);
        } else {
          // Last attempt: force a session refresh
          console.log('[AuthContext] No session from helper, trying force refresh');
          const { user: refreshedUser, error: refreshError } = await forceSessionRefresh();
          
          if (refreshError) {
            console.error('[AuthContext] Force refresh failed:', refreshError.message);
            if (isMounted) setUser(null);
          } else if (refreshedUser && isMounted) {
            console.log('[AuthContext] Session force-refreshed successfully');
            setUser(refreshedUser);
          } else if (isMounted) {
            console.log('[AuthContext] No session could be restored after all attempts');
            setUser(null);
          }
        }
      } catch (error) {
        console.error('[AuthContext] Error during auth initialization:', error);
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    
    // Initialize auth state
    initializeAuth();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log(`[AuthContext] Auth state changed: ${event}`, session ? `User ID: ${session.user.id}` : 'No session');
      
      if (!isMounted) return;
      
      // Always update loading state
      setIsLoading(false);
      
      switch (event) {
        case 'SIGNED_IN':
          console.log('[AuthContext] User signed in');
          setUser(session?.user ?? null);
          break;
          
        case 'SIGNED_OUT':
          console.log('[AuthContext] User signed out');
          setUser(null);
          break;
          
        case 'TOKEN_REFRESHED':
          console.log('[AuthContext] Token refreshed');
          setUser(session?.user ?? null);
          break;
          
        case 'USER_UPDATED':
          console.log('[AuthContext] User updated');
          setUser(session?.user ?? null);
          break;
          
        case 'INITIAL_SESSION':
          console.log('[AuthContext] Initial session detected');
          if (session) {
            console.log(`[AuthContext] Setting user from initial session: ${session.user.id}`);
            setUser(session.user);
          } else {
            console.log('[AuthContext] No user in initial session');
          }
          break;
          
        default:
          console.log(`[AuthContext] Unhandled auth event: ${event}`);
          if (session) {
            setUser(session.user);
          }
      }
    });
    
    // Set up a periodic session check to ensure we stay logged in
    const sessionCheckInterval = setInterval(async () => {
      if (!user) return; // Don't check if no user is logged in
      
      console.log('[AuthContext] Performing periodic session check');
      const isValid = await verifySession();
      
      if (!isValid && isMounted) {
        console.warn('[AuthContext] Session invalid during periodic check, refreshing');
        const refreshedUser = await syncSessionState();
        
        if (refreshedUser && isMounted) {
          console.log('[AuthContext] Session refreshed during periodic check');
          setUser(refreshedUser);
        } else if (isMounted) {
          console.error('[AuthContext] Session could not be refreshed during periodic check');
          setUser(null);
        }
      }
    }, 5 * 60 * 1000); // Check every 5 minutes

    // Clean up subscription and interval on unmount
    return () => {
      console.log('[AuthContext] Cleaning up auth context');
      isMounted = false;
      subscription.unsubscribe();
      clearInterval(sessionCheckInterval);
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      toast({
        title: "Welcome back!",
        description: "You've been logged in to your account."
      });
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Please check your credentials and try again.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) throw error;
      
      toast({
        title: "Account created successfully!",
        description: "Please check your email for verification link."
      });
    } catch (error: any) {
      toast({
        title: "Signup failed",
        description: error.message || "Please try again with a different email.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear any local storage items that might be persisting the session
      localStorage.removeItem('supabase.auth.token');
      
      // Ensure user state is updated
      setUser(null);
      
      toast({
        title: "Logged out",
        description: "You've been successfully logged out."
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to log out.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithMicrosoft = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'azure',
        options: {
          scopes: 'email profile'
        }
      });
      
      if (error) throw error;
      
      toast({
        title: "Microsoft authentication initiated",
        description: "Please complete the sign-in process in the popup window."
      });
    } catch (error: any) {
      toast({
        title: "Microsoft login failed",
        description: error.message || "Please try again.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      });
      
      if (error) throw error;
      
      toast({
        title: "Google authentication initiated",
        description: "Please complete the sign-in process in the popup window."
      });
    } catch (error: any) {
      toast({
        title: "Google login failed",
        description: error.message || "Please try again.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      login, 
      signup, 
      logout,
      signInWithMicrosoft,
      signInWithGoogle,
      refreshSession
    }}>
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
