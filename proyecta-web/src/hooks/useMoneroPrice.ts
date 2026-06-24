import { useState, useEffect } from 'react'

const COINGECKO_API = 'https://api.coingecko.com/api/v3'
const CACHE_KEY = 'proyecta_xmr_price'
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

export function useMoneroPrice() {
  const [xmrPrice, setXmrPrice] = useState(316.12)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPrice = async () => {
      setLoading(true)
      setError(null)

      try {
        // Verificar cache
        const cached = localStorage.getItem(CACHE_KEY)
        if (cached) {
          const { price, timestamp } = JSON.parse(cached)
          if (Date.now() - timestamp < CACHE_DURATION) {
            setXmrPrice(price)
            setLoading(false)
            return
          }
        }

        // Fetchar precio desde CoinGecko
        const response = await fetch(
          `${COINGECKO_API}/simple/price?ids=monero&vs_currencies=usd`
        )

        if (!response.ok) throw new Error('Failed to fetch XMR price')

        const data = await response.json()
        const price = data.monero?.usd || 316.12

        // Guardar en cache
        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({ price, timestamp: Date.now() })
        )

        setXmrPrice(price)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
        // Usar precio por defecto si falla
      } finally {
        setLoading(false)
      }
    }

    fetchPrice()
    const interval = setInterval(fetchPrice, 60000) // Actualizar cada minuto

    return () => clearInterval(interval)
  }, [])

  return { xmrPrice, loading, error }
}
