import { useEffect, useState } from 'react'
import { TrendingUp, Users, Zap, CheckCircle } from 'lucide-react'
import { useBlockchainMonitor, useActiveMinerCount, useRegisterMiningSession } from '../hooks/useBlockchainMonitor'

interface MiningMonitorProps {
  projectId: string
  projectMoneroAddress: string
  miningEnabled: boolean
  localHashes: number
  localHashRate: number
}

export function MiningMonitor({
  projectId,
  projectMoneroAddress,
  miningEnabled,
  localHashes,
  localHashRate,
}: MiningMonitorProps) {
  const { transactions, addressInfo, lastUpdate } = useBlockchainMonitor(projectMoneroAddress)
  const { activeMiners, minerHistory } = useActiveMinerCount(projectId)

  // Registrar sesión de minería activa
  useRegisterMiningSession(projectId, miningEnabled)

  const [timeAgo, setTimeAgo] = useState('hace poco')

  useEffect(() => {
    const updateTimeAgo = () => {
      if (!lastUpdate) return
      const seconds = Math.floor((Date.now() - lastUpdate) / 1000)
      if (seconds < 60) setTimeAgo('hace ' + seconds + 's')
      else if (seconds < 3600) setTimeAgo('hace ' + Math.floor(seconds / 60) + 'm')
      else setTimeAgo('hace ' + Math.floor(seconds / 3600) + 'h')
    }

    updateTimeAgo()
    const interval = setInterval(updateTimeAgo, 5000)
    return () => clearInterval(interval)
  }, [lastUpdate])

  const confirmedTransactions = transactions.filter((t) => t.isConfirmed)
  const totalXMRReceived = transactions.reduce((sum, t) => sum + t.amount, 0)

  return (
    <div className="space-y-6">
      {/* Resumen en Tiempo Real */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Minadores Activos */}
        <div className="nova-card p-4 bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-blue-600 font-bold uppercase">Minadores Activos</p>
              <p className="text-3xl font-black text-blue-900 mt-1">{activeMiners}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600 opacity-50" />
          </div>
        </div>

        {/* Hashes Locales */}
        <div className="nova-card p-4 bg-gradient-to-br from-purple-50 to-purple-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-purple-600 font-bold uppercase">Mis Hashes</p>
              <p className="text-3xl font-black text-purple-900 mt-1">{localHashes.toLocaleString()}</p>
              <p className="text-xs text-purple-700 mt-1">{localHashRate} H/s</p>
            </div>
            <Zap className="h-8 w-8 text-purple-600 opacity-50" />
          </div>
        </div>

        {/* XMR Recibido en Blockchain */}
        <div className="nova-card p-4 bg-gradient-to-br from-emerald-50 to-emerald-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-emerald-600 font-bold uppercase">XMR en Blockchain</p>
              <p className="text-3xl font-black text-emerald-900 mt-1">{totalXMRReceived.toFixed(3)}</p>
              <p className="text-xs text-emerald-700 mt-1">${(totalXMRReceived * 180).toFixed(0)} USD</p>
            </div>
            <CheckCircle className="h-8 w-8 text-emerald-600 opacity-50" />
          </div>
        </div>

        {/* Transacciones Confirmadas */}
        <div className="nova-card p-4 bg-gradient-to-br from-amber-50 to-amber-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-amber-600 font-bold uppercase">Transacciones</p>
              <p className="text-3xl font-black text-amber-900 mt-1">{confirmedTransactions.length}</p>
              <p className="text-xs text-amber-700 mt-1">confirmadas</p>
            </div>
            <TrendingUp className="h-8 w-8 text-amber-600 opacity-50" />
          </div>
        </div>
      </div>

      {/* Transacciones Blockchain */}
      <div className="nova-card p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-slate-900">📊 Transacciones en Blockchain</h3>
          <p className="text-xs text-slate-500">{timeAgo}</p>
        </div>

        {transactions.length === 0 ? (
          <div className="bg-slate-50 rounded-lg p-6 text-center text-slate-600">
            <p>No hay transacciones aún en esta dirección.</p>
            <p className="text-xs mt-2">Las donaciones aparecerán aquí cuando se confirmen.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((tx, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border-l-4 border-blue-600">
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-xs text-slate-700 truncate">{tx.txHash}</p>
                  <div className="flex gap-4 mt-1 text-xs text-slate-600">
                    <span>
                      {new Date(tx.timestamp).toLocaleDateString()} {new Date(tx.timestamp).toLocaleTimeString()}
                    </span>
                    <span>
                      {tx.confirmations < 10 ? (
                        <span className="text-amber-600 font-bold">{tx.confirmations} confirmaciones</span>
                      ) : (
                        <span className="text-emerald-600 font-bold">✓ Confirmado</span>
                      )}
                    </span>
                  </div>
                </div>
                <div className="text-right ml-4">
                  <p className="font-bold text-lg text-blue-600">{tx.amount.toFixed(4)} XMR</p>
                  <p className="text-xs text-slate-600">${(tx.amount * 180).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Información de Verificación */}
      <div className="nova-card p-6 bg-blue-50 border-2 border-blue-200 space-y-3">
        <h3 className="font-bold text-blue-900">🔍 Cómo Verificar tu Minería</h3>
        <ol className="space-y-2 text-sm text-blue-900 list-decimal list-inside">
          <li>
            Copia tu dirección:{' '}
            <code className="bg-white px-2 py-1 rounded text-xs font-mono break-all">{projectMoneroAddress}</code>
          </li>
          <li>
            Ve a{' '}
            <a href="https://xmrchain.net" target="_blank" rel="noopener noreferrer" className="underline font-bold">
              xmrchain.net
            </a>{' '}
            y pega la dirección
          </li>
          <li>Verás todas las transacciones recibidas en tiempo real (públicamente auditable)</li>
          <li>Las transacciones con 10+ confirmaciones generan VITA automáticamente</li>
        </ol>
      </div>

      {/* Minadores Activos Histórico */}
      {minerHistory.length > 0 && (
        <div className="nova-card p-6 space-y-4">
          <h3 className="text-xl font-bold text-slate-900">👥 Histórico de Minadores Activos</h3>
          <div className="h-40 bg-slate-50 rounded-lg p-4 relative">
            <p className="text-xs text-slate-600 mb-2">Últimas 8 horas (actualizado cada 5s)</p>
            <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
              {minerHistory.map((entry, idx) => {
                const x = (idx / minerHistory.length) * 100
                const y = 100 - Math.min(entry.count, 10) * 10
                return <circle key={idx} cx={x} cy={y} r="1" fill="#8b5cf6" />
              })}
            </svg>
          </div>
          <p className="text-xs text-slate-600 text-center">
            Máximo de minadores simultáneos: {Math.max(...minerHistory.map((h) => h.count), 0)}
          </p>
        </div>
      )}
    </div>
  )
}
