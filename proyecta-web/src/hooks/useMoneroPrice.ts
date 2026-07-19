import { useState, useEffect } from 'react'

const COINGECKO_API = 'https://api.coingecko.com/api/v3'
const CACHE_KEY = 'proyecta_xmr_price'
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

export function useMoneroPrice() {
  const [xmrPrice, setXmrPrice] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPrice = async () => {
      setLoading(true)
      setError(null)

      try {
        const cached = localStorage.getItem(CACHE_KEY)
        if (cached) {
          try {
            const { price, timestamp } = JSON.parse(cached)
            if (Number.isFinite(price) && price > 0 && Number.isFinite(timestamp) && Date.now() - timestamp < CACHE_DURATION) {
              setXmrPrice(price)
              setLoading(false)
              return
            }
          } catch {
            localStorage.removeItem(CACHE_KEY)
          }
        }

        const response = await fetch(
          `${COINGECKO_API}/simple/price?ids=monero&vs_currencies=usd`
        )

        if (!response.ok) throw new Error('Failed to fetch XMR price')

        const data = await response.json()
        const price = Number(data.monero?.usd)
        if (!Number.isFinite(price) || price <= 0) throw new Error('Respuesta de cotización XMR inválida')

        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({ price, timestamp: Date.now() })
        )

        setXmrPrice(price)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
        setXmrPrice(null)
      } finally {
        setLoading(false)
      }
    }

    fetchPrice()
    const interval = setInterval(fetchPrice, 60000)

    return () => clearInterval(interval)
  }, [])

  return { xmrPrice, loading, error }
}
