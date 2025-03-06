import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Enhanced localStorage implementation with robust error handling and logging
const enhancedLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      const item = localStorage.getItem(key)
      console.log(`[Supabase] Retrieved key: ${key}`, item ? 'exists' : 'not found')
      return item
    } catch (error) {
      console.error(`[Supabase] Error retrieving key ${key} from localStorage:`, error)
      return null
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      console.log(`[Supabase] Setting key in storage: ${key}`)
      localStorage.setItem(key, value)
    } catch (error) {
      console.error(`[Supabase] Error setting key ${key} in localStorage:`, error)
    }
  },
  removeItem: (key: string): void => {
    try {
      console.log(`[Supabase] Removing key from storage: ${key}`)
      localStorage.removeItem(key)
    } catch (error) {
      console.error(`[Supabase] Error removing key ${key} from localStorage:`, error)
    }
  }
}

// Ensure we have the URL and key before creating the client
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('[Supabase] Missing environment variables for Supabase client')
  throw new Error('Missing Supabase environment variables')
}

// Create the Supabase client with enhanced configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    // Use our enhanced localStorage implementation for better error handling
    storage: enhancedLocalStorage,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    // Use PKCE flow for better session persistence
    flowType: 'pkce',
    // Set a longer storage key expiry (30 days in seconds)
    storageKey: 'sb-' + new URL(supabaseUrl).hostname.split('.')[0] + '-auth-token',
    // Debug mode for development
    debug: import.meta.env.DEV // Only enable debug mode in development
  },
  // Global error handler
  global: {
    headers: {
      'X-Client-Info': 'jobber-tracker-mate'
    },
    fetch: async (url, options) => {
      // Log the request for debugging
      if (import.meta.env.DEV) {
        console.log(`[Supabase] Request: ${options?.method || 'GET'} ${url}`)
      }
      
      const response = await fetch(url, options)
      
      if (!response.ok) {
        console.error(`[Supabase] API error: ${response.status} ${response.statusText}`)
        // Try to get more detailed error information
        try {
          const errorData = await response.clone().json()
          console.error('[Supabase] Error details:', errorData)
        } catch (e) {
          // If we can't parse the error as JSON, just log the response text
          const errorText = await response.clone().text()
          console.error('[Supabase] Error response:', errorText)
        }
      }
      
      return response
    }
  },
  // Set reasonable timeouts
  realtime: {
    timeout: 30000 // 30 seconds
  }
})

// Initialize auth state when this module loads
supabase.auth.onAuthStateChange((event, session) => {
  console.log(`[Supabase] Auth state changed: ${event}`, session ? 'Session exists' : 'No session')
  
  // Log detailed session information in development
  if (import.meta.env.DEV && session) {
    console.log('[Supabase] User ID:', session.user?.id)
    console.log('[Supabase] Auth provider:', session.user?.app_metadata?.provider)
    console.log('[Supabase] Session expires at:', new Date(session.expires_at! * 1000).toLocaleString())
  }
})

// Export a helper function to check if user is authenticated
export const isAuthenticated = async () => {
  const { data, error } = await supabase.auth.getSession()
  if (error) {
    console.error('[Supabase] Error checking authentication:', error)
    return false
  }
  return !!data.session
}