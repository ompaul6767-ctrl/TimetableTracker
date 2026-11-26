import React, { createContext, useContext, useState, useCallback } from 'react'

export interface User {
  id: string
  email: string
  role: 'ADMIN' | 'COORDINATOR' | 'FACULTY'
  isActive?: boolean
  createdAt?: string
  faculty?: {
    id: string
    prn: string
    firstName: string
    lastName: string
    designation?: string
    department?: {
      name: string
      code: string
    }
  }
  coordinatorDepartments?: Array<{
    department: {
      id: string
      name: string
      code: string
    }
  }>
}
interface AuthContextType {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  setAuth: (user: User, token: string) => void
  clearAuth: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('ctms-user')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })
  const [accessToken, setAccessToken] = useState<string | null>(() =>
    localStorage.getItem('ctms-token')
  )
  const [isLoading] = useState(false)

  const setAuth = useCallback((u: User, token: string) => {
    localStorage.setItem('ctms-user', JSON.stringify(u))
    localStorage.setItem('ctms-token', token)
    setUser(u)
    setAccessToken(token)
  }, [])

  const clearAuth = useCallback(() => {
    localStorage.removeItem('ctms-user')
    localStorage.removeItem('ctms-token')
    setUser(null)
    setAccessToken(null)
  }, [])

  return (
    <AuthContext.Provider value={{
      user,
      accessToken,
      isAuthenticated: !!user && !!accessToken,
      isLoading,
      setAuth,
      clearAuth,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
