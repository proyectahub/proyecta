import { useEffect, useCallback, useState } from 'react'
import { useMoneroBlockchain } from './useMoneroBlockchain'
import { useIPFSVita } from './useIPFSVita'
import { useWalletAuth } from '../context/WalletAuthContext'

interface BlockchainEvent {
  type: 'donation' | 'vita_created' | 'transaction_confirmed'
  projectId?: string
  amount: number
  txHash: string
  timestamp: number
}

export function useBlockchainMonitoring() {
  const { user, updateVitaBalance } = useWalletAuth()
  const { watchAddress, getAddressTransactions } = useMoneroBlockchain()
  const { recordVita } = useIPFSVita()
  
  const [events, setEvents] = useState<BlockchainEvent[]>([])
  const [monitoring, setMonitoring] = useState(false)
  const [lastTxHash, setLastTxHash] = useState<string | null>(null)

  const handleNewTransaction = useCallback(
    async (txHash: string, amount: number, projectId?: string) => {
      console.log(`[Blockchain] New transaction detected: ${txHash} - ${amount} XMR`)

      const event: BlockchainEvent = {
        type: 'donation',
        projectId,
        amount,
        txHash,
        timestamp: Date.now(),
      }

      setEvents((prev) => [event, ...prev])

      if (projectId) {
        const vita = Math.floor(amount * 1000)
        await recordVita({
          type: 'donation',
          user: user?.wallet.userVitaAddress || 'unknown',
          amount: vita,
          txHash,
          projectId,
          description: `Donacion a proyecto ${projectId}`,
        })

        await updateVitaBalance()

        setEvents((prev) =>
          [
            {
              type: 'vita_created',
              amount: vita,
              txHash,
              timestamp: Date.now(),
            },
            ...prev,
          ].slice(0, 100)
        )
      }
    },
    [user, recordVita, updateVitaBalance]
  )

  const startMonitoring = useCallback(
    (fundraisingAddress: string, projectId: string) => {
      if (!user) return () => {}

      console.log(`[Blockchain] Starting monitoring for ${fundraisingAddress}`)
      setMonitoring(true)

      const unwatch = watchAddress(
        fundraisingAddress,
        async (txs) => {
          for (const tx of txs) {
            if (tx.isConfirmed && tx.txHash !== lastTxHash) {
              setLastTxHash(tx.txHash)
              await handleNewTransaction(tx.txHash, tx.amount, projectId)
            }
          }
        },
        5000
      )

      return () => {
        unwatch()
        setMonitoring(false)
      }
    },
    [user, watchAddress, lastTxHash, handleNewTransaction]
  )

  return {
    events,
    monitoring,
    startMonitoring,
    lastTxHash,
  }
}
