
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from './contexts/AuthContext.tsx'
import { SessionContextProvider } from '@supabase/auth-helpers-react'
import { supabase } from './lib/supabase'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SessionContextProvider supabaseClient={supabase}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </SessionContextProvider>
  </React.StrictMode>,
)
