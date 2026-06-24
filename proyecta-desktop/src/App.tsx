import { useState, useEffect } from 'react'
import { invoke } from '@tauri-apps/api/tauri'
import { Cpu, Play, Square, AlertCircle, TrendingUp } from 'lucide-react'
import './App.css'

interface MiningStats {
  is_running: boolean
  hashrate: string
  total_hashes: number
  shares_accepted: number
  shares_rejected: number
  pool_connected: boolean
}

export default function App() {
  const [wallet, setWallet] = useState('42gfB3ayxZV2VNH8KAsUMU5fcXUqd83BGJneR37KqJaBQuzYJ8w5d3aV5DBkFH2oWo9YzJLcjhv2d5dR4V2C2xFrUGKiePh')
  const [threads, setThreads] = useState(4)
  const [miningStats, setMiningStats] = useState<MiningStats>({
    is_running: false,
    hashrate: '0 H/s',
    total_hashes: 0,
    shares_accepted: 0,
    shares_rejected: 0,
    pool_connected: false,
  })
  const [systemInfo, setSystemInfo] = useState('')

  useEffect(() => {
    const loadSystemInfo = async () => {
      const info = await invoke<string>('get_system_info')
      setSystemInfo(info)
    }
    loadSystemInfo()

    // Poll mining status cada segundo
    const interval = setInterval(async () => {
      const stats = await invoke<MiningStats>('get_mining_status')
      setMiningStats(stats)
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const startMining = async () => {
    try {
      await invoke('start_mining', { wallet, threads })
      setMiningStats((s) => ({ ...s, is_running: true }))
    } catch (e) {
      alert(`Error: ${e}`)
    }
  }

  const stopMining = async () => {
    try {
      await invoke('stop_mining')
      setMiningStats((s) => ({ ...s, is_running: false }))
    } catch (e) {
      alert(`Error: ${e}`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3">
            <Cpu className="h-10 w-10 text-purple-400" />
            <h1 className="text-4xl font-black text-white">PROYECTA Mining</h1>
          </div>
          <p className="text-slate-300">Minería RandomX nativa con xmrig optimizado</p>
        </div>

        {/* Status Card */}
        <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-8 space-y-6 shadow-2xl">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-black bg-opacity-30 rounded-lg p-4">
              <p className="text-xs font-bold text-purple-200 uppercase">Hashrate</p>
              <p className="text-3xl font-black text-white mt-2">{miningStats.hashrate}</p>
            </div>
            <div className="bg-black bg-opacity-30 rounded-lg p-4">
              <p className="text-xs font-bold text-purple-200 uppercase">Hashes totales</p>
              <p className="text-3xl font-black text-white mt-2">
                {miningStats.total_hashes.toLocaleString()}
              </p>
            </div>
            <div className="bg-black bg-opacity-30 rounded-lg p-4">
              <p className="text-xs font-bold text-purple-200 uppercase">Shares válidos</p>
              <p className="text-3xl font-black text-emerald-300 mt-2">{miningStats.shares_accepted}</p>
            </div>
            <div className="bg-black bg-opacity-30 rounded-lg p-4">
              <p className="text-xs font-bold text-purple-200 uppercase">Estado</p>
              <p className={`text-lg font-bold mt-2 ${miningStats.is_running ? 'text-emerald-300' : 'text-amber-300'}`}>
                {miningStats.is_running ? '⛏️ Minando' : '⏸️ Detenido'}
              </p>
            </div>
          </div>

          {/* Connection Status */}
          <div className={`rounded-lg p-4 flex items-center gap-3 ${
            miningStats.pool_connected
              ? 'bg-emerald-500 bg-opacity-20 text-emerald-100'
              : 'bg-blue-500 bg-opacity-20 text-blue-100'
          }`}>
            <AlertCircle className="h-5 w-5" />
            <span className="font-bold">
              {miningStats.pool_connected ? '✅ Pool conectado' : '🔄 Esperando conexión'}
            </span>
          </div>
        </div>

        {/* Config Card */}
        <div className="bg-slate-800 rounded-xl p-6 space-y-6 border border-slate-700">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="h-6 w-6" />
            Configuración
          </h2>

          {/* Wallet */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-300">Dirección Monero</label>
            <input
              type="text"
              value={wallet}
              onChange={(e) => setWallet(e.target.value)}
              disabled={miningStats.is_running}
              className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 text-xs font-mono disabled:opacity-50"
            />
          </div>

          {/* Threads */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-slate-300">Hilos de minería</label>
              <span className="text-white font-bold">{threads}</span>
            </div>
            <input
              type="range"
              min="1"
              max="32"
              step="1"
              value={threads}
              onChange={(e) => setThreads(Number(e.target.value))}
              disabled={miningStats.is_running}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
            />
            <p className="text-xs text-slate-400">{systemInfo}</p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            {!miningStats.is_running ? (
              <button
                onClick={startMining}
                className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 text-white font-bold py-3 rounded-lg hover:bg-emerald-700 transition"
              >
                <Play className="h-5 w-5" />
                Comenzar minería
              </button>
            ) : (
              <button
                onClick={stopMining}
                className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition"
              >
                <Square className="h-5 w-5" />
                Detener minería
              </button>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="bg-slate-700 bg-opacity-50 rounded-lg p-4 text-sm text-slate-300 space-y-2">
          <p className="font-bold">💡 Información:</p>
          <ul className="space-y-1 list-disc list-inside text-xs">
            <li>Minería RandomX real usando xmrig compilado nativamente</li>
            <li>XMR se envía directamente a la dirección del proyecto</li>
            <li>Sigue minando incluso si cierras esta ventana</li>
            <li>Verifica en: <a href="https://supportxmr.com" target="_blank" rel="noopener" className="underline hover:text-white">supportxmr.com</a></li>
          </ul>
        </div>
      </div>
    </div>
  )
}
