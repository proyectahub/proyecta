import { useEffect, useState } from 'react'
import { invoke } from '@tauri-apps/api/tauri'
import {
  ArrowRight,
  BadgeCheck,
  BadgeInfo,
  Cpu,
  Gauge,
  HeartHandshake,
  Play,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Square,
  Wifi,
  Zap,
} from 'lucide-react'
import './App.css'
import { createRandomWorkerName, persistWorkerName, readStoredWorkerName } from './lib/workerName'
import { persistWallet, readStoredWallet } from './lib/wallet'

interface MiningStats {
  is_running: boolean
  hashrate: string
  total_hashes: number
  shares_accepted: number
  shares_rejected: number
  pool_connected: boolean
}

function splitHashrate(value: string) {
  const parts = value.trim().split(/\s+/)
  return {
    amount: parts[0] || '0',
    unit: parts.slice(1).join(' ') || 'H/s',
  }
}

export default function App() {
  const [wallet, setWallet] = useState(() => readStoredWallet())
  const [threads, setThreads] = useState(4)
  const [workerName, setWorkerName] = useState(() => readStoredWorkerName())
  const [notice, setNotice] = useState<string | null>(null)
  const [miningStats, setMiningStats] = useState<MiningStats>({
    is_running: false,
    hashrate: '0 H/s',
    total_hashes: 0,
    shares_accepted: 0,
    shares_rejected: 0,
    pool_connected: false,
  })
  const [systemInfo, setSystemInfo] = useState('Preparando la interfaz')

  useEffect(() => {
    const loadSystemInfo = async () => {
      try {
        const info = await invoke<string>('get_system_info')
        setSystemInfo(info)
      } catch {
        setSystemInfo('Sistema listo para minar')
      }
    }

    loadSystemInfo()

    const interval = setInterval(async () => {
      try {
        const stats = await invoke<MiningStats>('get_mining_status')
        setMiningStats(stats)
      } catch {
        setNotice('No se pudo leer el estado del minero.')
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const updateWorkerName = (value: string) => {
    const next = persistWorkerName(value)
    setWorkerName(next)
  }

  const updateWallet = (value: string) => {
    setWallet(value)
    persistWallet(value)
  }

  const startMining = async () => {
    const activeWallet = persistWallet(wallet)
    if (!activeWallet) {
      setNotice('Ingresa una dirección Monero antes de iniciar la minería.')
      return
    }

    try {
      setNotice(null)
      await invoke('start_mining', { wallet: activeWallet, threads, workerName })
      setMiningStats((state) => ({ ...state, is_running: true }))
    } catch {
      setNotice('No se pudo iniciar la minería. Verifica la instalación y vuelve a intentarlo.')
    }
  }

  const stopMining = async () => {
    try {
      setNotice(null)
      await invoke('stop_mining')
      setMiningStats((state) => ({ ...state, is_running: false }))
    } catch {
      setNotice('No se pudo detener la minería. Vuelve a intentarlo en unos segundos.')
    }
  }

  const hashrate = splitHashrate(miningStats.hashrate)
  const workerLabel = workerName || 'Sin nombre'

  return (
    <div className="app-shell">
      <div className="app-glow app-glow-a" />
      <div className="app-glow app-glow-b" />

      <main className="app-frame">
        <header className="hero-card">
          <div className="hero-copy">
            <div className="brand-pill">
              <Sparkles className="h-4 w-4" />
              <span>PROYECTA Miner</span>
            </div>
            <h1>Panel de minería</h1>
            <p>Configura tu equipo, identifica el worker y administra la actividad del proyecto.</p>

            <div className="hero-actions">
              <div className={`status-pill ${miningStats.is_running ? 'status-on' : 'status-off'}`}>
                {miningStats.is_running ? <BadgeCheck className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                <span>{miningStats.is_running ? 'Minería activa' : 'Lista para iniciar'}</span>
              </div>
              <div className="status-pill muted">
                <Wifi className="h-4 w-4" />
                <span>{miningStats.pool_connected ? 'Pool conectado' : 'Esperando pool'}</span>
              </div>
            </div>
          </div>

          <div className="hero-illustration" aria-hidden="true">
            <div className="orb orb-one" />
            <div className="orb orb-two" />
            <div className="hero-mini-card">
              <Cpu className="h-6 w-6" />
              <div>
                <p>Worker</p>
                <strong>{workerLabel}</strong>
              </div>
            </div>
            <div className="hero-mini-card hero-mini-card-bottom">
              <HeartHandshake className="h-6 w-6" />
              <div>
                <p>Proyecto</p>
                <strong>Financia ciencia</strong>
              </div>
            </div>
          </div>
        </header>

        <section className="stats-grid">
          <article className="stat-card stat-card-primary">
            <div className="stat-label">
              <Gauge className="h-4 w-4" />
              <span>Hashrate</span>
            </div>
            <div className="stat-value">
              <strong>{hashrate.amount}</strong>
              <span>{hashrate.unit}</span>
            </div>
            <p>{miningStats.is_running ? 'Minando RandomX en este momento.' : 'La app está lista para comenzar.'}</p>
          </article>

          <article className="stat-card">
            <div className="stat-label">
              <Zap className="h-4 w-4" />
              <span>Shares</span>
            </div>
            <div className="stat-value">
              <strong>{miningStats.shares_accepted}</strong>
              <span>aceptados</span>
            </div>
            <p>{miningStats.shares_rejected} rechazados</p>
          </article>

          <article className="stat-card">
            <div className="stat-label">
              <ArrowRight className="h-4 w-4" />
              <span>Totales</span>
            </div>
            <div className="stat-value">
              <strong>{miningStats.total_hashes.toLocaleString()}</strong>
              <span>hashes</span>
            </div>
            <p>{systemInfo}</p>
          </article>
        </section>

        <section className="panel-grid">
          <div className="panel panel-accent">
            <div className="panel-head">
              <div>
                <p className="panel-eyebrow">Identidad del worker</p>
                <h2>Nombre visible en pool y en la app</h2>
              </div>
              <button
                type="button"
                onClick={() => updateWorkerName(createRandomWorkerName())}
                className="inline-action"
              >
                <RefreshCw className="h-4 w-4" />
                Aleatorio
              </button>
            </div>

            <input
              type="text"
              value={workerName}
              onChange={(e) => updateWorkerName(e.target.value)}
              disabled={miningStats.is_running}
              className="input-field input-field-soft"
              maxLength={32}
            />
            <p className="helper-text">Se envía al pool como parte de la identidad de minería y queda guardado en esta instalación.</p>
          </div>

          <div className="panel">
            <div className="panel-head">
              <div>
                <p className="panel-eyebrow">Conexión</p>
                <h2>Wallet y hilos</h2>
              </div>
              <div className={`mini-chip ${miningStats.pool_connected ? 'mini-chip-good' : 'mini-chip-warn'}`}>
                {miningStats.pool_connected ? 'Pool listo' : 'Sin conexión'}
              </div>
            </div>

            <label className="field">
              <span>Dirección Monero</span>
              <input
                type="text"
                value={wallet}
                onChange={(e) => updateWallet(e.target.value)}
                disabled={miningStats.is_running}
                className="input-field"
                placeholder="Pega aquí la dirección Monero del proyecto"
                spellCheck={false}
              />
              <p className="helper-text active-destination">
                Identidad enviada al pool: {wallet}.{workerLabel}
              </p>
            </label>

            <label className="field">
              <div className="field-row">
                <span>Hilos de CPU</span>
                <strong>{threads}</strong>
              </div>
              <input
                type="range"
                min="1"
                max="32"
                step="1"
                value={threads}
                onChange={(e) => setThreads(Number(e.target.value))}
                disabled={miningStats.is_running}
                className="slider"
              />
              <p className="helper-text">{systemInfo || 'Más hilos puede significar más calor y consumo.'}</p>
            </label>

            <div className="callout callout-soft">
              <BadgeInfo className="h-5 w-5" />
              <div>
                <strong>Tip rápido</strong>
                <p>Si quieres un nombre limpio para cada instalación, usa el botón aleatorio y se guardará por equipo.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="control-panel">
          <div className="control-copy">
            <p className="panel-eyebrow">Acción principal</p>
            <h2>{miningStats.is_running ? 'Minería en ejecución' : 'Listo para arrancar'}</h2>
            <p>
              Los XMR van directo a la dirección del proyecto. La interfaz se mantiene simple, pero ya con las opciones nuevas activas.
            </p>
          </div>

          <div className="control-actions">
            {!miningStats.is_running ? (
              <button onClick={startMining} className="primary-button primary-button-start">
                <Play className="h-5 w-5" />
                Iniciar minería
              </button>
            ) : (
              <button onClick={stopMining} className="primary-button primary-button-stop">
                <Square className="h-5 w-5" />
                Detener minería
              </button>
            )}
          </div>

          <div className="footer-strip">
            <div className="footer-chip">
              <ShieldCheck className="h-4 w-4" />
              <span>xmrig nativo</span>
            </div>
            <div className="footer-chip">
              <Cpu className="h-4 w-4" />
              <span>{threads} hilos configurados</span>
            </div>
            <div className="footer-chip">
              <HeartHandshake className="h-4 w-4" />
              <span>{workerLabel}</span>
            </div>
          </div>

          <div className="notice-grid">
            <div className="notice-box">
              <p className="notice-title">Funcionamiento</p>
              <p>La minería sigue en segundo plano aunque cierres esta ventana.</p>
            </div>
            <div className="notice-box notice-box-warn">
              <p className="notice-title">Antivirus</p>
              <p>Algunos antivirus marcan mineros por heurística. Si lo bloquea, agrégalo a excepciones.</p>
            </div>
          </div>

          {notice ? (
            <div className="notice-banner">
              <BadgeInfo className="h-4 w-4" />
              <span>{notice}</span>
            </div>
          ) : null}
        </section>
      </main>
    </div>
  )
}
