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
    debug: true // Always enable debug mode to help diagnose issues
  },
  // Global error handler
  global: {
    headers: {
      'X-Client-Info': 'jobber-tracker-mate'
    },
    fetch: async (url, options) => {
      const response = await fetch(url, options)
      if (!response.ok) {
        console.error(`[Supabase] API error: ${response.status} ${response.statusText}`)
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
})