import { useEffect, useState } from 'react'
import { useIPFSVita } from '../hooks/useIPFSVita'
import { useMoneroPrice } from '../hooks/useMoneroPrice'

export function TrustDashboard() {
  const { getTotalVitaInSystem } = useIPFSVita()
  const { xmrPrice } = useMoneroPrice()
  const [totalVita, setTotalVita] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadTotalVita = async () => {
      setLoading(true)
      const total = await getTotalVitaInSystem()
      setTotalVita(total)
      setLoading(false)
    }

    loadTotalVita()
    const interval = setInterval(loadTotalVita, 60000) // Actualizar cada minuto

    return () => clearInterval(interval)
  }, [getTotalVitaInSystem])

  const vitaUsdValue = (totalVita / 1000) * xmrPrice

  return (
    <div className="space-y-6">
      {/* Resumen de confianza */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* XMR en circulación */}
        <div className="nova-card p-6 bg-gradient-to-br from-blue-50 to-cyan-50">
          <h3 className="font-bold text-blue-900 mb-3">💰 XMR en PROYECTA</h3>

          <p className="text-3xl font-bold text-blue-600">
            {(totalVita / 1000).toFixed(2)} <span className="text-sm">XMR</span>
          </p>

          <p className="text-sm text-blue-700 mt-2">
            = ${vitaUsdValue.toFixed(0)} USD
          </p>

          <p className="text-xs text-blue-600 mt-3">
            Respaldado 100% en blockchain Monero
          </p>
        </div>

        {/* VITA creado */}
        <div className="nova-card p-6 bg-gradient-to-br from-purple-50 to-pink-50">
          <h3 className="font-bold text-purple-900 mb-3">⚡ VITA Creado</h3>

          <p className="text-3xl font-bold text-purple-600">
            {totalVita.toLocaleString()}
          </p>

          <p className="text-sm text-purple-700 mt-2">
            En {loading ? '...' : 'proyectos activos'}
          </p>

          <p className="text-xs text-purple-600 mt-3">
            1 XMR = 1,000 VITA
          </p>
        </div>

        {/* Precio XMR */}
        <div className="nova-card p-6 bg-gradient-to-br from-amber-50 to-orange-50">
          <h3 className="font-bold text-amber-900 mb-3">📊 Precio XMR</h3>

          <p className="text-3xl font-bold text-amber-600">
            ${xmrPrice.toFixed(2)}
          </p>

          <p className="text-sm text-amber-700 mt-2">
            Por 1 XMR
          </p>

          <p className="text-xs text-amber-600 mt-3">
            Actualizado en tiempo real
          </p>
        </div>
      </div>

      {/* Auditoría pública */}
      <div className="nova-card p-6">
        <h3 className="font-bold text-lg mb-4">🔍 Auditoría Pública (En vivo)</h3>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Verificación en Monero */}
            <div className="bg-blue-50 rounded-lg p-4 space-y-2">
              <p className="font-bold text-blue-900">Blockchain Monero</p>
              <p className="text-sm text-blue-700">
                Todas las transacciones son públicas y verificables en tiempo real
              </p>
              <a
                href="https://xmrchain.net"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 text-sm underline"
              >
                Explorador Monero →
              </a>
            </div>

            {/* IPFS Registros */}
            <div className="bg-purple-50 rounded-lg p-4 space-y-2">
              <p className="font-bold text-purple-900">IPFS Logs</p>
              <p className="text-sm text-purple-700">
                Todos los registros de VITA se almacenan en IPFS (inmutable y público)
              </p>
              <code className="text-xs bg-white px-2 py-1 rounded font-mono text-purple-600">
                Qm... (hash IPFS)
              </code>
            </div>
          </div>

          {/* Cadena de confianza */}
          <div className="space-y-3 mt-6">
            <p className="font-bold text-slate-900">Cadena de confianza:</p>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                  1
                </div>
                <span>
                  Usuario envía XMR a dirección pública del proyecto (blockchain)
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold">
                  2
                </div>
                <span>
                  PROYECTA verifica la transacción (10+ confirmaciones)
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                  3
                </div>
                <span>
                  Sistema crea VITA automáticamente (100% backed por XMR)
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs font-bold">
                  4
                </div>
                <span>
                  Registro en IPFS (público, inmutable, verificable)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Seguridad radical */}
      <div className="nova-card p-6 bg-emerald-50 border-2 border-emerald-300">
        <h3 className="font-bold text-emerald-900 mb-4">🔐 Seguridad radical = Sin custodia</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-emerald-800">
          <div>
            <p className="font-bold mb-2">✅ Lo que es seguro:</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Tu XMR está en blockchain</li>
              <li>PROYECTA no toca fondos</li>
              <li>Auditoría 100% pública</li>
              <li>Sin intermediarios</li>
            </ul>
          </div>

          <div>
            <p className="font-bold mb-2">⚠️ Tu responsabilidad:</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Proteger tu wallet privada</li>
              <li>Verificar direcciones públicas</li>
              <li>No confíes en PROYECTA, confía en blockchain</li>
            </ul>
          </div>
        </div>

        <p className="text-xs text-emerald-700 mt-4 italic">
          "No confíes, verifica" — todos los números en esta página son públicamente auditables
        </p>
      </div>
    </div>
  )
}
