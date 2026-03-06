import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { User } from '@/types'

interface AuthContextType {
  user: User | null
  loading: boolean
  unverified: boolean
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signUp: (data: SignUpData) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

interface SignUpData {
  firstName: string
  lastName: string
  classYear: string
  email: string
  password: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [unverified, setUnverified] = useState(false)

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me')
      const data = await res.json()
      if (data.user) {
        setUser(data.user)
        setUnverified(false)
      } else if (data.unverified) {
        setUser(null)
        setUnverified(true)
      } else {
        setUser(null)
        setUnverified(false)
      }
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshUser()
  }, [refreshUser])

  const signIn = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/sign-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (data.success) {
        await refreshUser()
        return { success: true }
      }
      return { success: false, error: data.error || 'Invalid email or password.' }
    } catch {
      return { success: false, error: 'An error occurred.' }
    }
  }

  const signUp = async (signUpData: SignUpData) => {
    try {
      const res = await fetch('/api/auth/sign-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signUpData),
      })
      const data = await res.json()
      if (data.success) {
        await refreshUser()
        return { success: true }
      }
      return { success: false, error: data.error || 'Sign up failed.' }
    } catch {
      return { success: false, error: 'An error occurred.' }
    }
  }

  const signOut = async () => {
    await fetch('/api/auth/sign-out', { method: 'POST' })
    setUser(null)
    setUnverified(false)
  }

  return (
    <AuthContext.Provider value={{ user, loading, unverified, signIn, signUp, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
