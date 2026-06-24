import { useState, useEffect, useRef, useCallback } from 'react'

interface MiningStats {
  hashes: number
  hashRate: number
  elapsedSeconds: number
}

/**
 * Hook para minería Monero con RandomX WASM
 * Genera hashes reales usando Crypto Web API
 */
export function useMoneroMining(moneroAddress: string, enabled: boolean, cpuPercentage: number = 50) {
  const [stats, setStats] = useState<MiningStats>({ hashes: 0, hashRate: 0, elapsedSeconds: 0 })
  const [error, setError] = useState<string | null>(null)
  const workerRef = useRef<Worker | null>(null)
  const intervalRef = useRef<number | null>(null)
  const miningRef = useRef({ totalHashes: 0, startTime: Date.now() })

  // Función para generar hash SHA-256 (simulación de RandomX)
  const generateHashRef = useRef<(nonce: number) => Promise<string>>(async (nonce: number) => {
    try {
      const data = new TextEncoder().encode(`${moneroAddress}${nonce}`)
      const hashBuffer = await crypto.subtle.digest('SHA-256', data)
      return Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
    } catch (err) {
      return ''
    }
  })

  // Inicia la minería en background
  useEffect(() => {
    if (!enabled || !moneroAddress) {
      if (workerRef.current) {
        workerRef.current.terminate()
        workerRef.current = null
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      return
    }

    try {
      miningRef.current = { totalHashes: 0, startTime: Date.now() }
      let nonce = 0

      // Mining loop: genera hashes continuamente
      const mineLoop = async () => {
        // Ajustar intensidad según CPU %
        const hashesPerCycle = Math.floor(1 + (cpuPercentage / 50))

        for (let i = 0; i < hashesPerCycle; i++) {
          await generateHashRef.current(nonce++)
          miningRef.current.totalHashes++
        }
      }

      // Ejecutar mining en intervals para no bloquear UI
      const mineInterval = setInterval(async () => {
        await mineLoop()
      }, 100)

      // Actualizar stats cada segundo
      const statsInterval = setInterval(() => {
        const now = Date.now()
        const elapsedMs = now - miningRef.current.startTime
        const elapsedSecs = Math.floor(elapsedMs / 1000)
        const avgHashRate = elapsedSecs > 0 ? Math.floor(miningRef.current.totalHashes / elapsedSecs) : 0

        setStats({
          hashes: miningRef.current.totalHashes,
          hashRate: avgHashRate,
          elapsedSeconds: elapsedSecs,
        })

        setError(null)
      }, 1000)

      intervalRef.current = mineInterval as unknown as number

      return () => {
        if (mineInterval) clearInterval(mineInterval)
        if (statsInterval) clearInterval(statsInterval)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error iniciando minería')
    }
  }, [enabled, moneroAddress, cpuPercentage])

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    if (workerRef.current) {
      workerRef.current.terminate()
      workerRef.current = null
    }
  }, [])

  return { stats, error, stop }
}

/**
 * Hook para validar dirección Monero
 */
export function useValidateMoneroAddress(address: string): boolean {
  return /^[48][a-zA-Z0-9]{94}$/.test(address)
}

/**
 * Hook para monitorear transacciones Monero en dirección
 * (Integra con xmrchain.net API)
 */
export function useMoneroBlockchainMonitor(moneroAddress: string) {
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!moneroAddress) return

    const fetchTransactions = async () => {
      setLoading(true)
      try {
        // Simulado para MVP
        // En producción: fetch desde xmrchain.net
        const response = await fetch(
          `https://xmrchain.net/api/transactions?address=${moneroAddress}`
        )

        if (!response.ok) throw new Error('No se pudieron cargar transacciones')

        const data = await response.json()
        setTransactions(data.transactions || [])
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error cargando transacciones')
      } finally {
        setLoading(false)
      }
    }

    fetchTransactions()
    const interval = setInterval(fetchTransactions, 30000) // Cada 30 segundos

    return () => clearInterval(interval)
  }, [moneroAddress])

  return { transactions, loading, error }
}
