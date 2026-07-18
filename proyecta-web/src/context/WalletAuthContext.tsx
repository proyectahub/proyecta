import React, { createContext, useEffect, useState, ReactNode } from 'react'
import { useMoneroBlockchain } from '../hooks/useMoneroBlockchain'
import { useIPFSVita } from '../hooks/useIPFSVita'

export interface UserWallet {
  mainAddress: string
  viewKey: string
  userVitaAddress: string
  createdAt: number
}

export interface UserProfile {
  wallet: UserWallet
  fullName?: string
  email?: string
  institution?: string
  researchArea?: string
  orcidId?: string
  reputation: number
  vitaBacked: number
  vitaEarned: number
  vitaPledged: number
}

interface WalletAuthContextType {
  user: UserProfile | null
  loading: boolean
  error: string | null
  loginWithWallet: (mainAddress: string, viewKey: string) => Promise<void>
  logout: () => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>
  updateVitaBalance: () => Promise<void>
  watchWallet: () => () => void
}

export const WalletAuthContext = createContext<WalletAuthContextType | null>(null)

const AUTH_API_BASE = '/cf-api/auth'
const SESSION_STORAGE_KEY = 'proyecta_wallet_session_token'
const CACHE_KEY = 'proyecta_wallet'

export function WalletAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { isValidAddress, getAddressTransactions } = useMoneroBlockchain()
  const { loadUserVita, recordVita } = useIPFSVita()

  const hashWallet = async (address: string): Promise<string> => {
    const encoder = new TextEncoder()
    const data = encoder.encode(address)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
  }

  const storeSessionToken = (token: string) => {
    try {
      localStorage.setItem(SESSION_STORAGE_KEY, token)
    } catch {
      // Ignore storage failures.
    }
  }

  const getSessionToken = () => {
    try {
      return localStorage.getItem(SESSION_STORAGE_KEY)
    } catch {
      return null
    }
  }

  const clearSession = () => {
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY)
      localStorage.removeItem(CACHE_KEY)
    } catch {
      // Ignore storage failures.
    }
  }

  const cacheUser = (profile: UserProfile) => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(profile))
    } catch {
      // Ignore cache failures.
    }
  }

  const loadCachedUser = (): UserProfile | null => {
    try {
      const saved = localStorage.getItem(CACHE_KEY)
      if (!saved) return null
      return JSON.parse(saved) as UserProfile
    } catch {
      try {
        localStorage.removeItem(CACHE_KEY)
      } catch {}
      return null
    }
  }

  const persistWalletProfile = async (profile: UserProfile) => {
    const token = getSessionToken()
    if (!token) {
      return profile
    }

    const response = await fetch(`${AUTH_API_BASE}/wallet`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        fullName: profile.fullName,
        email: profile.email,
        institution: profile.institution,
        researchArea: profile.researchArea,
        orcidId: profile.orcidId,
      }),
    })

    if (!response.ok) {
      return profile
    }

    const data = await response.json()
    return data.user as UserProfile
  }

  const refreshFromServer = async () => {
    const token = getSessionToken()
    if (!token) {
      const cached = loadCachedUser()
      if (cached) setUser(cached)
      return
    }

    const response = await fetch(`${AUTH_API_BASE}/wallet`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      clearSession()
      const cached = loadCachedUser()
      if (cached) setUser(cached)
      return
    }

    const data = await response.json()
    if (data.user) {
      setUser(data.user)
      cacheUser(data.user)
    }
  }

  const loginWithWallet = async (mainAddress: string, viewKey: string) => {
    setLoading(true)
    setError(null)

    try {
      if (!isValidAddress(mainAddress)) {
        throw new Error('Dirección Monero inválida')
      }

      const userVitaAddress = await hashWallet(mainAddress)
      const vitaBalance = await loadUserVita(userVitaAddress)

      const response = await fetch(`${AUTH_API_BASE}/wallet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mainAddress,
          viewKey,
          reputation: vitaBalance.vitaEarned,
          vitaBacked: vitaBalance.vitaBacked,
          vitaEarned: vitaBalance.vitaEarned,
          vitaPledged: vitaBalance.vitaPledged,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Login failed')
      }

      if (data.token) {
        storeSessionToken(data.token)
      }

      if (data.user) {
        const profile = {
          ...data.user,
          vitaBacked: vitaBalance.vitaBacked,
          vitaEarned: vitaBalance.vitaEarned,
          vitaPledged: vitaBalance.vitaPledged,
          reputation: vitaBalance.vitaEarned,
        }
        setUser(profile)
        cacheUser(profile)
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Login failed'
      setError(errorMsg)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    const token = getSessionToken()

    try {
      if (token) {
        await fetch(`${AUTH_API_BASE}/wallet`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      }
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      clearSession()
      setUser(null)
    }
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) throw new Error('No user')

    const token = getSessionToken()
    if (!token) {
      throw new Error('Tu sesión expiró. Vuelve a iniciar sesión.')
    }

    const response = await fetch(`${AUTH_API_BASE}/wallet`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    })

    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.error || 'No fue posible actualizar el perfil.')
    }

    if (data.user) {
      setUser(data.user)
      cacheUser(data.user)
    }
  }

  const updateVitaBalance = async () => {
    if (!user) return

    const vitaBalance = await loadUserVita(user.wallet.userVitaAddress)
    setUser((prev) =>
      prev
        ? {
            ...prev,
            vitaBacked: vitaBalance.vitaBacked,
            vitaEarned: vitaBalance.vitaEarned,
            vitaPledged: vitaBalance.vitaPledged,
            reputation: vitaBalance.vitaEarned,
          }
        : null,
    )
  }

  const watchWallet = () => {
    if (!user) return () => {}

    const interval = setInterval(async () => {
      const txs = await getAddressTransactions(user.wallet.mainAddress)

      for (const tx of txs) {
        if (tx.isConfirmed) {
          const vita = Math.floor(tx.amount * 1000)
          await recordVita({
            type: 'donation',
            user: user.wallet.userVitaAddress,
            amount: vita,
            txHash: tx.txHash,
            description: 'Donación a proyecto',
          })

          await updateVitaBalance()
        }
      }
    }, 30000)

    return () => clearInterval(interval)
  }

  useEffect(() => {
    void refreshFromServer()
  }, [])

  return (
    <WalletAuthContext.Provider
      value={{
        user,
        loading,
        error,
        loginWithWallet,
        logout,
        updateProfile,
        updateVitaBalance,
        watchWallet,
      }}
    >
      {children}
    </WalletAuthContext.Provider>
  )
}

export function useWalletAuth() {
  const context = React.useContext(WalletAuthContext)
  if (!context) {
    throw new Error('useWalletAuth must be used within WalletAuthProvider')
  }
  return context
}
