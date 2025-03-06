
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
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
  // Use the session from Supabase auth-helpers-react
  const supabaseSession = useSession();
  const supabaseClient = useSupabaseClient();
  const [user, setUser] = useState<User | null>(supabaseSession?.user || null);
  const [isLoading, setIsLoading] = useState(!supabaseSession);
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

  // Update our local user state when the Supabase session changes
  useEffect(() => {
    console.log('[AuthContext] Session from Supabase auth-helpers:', supabaseSession ? 'exists' : 'none');
    if (supabaseSession) {
      setUser(supabaseSession.user);
      setIsLoading(false);
    } else {
      // If no session from auth-helpers, try to restore it
      const initializeAuth = async () => {
        try {
          // Try to get the current session directly
          const { data, error } = await supabaseClient.auth.getSession();
          
          if (error) {
            console.error('[AuthContext] Error getting initial session:', error.message);
          } else if (data?.session) {
            console.log('[AuthContext] Initial session found:', data.session.user.id);
            setUser(data.session.user);
          } else {
            console.log('[AuthContext] No session found, user is not authenticated');
            setUser(null);
          }
        } catch (error) {
          console.error('[AuthContext] Error during auth initialization:', error);
          setUser(null);
        } finally {
          setIsLoading(false);
        }
      };
      
      initializeAuth();
    }
  }, [supabaseSession, supabaseClient]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      console.log('[AuthContext] Attempting to log in with email and password');
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
      console.log('[AuthContext] Attempting to sign up with email and password');
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
