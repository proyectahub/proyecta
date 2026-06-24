import React, { createContext, useState, useEffect, ReactNode } from 'react'

export interface UserProfile {
  id: string
  email: string
  fullName: string
  orcidId?: string
  institution?: string
  researchArea?: string
  moneroWallet?: {
    mainAddress: string
    viewKey: string
    userVitaAddress: string
    linkedAt: number
  }
  vitaBacked: number
  vitaEarned: number
  vitaPledged: number
  createdAt: number
}

interface AuthContextType {
  user: UserProfile | null
  loading: boolean
  initialized: boolean
  error: string | null
  register: (email: string, password: string, fullName: string) => Promise<void>
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>
  linkWallet: (mainAddress: string, viewKey: string) => Promise<void>
}

export const TraditionalAuthContext = createContext<AuthContextType | null>(null)

export function TraditionalAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem('proyecta_user')
    if (saved) {
      try {
        setUser(JSON.parse(saved))
      } catch (err) {
        localStorage.removeItem('proyecta_user')
      }
    }
    setInitialized(true)
  }, [])

  const register = async (email: string, password: string, fullName: string) => {
    setLoading(true)
    setError(null)
    try {
      const users = JSON.parse(localStorage.getItem('proyecta_users') || '[]')
      if (users.find((u: any) => u.email === email)) {
        throw new Error('Email ya registrado')
      }

      const newUser: UserProfile = {
        id: `user_${Date.now()}`,
        email,
        fullName,
        vitaBacked: 0,
        vitaEarned: 0,
        vitaPledged: 0,
        createdAt: Date.now(),
      }

      users.push({ email, password })
      localStorage.setItem('proyecta_users', JSON.stringify(users))

      const allProfiles = JSON.parse(localStorage.getItem('proyecta_all_profiles') || '{}')
      allProfiles[email] = newUser
      localStorage.setItem('proyecta_all_profiles', JSON.stringify(allProfiles))

      localStorage.setItem('proyecta_user', JSON.stringify(newUser))
      setUser(newUser)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error en registro'
      setError(msg)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    setLoading(true)
    setError(null)
    try {
      const users = JSON.parse(localStorage.getItem('proyecta_users') || '[]')
      const found = users.find((u: any) => u.email === email && u.password === password)
      if (!found) throw new Error('Email o password incorrectos')

      const allProfiles = JSON.parse(localStorage.getItem('proyecta_all_profiles') || '{}')
      const profile = allProfiles[email] || {
        id: `user_${Date.now()}`,
        email,
        fullName: '',
        vitaBacked: 0,
        vitaEarned: 0,
        vitaPledged: 0,
        createdAt: Date.now(),
      }

      localStorage.setItem('proyecta_user', JSON.stringify(profile))
      setUser(profile)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error en login'
      setError(msg)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('proyecta_user')
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) throw new Error('No user')
    const updated = { ...user, ...updates }
    localStorage.setItem('proyecta_user', JSON.stringify(updated))

    const allProfiles = JSON.parse(localStorage.getItem('proyecta_all_profiles') || '{}')
    allProfiles[user.email] = updated
    localStorage.setItem('proyecta_all_profiles', JSON.stringify(allProfiles))

    setUser(updated)
  }

  const linkWallet = async (mainAddress: string, viewKey: string) => {
    if (!user) throw new Error('No user')
    const vitaAddress = await hashWallet(mainAddress)
    const updated = {
      ...user,
      moneroWallet: { mainAddress, viewKey, userVitaAddress: vitaAddress, linkedAt: Date.now() }
    }
    localStorage.setItem('proyecta_user', JSON.stringify(updated))

    const allProfiles = JSON.parse(localStorage.getItem('proyecta_all_profiles') || '{}')
    allProfiles[user.email] = updated
    localStorage.setItem('proyecta_all_profiles', JSON.stringify(allProfiles))

    setUser(updated)
  }

  const hashWallet = async (address: string): Promise<string> => {
    const encoder = new TextEncoder()
    const buffer = await crypto.subtle.digest('SHA-256', encoder.encode(address))
    return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('')
  }

  return (
    <TraditionalAuthContext.Provider value={{ user, loading, initialized, error, register, login, logout, updateProfile, linkWallet }}>
      {children}
    </TraditionalAuthContext.Provider>
  )
}

export function useTraditionalAuth() {
  const context = React.useContext(TraditionalAuthContext)
  if (!context) throw new Error('useTraditionalAuth must be inside TraditionalAuthProvider')
  return context
}
