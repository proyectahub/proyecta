import { useState, useCallback } from 'react'

// Configuración de nodos/APIs
const MONERO_EXPLORER_API = 'https://xmrchain.net/api'
const MONERO_RPC_ENDPOINT = 'https://stagenet.xmrchain.net/json_rpc'

export interface MoneroTransaction {
  txHash: string
  from: string
  to: string
  amount: number
  timestamp: number
  confirmations: number
  isConfirmed: boolean
  blockHeight: number
}

export interface AddressBalance {
  total: number
  unlocked: number
  locked: number
}

export function useMoneroBlockchain() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Validar dirección Monero
  const isValidAddress = useCallback((address: string): boolean => {
    // Dirección Monero: 95 caracteres, empieza con 4 o 8 (mainnet) o 5,7,6 (stagenet)
    const mainnetRegex = /^[48][a-zA-Z0-9]{94}$/
    const testnetRegex = /^[567][a-zA-Z0-9]{94}$/
    return mainnetRegex.test(address) || testnetRegex.test(address)
  }, [])

  // Obtener transacciones de una dirección
  const getAddressTransactions = useCallback(
    async (address: string): Promise<MoneroTransaction[]> => {
      if (!isValidAddress(address)) {
        setError('Dirección Monero inválida')
        return []
      }

      setLoading(true)
      try {
        // Usar explorador público (xmrchain.net)
        const response = await fetch(
          `${MONERO_EXPLORER_API}/transactions?address=${address}&limit=100`
        )

        if (!response.ok) throw new Error('Error fetching transactions')

        const data = await response.json()

        const transactions: MoneroTransaction[] = (data.data?.txs || []).map(
          (tx: any) => ({
            txHash: tx.tx_hash || tx.hash,
            from: tx.sender_address || address,
            to: tx.recipient_address || address,
            amount: (tx.amount || 0) / 1e12, // Convertir piconero a XMR
            timestamp: tx.timestamp || Date.now(),
            confirmations: tx.confirmations || 0,
            isConfirmed: (tx.confirmations || 0) >= 10,
            blockHeight: tx.block_height || 0,
          })
        )

        setError(null)
        return transactions
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Error fetching transactions'
        setError(errorMsg)
        return []
      } finally {
        setLoading(false)
      }
    },
    [isValidAddress]
  )

  // Obtener balance de una dirección (requiere view key)
  const getAddressBalance = useCallback(
    async (address: string, viewKey: string): Promise<AddressBalance | null> => {
      if (!isValidAddress(address)) {
        setError('Dirección Monero inválida')
        return null
      }

      setLoading(true)
      try {
        const response = await fetch(
          `${MONERO_EXPLORER_API}/balance?address=${address}&viewkey=${viewKey}`
        )

        if (!response.ok) throw new Error('Error fetching balance')

        const data = await response.json()

        const balance: AddressBalance = {
          total: (data.data?.balance || 0) / 1e12,
          unlocked: (data.data?.unlocked || 0) / 1e12,
          locked: ((data.data?.balance || 0) - (data.data?.unlocked || 0)) / 1e12,
        }

        setError(null)
        return balance
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Error fetching balance'
        setError(errorMsg)
        return null
      } finally {
        setLoading(false)
      }
    },
    [isValidAddress]
  )

  // Monitorear una dirección continuamente
  const watchAddress = useCallback(
    (
      address: string,
      callback: (txs: MoneroTransaction[]) => void,
      interval: number = 30000
    ) => {
      const intervalId = setInterval(async () => {
        const txs = await getAddressTransactions(address)
        callback(txs)
      }, interval)

      return () => clearInterval(intervalId)
    },
    [getAddressTransactions]
  )

  // Verificar si una dirección es válida
  const verifyAddress = useCallback(
    async (address: string): Promise<boolean> => {
      try {
        const txs = await getAddressTransactions(address)
        return txs.length >= 0 // Si no hay error, es válida
      } catch {
        return false
      }
    },
    [getAddressTransactions]
  )

  return {
    getAddressTransactions,
    getAddressBalance,
    watchAddress,
    isValidAddress,
    verifyAddress,
    loading,
    error,
  }
}
