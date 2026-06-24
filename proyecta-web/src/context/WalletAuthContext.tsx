import React, { createContext, useState, useEffect, ReactNode } from 'react'
import { useMoneroBlockchain } from '../hooks/useMoneroBlockchain'
import { useIPFSVita } from '../hooks/useIPFSVita'

export interface UserWallet {
  mainAddress: string // 95 chars - para recibir
  viewKey: string // View-only key (público, no revela dinero)
  userVitaAddress: string // Hash del mainAddress
  createdAt: number
}

export interface UserProfile {
  wallet: UserWallet
  orcidId?: string
  reputation: number // VITA earned
  vitaBacked: number // VITA convertido de XMR
  vitaEarned: number // VITA por contribuciones
  vitaPledged: number // VITA apoyando proyectos
}

interface WalletAuthContextType {
  user: UserProfile | null
  loading: boolean
  error: string | null

  // Acciones
  loginWithWallet: (mainAddress: string, viewKey: string) => Promise<void>
  logout: () => void
  updateVitaBalance: () => Promise<void>
  watchWallet: () => () => void
}

export const WalletAuthContext = createContext<WalletAuthContextType | null>(null)

export function WalletAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { isValidAddress, getAddressTransactions } = useMoneroBlockchain()
  const { loadUserVita, recordVita } = useIPFSVita()

  // Generar hash SHA-256 del wallet (para dirección VITA)
  const hashWallet = async (address: string): Promise<string> => {
    const encoder = new TextEncoder()
    const data = encoder.encode(address)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
  }

  // Login con wallet Monero
  const loginWithWallet = async (mainAddress: string, viewKey: string) => {
    setLoading(true)
    setError(null)

    try {
      // Validar dirección
      if (!isValidAddress(mainAddress)) {
        throw new Error('Dirección Monero inválida')
      }

      // Generar dirección VITA
      const userVitaAddress = await hashWallet(mainAddress)

      // Crear perfil
      const profile: UserProfile = {
        wallet: {
          mainAddress,
          viewKey,
          userVitaAddress,
          createdAt: Date.now(),
        },
        reputation: 0,
        vitaBacked: 0,
        vitaEarned: 0,
        vitaPledged: 0,
      }

      // Cargar VITA desde IPFS
      const vitaBalance = await loadUserVita(userVitaAddress)
      profile.vitaBacked = vitaBalance.vitaBacked
      profile.vitaEarned = vitaBalance.vitaEarned
      profile.vitaPledged = vitaBalance.vitaPledged
      profile.reputation = vitaBalance.vitaEarned

      // Guardar en localStorage
      localStorage.setItem('proyecta_wallet', JSON.stringify(profile))

      setUser(profile)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Login failed'
      setError(errorMsg)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Logout
  const logout = () => {
    setUser(null)
    localStorage.removeItem('proyecta_wallet')
  }

  // Actualizar balance de VITA
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
        : null
    )
  }

  // Monitorear transacciones de wallet
  const watchWallet = () => {
    if (!user) return () => {}

    // Observar cada 30 segundos
    const interval = setInterval(async () => {
      const txs = await getAddressTransactions(user.wallet.mainAddress)

      for (const tx of txs) {
        if (tx.isConfirmed) {
          // Crear VITA automáticamente
          const vita = Math.floor(tx.amount * 1000) // 1 XMR = 1000 VITA

          // Registrar en IPFS
          await recordVita({
            type: 'donation',
            user: user.wallet.userVitaAddress,
            amount: vita,
            txHash: tx.txHash,
            description: 'Donación a proyecto',
          })

          // Actualizar balance
          await updateVitaBalance()
        }
      }
    }, 30000)

    return () => clearInterval(interval)
  }

  // Cargar wallet desde localStorage al iniciar
  useEffect(() => {
    const saved = localStorage.getItem('proyecta_wallet')
    if (saved) {
      try {
        const profile = JSON.parse(saved)
        setUser(profile)
      } catch (err) {
        console.error('Error loading wallet:', err)
        localStorage.removeItem('proyecta_wallet')
      }
    }
  }, [])

  return (
    <WalletAuthContext.Provider
      value={{
        user,
        loading,
        error,
        loginWithWallet,
        logout,
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
