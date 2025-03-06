// Session persistence helper functions
import { supabase } from './supabase';
import { Session, User } from '@supabase/supabase-js';

/**
 * Attempts to restore the user session
 * This function will try multiple approaches to restore a session
 */
export const restoreSession = async (): Promise<Session | null> => {
  console.log('[SessionPersistence] Attempting to restore session');
  
  try {
    // First check if we have a session in localStorage
    const storageKey = 'sb-' + new URL(supabase.supabaseUrl).hostname.split('.')[0] + '-auth-token';
    const storedSession = localStorage.getItem(storageKey);
    
    if (storedSession) {
      console.log('[SessionPersistence] Found session in localStorage');
    }
    
    // Try the standard getSession method
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('[SessionPersistence] Error getting session:', sessionError.message);
      // Don't return yet, try other methods
    } else if (sessionData?.session) {
      console.log('[SessionPersistence] Session restored successfully via getSession');
      return sessionData.session;
    }
    
    // If no session, try to refresh the token
    console.log('[SessionPersistence] No session found or error occurred, attempting refresh');
    const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
    
    if (refreshError) {
      console.error('[SessionPersistence] Error refreshing session:', refreshError.message);
      // Still don't return, try one more approach
    } else if (refreshData?.session) {
      console.log('[SessionPersistence] Session refreshed successfully');
      return refreshData.session;
    }
    
    // Last resort: try to get the user
    console.log('[SessionPersistence] Trying to get user as last resort');
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('[SessionPersistence] Error getting user:', userError.message);
    } else if (userData?.user) {
      console.log('[SessionPersistence] User found, but no session. Creating new session...');
      // If we have a user but no session, try to create a new session
      const { data: newSessionData, error: newSessionError } = await supabase.auth.refreshSession();
      
      if (newSessionError) {
        console.error('[SessionPersistence] Error creating new session:', newSessionError.message);
      } else if (newSessionData?.session) {
        console.log('[SessionPersistence] New session created successfully');
        return newSessionData.session;
      }
    }
    
    console.log('[SessionPersistence] No session could be restored after all attempts');
    return null;
  } catch (error) {
    console.error('[SessionPersistence] Unexpected error during session restoration:', error);
    return null;
  }
};

/**
 * Verifies if the current session is valid
 */
export const verifySession = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('[SessionPersistence] Session verification failed:', error.message);
      return false;
    }
    
    if (data?.user) {
      console.log('[SessionPersistence] Session verified successfully');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('[SessionPersistence] Error during session verification:', error);
    return false;
  }
};

/**
 * Force a session refresh
 */
export const forceSessionRefresh = async (): Promise<{user: User | null, error: Error | null}> => {
  try {
    const { data, error } = await supabase.auth.refreshSession();
    
    if (error) {
      console.error('[SessionPersistence] Force refresh failed:', error.message);
      return { user: null, error };
    }
    
    if (data?.session) {
      console.log('[SessionPersistence] Force refresh successful');
      return { user: data.session.user, error: null };
    }
    
    return { user: null, error: new Error('No session returned after refresh') };
  } catch (error) {
    console.error('[SessionPersistence] Error during force refresh:', error);
    return { user: null, error: error instanceof Error ? error : new Error('Unknown error') };
  }
};

/**
 * Syncs the session state with Supabase
 * This should be called whenever there's a concern about session state
 */
export const syncSessionState = async (): Promise<User | null> => {
  console.log('[SessionPersistence] Syncing session state');
  
  try {
    // First check if we have a valid user
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (!userError && userData?.user) {
      console.log('[SessionPersistence] Valid user found during sync');
      return userData.user;
    }
    
    // If not, try to refresh the session
    const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
    
    if (!refreshError && refreshData?.session) {
      console.log('[SessionPersistence] Session refreshed during sync');
      return refreshData.session.user;
    }
    
    console.log('[SessionPersistence] No valid session found during sync');
    return null;
  } catch (error) {
    console.error('[SessionPersistence] Error during session sync:', error);
    return null;
  }
};
