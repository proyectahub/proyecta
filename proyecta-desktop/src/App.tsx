import { useState, useEffect } from 'react'
import { invoke } from '@tauri-apps/api/tauri'
import { Cpu, Play, Square, AlertCircle, TrendingUp } from 'lucide-react'
import './App.css'
import { createRandomWorkerName, persistWorkerName, readStoredWorkerName } from './lib/workerName'

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
  const [workerName, setWorkerName] = useState(() => readStoredWorkerName())
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

    const interval = setInterval(async () => {
      const stats = await invoke<MiningStats>('get_mining_status')
      setMiningStats(stats)
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const startMining = async () => {
    try {
      await invoke('start_mining', { wallet, threads, workerName })
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

  const updateWorkerName = (value: string) => {
    const next = persistWorkerName(value)
    setWorkerName(next)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="mx-auto max-w-2xl space-y-8">
        <div className="space-y-2 text-center">
          <div className="flex items-center justify-center gap-3">
            <Cpu className="h-10 w-10 text-purple-400" />
            <h1 className="text-4xl font-black text-white">PROYECTA Mining</h1>
          </div>
          <p className="text-slate-300">Minería RandomX nativa con xmrig optimizado</p>
        </div>

        <div className="space-y-6 rounded-xl bg-gradient-to-br from-purple-600 to-purple-700 p-8 shadow-2xl">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-black bg-opacity-30 p-4">
              <p className="text-xs font-bold uppercase text-purple-200">Hashrate</p>
              <p className="mt-2 text-3xl font-black text-white">{miningStats.hashrate}</p>
            </div>
            <div className="rounded-lg bg-black bg-opacity-30 p-4">
              <p className="text-xs font-bold uppercase text-purple-200">Hashes totales</p>
              <p className="mt-2 text-3xl font-black text-white">{miningStats.total_hashes.toLocaleString()}</p>
            </div>
            <div className="rounded-lg bg-black bg-opacity-30 p-4">
              <p className="text-xs font-bold uppercase text-purple-200">Shares validos</p>
              <p className="mt-2 text-3xl font-black text-emerald-300">{miningStats.shares_accepted}</p>
            </div>
            <div className="rounded-lg bg-black bg-opacity-30 p-4">
              <p className="text-xs font-bold uppercase text-purple-200">Estado</p>
              <p className={`mt-2 text-lg font-bold ${miningStats.is_running ? 'text-emerald-300' : 'text-amber-300'}`}>
                {miningStats.is_running ? '⛏️ Minando' : '⏸️ Detenido'}
              </p>
            </div>
          </div>

          <div className={`flex items-center gap-3 rounded-lg p-4 ${miningStats.pool_connected ? 'bg-emerald-500 bg-opacity-20 text-emerald-100' : 'bg-blue-500 bg-opacity-20 text-blue-100'}`}>
            <AlertCircle className="h-5 w-5" />
            <span className="font-bold">{miningStats.pool_connected ? '✅ Pool conectado' : '🔄 Esperando conexión'}</span>
          </div>
        </div>

        <div className="space-y-6 rounded-xl border border-slate-700 bg-slate-800 p-6">
          <h2 className="flex items-center gap-2 text-xl font-bold text-white">
            <TrendingUp className="h-6 w-6" />
            Configuración
          </h2>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-300">Dirección Monero</label>
            <input
              type="text"
              value={wallet}
              onChange={(e) => setWallet(e.target.value)}
              disabled={miningStats.is_running}
              className="w-full rounded-lg bg-slate-700 px-4 py-2 font-mono text-xs text-white disabled:opacity-50"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-300">Hilos de minería</label>
              <span className="font-bold text-white">{threads}</span>
            </div>
            <input
              type="range"
              min="1"
              max="32"
              step="1"
              value={threads}
              onChange={(e) => setThreads(Number(e.target.value))}
              disabled={miningStats.is_running}
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-700 disabled:opacity-50"
            />
            <p className="text-xs text-slate-400">{systemInfo}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-300">Worker name</label>
              <button
                type="button"
                onClick={() => updateWorkerName(createRandomWorkerName())}
                className="text-xs font-bold text-purple-300 hover:text-white"
              >
                Aleatorio
              </button>
            </div>
            <input
              type="text"
              value={workerName}
              onChange={(e) => updateWorkerName(e.target.value)}
              disabled={miningStats.is_running}
              className="w-full rounded-lg bg-slate-700 px-4 py-2 font-mono text-xs text-white disabled:opacity-50"
              maxLength={32}
            />
            <p className="text-xs text-slate-400">Se envia a xmrig como rig-id y queda guardado en esta instalacion.</p>
          </div>

          <div className="flex gap-3 pt-4">
            {!miningStats.is_running ? (
              <button
                onClick={startMining}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-600 py-3 font-bold text-white transition hover:bg-emerald-700"
              >
                <Play className="h-5 w-5" />
                Comenzar minería
              </button>
            ) : (
              <button
                onClick={stopMining}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 py-3 font-bold text-white transition hover:bg-red-700"
              >
                <Square className="h-5 w-5" />
                Detener minería
              </button>
            )}
          </div>
        </div>

        <div className="space-y-2 rounded-lg bg-slate-700 bg-opacity-50 p-4 text-sm text-slate-300">
          <p className="font-bold">💡 Información:</p>
          <ul className="list-inside list-disc space-y-1 text-xs">
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
