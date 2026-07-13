import React, { createContext, useEffect, useState, ReactNode } from 'react'
import { isValidMoneroAddress } from '../utils/moneroAddress'
import { API_BASE } from '../lib/api'

export interface UserProfile {
  id: string
  email: string
  fullName: string
  name?: string
  orcidId?: string
  institution?: string
  researchArea?: string
  role?: string
  affiliation?: string
  location?: string
  bio?: string
  image?: string
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
  logout: () => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>
  linkWallet: (mainAddress: string, viewKey: string) => Promise<void>
}

export const TraditionalAuthContext = createContext<AuthContextType | null>(null)

const AUTH_API_BASE = '/cf-api/auth'
const SESSION_STORAGE_KEY = 'proyecta_auth_session_token'
const LEGACY_USER_CACHE_KEY = 'proyecta_user'
const LEGACY_ALL_USERS_KEY = 'proyecta_all_profiles'

function getStoredSessionToken() {
  return window.localStorage.getItem(SESSION_STORAGE_KEY)
}

function storeSessionToken(token: string) {
  window.localStorage.setItem(SESSION_STORAGE_KEY, token)
}

function clearSessionToken() {
  window.localStorage.removeItem(SESSION_STORAGE_KEY)
}

function cacheUser(user: UserProfile) {
  window.localStorage.setItem(LEGACY_USER_CACHE_KEY, JSON.stringify(user))

  const allProfiles = JSON.parse(window.localStorage.getItem(LEGACY_ALL_USERS_KEY) || '{}')
  allProfiles[user.email] = user
  window.localStorage.setItem(LEGACY_ALL_USERS_KEY, JSON.stringify(allProfiles))
}

function removeCachedUser() {
  window.localStorage.removeItem(LEGACY_USER_CACHE_KEY)
}

function readLegacyUser(): UserProfile | null {
  const saved = window.localStorage.getItem(LEGACY_USER_CACHE_KEY)
  if (!saved) return null

  try {
    return JSON.parse(saved) as UserProfile
  } catch {
    window.localStorage.removeItem(LEGACY_USER_CACHE_KEY)
    return null
  }
}

async function parseAuthResponse(response: Response) {
  const raw = await response.text()

  if (!raw) {
    return {}
  }

  try {
    return JSON.parse(raw)
  } catch {
    throw new Error('La respuesta del servidor no es v?lida.')
  }
}

export function TraditionalAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const boot = async () => {
      const token = getStoredSessionToken()

      if (token) {
        try {
          const response = await fetch(`${AUTH_API_BASE}/me`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })

          const data = await parseAuthResponse(response)

          if (!response.ok || !data.user) {
            throw new Error(data.error || 'No fue posible recuperar tu sesión.')
          }

          setUser(data.user)
          cacheUser(data.user)
          setInitialized(true)
          return
        } catch {
          clearSessionToken()
        }
      }

      const legacyUser = readLegacyUser()
      if (legacyUser) {
        setUser(legacyUser)
      }

      setInitialized(true)
    }

    void boot()
  }, [])

  const register = async (email: string, password: string, fullName: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${AUTH_API_BASE}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: fullName,
          email,
          password,
          acceptedPrivacyNotice: true,
          acceptedPublishingTerms: true,
        }),
      })

      const data = await parseAuthResponse(response)

      if (!response.ok) {
        throw new Error(data.error || 'Error en registro')
      }

      if (data.token) {
        storeSessionToken(data.token)
      }

      if (data.user) {
        setUser(data.user)
        cacheUser(data.user)
      }
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
      const response = await fetch(`${AUTH_API_BASE}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await parseAuthResponse(response)

      if (!response.ok) {
        throw new Error(data.error || 'Error en login')
      }

      if (data.token) {
        storeSessionToken(data.token)
      }

      if (data.user) {
        setUser(data.user)
        cacheUser(data.user)
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error en login'
      setError(msg)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    const token = getStoredSessionToken()

    try {
      if (token) {
        await fetch(`${AUTH_API_BASE}/logout`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      }
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      clearSessionToken()
      removeCachedUser()
      setUser(null)
    }
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) throw new Error('No user')

    const token = getStoredSessionToken()
    if (!token) {
      throw new Error('Tu sesión expiró. Vuelve a iniciar sesión.')
    }

    const response = await fetch(`${AUTH_API_BASE}/profile`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    })

    const data = await parseAuthResponse(response)

    if (!response.ok) {
      throw new Error(data.error || 'No fue posible actualizar tu perfil.')
    }

    if (data.user) {
      setUser(data.user)
      cacheUser(data.user)
    }
  }

  const linkWallet = async (mainAddress: string, viewKey: string) => {
    if (!user) throw new Error('No user')

    const normalizedAddress = mainAddress.trim()
    const normalizedViewKey = viewKey.trim()
    if (!isValidMoneroAddress(normalizedAddress)) {
      throw new Error('Dirección Monero inválida')
    }
    if (!/^[a-fA-F0-9]{64}$/.test(normalizedViewKey)) {
      throw new Error('View key pública inválida')
    }

    const token = getStoredSessionToken()
    if (!token) {
      throw new Error('Tu sesión expiró. Vuelve a iniciar sesión.')
    }

    const response = await fetch(`${AUTH_API_BASE}/wallet`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ mainAddress: normalizedAddress, viewKey: normalizedViewKey }),
    })

    const data = await parseAuthResponse(response)

    if (!response.ok) {
      throw new Error(data.error || 'No fue posible vincular la wallet.')
    }

    if (data.user) {
      setUser(data.user)
      cacheUser(data.user)
    }
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
