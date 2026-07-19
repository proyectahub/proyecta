import { useState, useEffect, useRef } from 'react'

export interface BlockchainTransaction {
  txHash: string
  amount: number // en XMR
  confirmations: number
  timestamp: number
  isConfirmed: boolean // 10+ confirmations
}

interface AddressInfo {
  totalReceived: number
  totalSent: number
  balance: number
  transactionCount: number
}

/**
 * Hook para monitorear dirección Monero en xmrchain.net
 * Verifica transacciones reales en la blockchain
 */
export function useBlockchainMonitor(moneroAddress: string, pollInterval: number = 30000) {
  const [transactions, setTransactions] = useState<BlockchainTransaction[]>([])
  const [addressInfo, setAddressInfo] = useState<AddressInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<number>(0)
  const pollRef = useRef<number | null>(null)

  const fetchAddressData = async () => {
    if (!moneroAddress) return

    setLoading(true)
    try {
      // Endpoint real de xmrchain.net
      const response = await fetch(
        `https://xmrchain.net/api/address/${moneroAddress}`,
        { mode: 'cors' }
      )

      if (!response.ok) throw new Error('No se pudieron cargar datos de la blockchain')

      const data = await response.json()

      // Procesar dirección
      if (data.data) {
        const addressData = data.data
        setAddressInfo({
          totalReceived: addressData.totalReceived || 0,
          totalSent: addressData.totalSent || 0,
          balance: addressData.balance || 0,
          transactionCount: addressData.transactionCount || 0,
        })
      }

      // Procesar transacciones
      if (data.data?.transactions) {
        const txs = (data.data.transactions as any[]).map((tx) => ({
          txHash: tx.txHash || tx.hash,
          amount: (tx.amount || 0) / 1e12, // Convertir de piconero a XMR
          confirmations: tx.confirmations || 0,
          timestamp: tx.timestamp || Date.now(),
          isConfirmed: (tx.confirmations || 0) >= 10,
        }))

        setTransactions(txs)
      }

      setError(null)
      setLastUpdate(Date.now())
    } catch (err) {
      setTransactions([])
      setAddressInfo(null)
      setError(err instanceof Error ? err.message : 'No se pudieron cargar datos de la blockchain')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAddressData()

    // Polling automático
    pollRef.current = window.setInterval(() => {
      fetchAddressData()
    }, pollInterval)

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current)
      }
    }
  }, [moneroAddress, pollInterval])

  return {
    transactions,
    addressInfo,
    loading,
    error,
    lastUpdate,
    refetch: fetchAddressData,
  }
}

/**
 * Hook para contar minadores activos por proyecto
 */
export function useActiveMinerCount(projectId: string) {
  const [activeMiners, setActiveMiners] = useState(0)
  const [minerHistory, setMinerHistory] = useState<Array<{ timestamp: number; count: number }>>([])

  useEffect(() => {
    // Simulación: leer de localStorage cuántos minadores están activos
    const checkActiveMiners = () => {
      try {
        const sessions = JSON.parse(localStorage.getItem(`active_mining_sessions`) || '{}')
        const count = Object.keys(sessions).filter(
          (id) => sessions[id].projectId === projectId && Date.now() - sessions[id].lastActive < 60000
        ).length

        setActiveMiners(count)

        // Agregar al histórico
        setMinerHistory((prev) => [
          ...prev.slice(-95), // Mantener últimos 96 puntos
          { timestamp: Date.now(), count },
        ])
      } catch (err) {
        console.error('Unable to read active mining sessions:', err)
        setActiveMiners(0)
      }
    }

    checkActiveMiners()
    const interval = setInterval(checkActiveMiners, 5000) // Cada 5 segundos

    return () => clearInterval(interval)
  }, [projectId])

  return { activeMiners, minerHistory }
}

/**
 * Hook para registrar sesión de minería activa
 */
export function useRegisterMiningSession(projectId: string, enabled: boolean) {
  const sessionIdRef = useRef(Math.random().toString(36))

  useEffect(() => {
    if (!enabled) return

    const interval = setInterval(() => {
      const sessions = JSON.parse(localStorage.getItem('active_mining_sessions') || '{}')
      sessions[sessionIdRef.current] = {
        projectId,
        startedAt: Date.now(),
        lastActive: Date.now(),
      }
      localStorage.setItem('active_mining_sessions', JSON.stringify(sessions))
    }, 10000) // Actualizar cada 10 segundos

    return () => {
      clearInterval(interval)
      const sessions = JSON.parse(localStorage.getItem('active_mining_sessions') || '{}')
      delete sessions[sessionIdRef.current]
      localStorage.setItem('active_mining_sessions', JSON.stringify(sessions))
    }
  }, [enabled, projectId])
}
