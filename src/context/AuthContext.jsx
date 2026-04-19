import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../services/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  // Offline Mock User for now
  const [user, setUser] = useState({ id: 'mock-user-id', email: 'offline@local' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Disabled Supabase Auth for offline mode
  }, [])

  const signUp = useCallback(async (email, password) => {
    return { user: { email } }
  }, [])

  const signIn = useCallback(async (email, password) => {
    return { user: { email } }
  }, [])

  const signOut = useCallback(async () => {
    setUser(null)
  }, [])

  const value = { user, loading, signUp, signIn, signOut }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
