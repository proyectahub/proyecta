import { useRef, useState } from 'react'
import { Cpu, CheckCircle2, XCircle, Square } from 'lucide-react'

/**
 * Auto-prueba de RandomX 100% LOCAL (sin pool, sin red), MULTI-HILO.
 *
 * Demuestra que el navegador calcula hashes RandomX REALES usando todos los
 * núcleos elegidos:
 *  - Verifica el vector de prueba oficial de tevador/RandomX
 *  - Mide el hashrate real agregado del equipo
 *
 * Útil cuando la red bloquea el Stratum del pool: aquí se ve que el
 * proof-of-work es auténtico, aunque no se puedan enviar shares al pool.
 */
export function RandomXSelfTest() {
  const maxCores = typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || 4 : 4
  const [threads, setThreads] = useState(Math.max(1, Math.min(4, maxCores)))
  const [running, setRunning] = useState(false)
  const [hashRate, setHashRate] = useState(0)
  const [totalHashes, setTotalHashes] = useState(0)
  const [status, setStatus] = useState('')
  const [selfTest, setSelfTest] = useState<null | { ok: boolean; computed: string; expected: string }>(
    null
  )
  const workersRef = useRef<Worker[]>([])
  const perWorkerRef = useRef<{ rate: number; hashes: number }[]>([])

  const aggregate = () => {
    const totalRate = perWorkerRef.current.reduce((a, w) => a + (w?.rate || 0), 0)
    const total = perWorkerRef.current.reduce((a, w) => a + (w?.hashes || 0), 0)
    setHashRate(Math.round(totalRate * 10) / 10)
    setTotalHashes(total)
  }

  const start = () => {
    setRunning(true)
    setStatus(`Iniciando RandomX en ${threads} hilo(s)...`)
    setSelfTest(null)
    setHashRate(0)
    setTotalHashes(0)
    perWorkerRef.current = Array.from({ length: threads }, () => ({ rate: 0, hashes: 0 }))

    const workers: Worker[] = []
    for (let i = 0; i < threads; i++) {
      const worker = new Worker(new URL('../workers/randomx.worker.ts', import.meta.url), {
        type: 'module',
      })
      const idx = i
      worker.onmessage = (e: MessageEvent) => {
        const msg = e.data
        if (msg.type === 'hashrate') {
          perWorkerRef.current[idx] = { rate: msg.hashRate, hashes: msg.totalHashes }
          aggregate()
        } else if (msg.type === 'log') {
          if (idx === 0) setStatus(msg.message)
        } else if (msg.type === 'selftest') {
          // Solo el primer worker reporta el vector de verificación
          if (idx === 0) {
            setSelfTest({ ok: msg.ok, computed: msg.computed, expected: msg.expected })
            setStatus(msg.ok ? '✅ Hashing RandomX verificado' : '❌ Hash incorrecto')
          }
        }
      }
      worker.postMessage({ type: 'benchmark' })
      workers.push(worker)
    }
    workersRef.current = workers
  }

  const stop = () => {
    for (const w of workersRef.current) {
      w.postMessage({ type: 'stop' })
      w.terminate()
    }
    workersRef.current = []
    setRunning(false)
    setStatus('Detenido')
  }

  return (
    <div className="nova-card p-6 space-y-4 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="flex items-center gap-2">
        <Cpu className="h-6 w-6 text-blue-600" />
        <h3 className="text-xl font-bold text-slate-900">Auto-prueba de minería RandomX (local)</h3>
      </div>
      <p className="text-sm text-slate-600">
        Ejecuta el algoritmo RandomX real de Monero en tu navegador (WASM), usando varios núcleos y
        sin conectarse al pool. Verifica el vector de prueba oficial y mide tu hashrate real
        agregado. Así compruebas que el proof-of-work es auténtico aunque tu red bloquee el pool.
      </p>

      {/* Selector de hilos */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-sm font-bold text-slate-700">Núcleos a usar</label>
          <span className="text-xs text-slate-500">
            {threads} de {maxCores} disponibles · ~{(threads * 256).toLocaleString()} MB RAM
          </span>
        </div>
        <input
          type="range"
          min={1}
          max={maxCores}
          step={1}
          value={threads}
          disabled={running}
          onChange={(e) => setThreads(Number(e.target.value))}
          className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 disabled:opacity-50"
        />
      </div>

      {selfTest && (
        <div
          className={`rounded-lg p-3 text-sm flex gap-2 ${
            selfTest.ok
              ? 'bg-emerald-100 border border-emerald-300 text-emerald-800'
              : 'bg-red-100 border border-red-300 text-red-800'
          }`}
        >
          {selfTest.ok ? (
            <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
          ) : (
            <XCircle className="h-5 w-5 flex-shrink-0" />
          )}
          <div className="space-y-1">
            <p className="font-bold">
              {selfTest.ok
                ? 'Vector oficial RandomX verificado ✓ — el hashing es real'
                : 'El hash no coincide'}
            </p>
            <p className="text-xs font-mono break-all">computed: {selfTest.computed}</p>
            <p className="text-xs font-mono break-all">expected: {selfTest.expected}</p>
          </div>
        </div>
      )}

      {running && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-lg p-4">
            <p className="text-xs font-bold text-slate-600 uppercase">Hashrate real ({threads} hilos)</p>
            <p className="text-2xl font-black text-purple-600 mt-1">{hashRate} H/s</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <p className="text-xs font-bold text-slate-600 uppercase">Hashes calculados</p>
            <p className="text-2xl font-black text-blue-600 mt-1">{totalHashes.toLocaleString()}</p>
          </div>
        </div>
      )}

      {status && <p className="text-xs text-slate-500">{status}</p>}

      {!running ? (
        <button
          onClick={start}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700"
        >
          <Cpu className="h-5 w-5" />
          Probar hashing RandomX real (local)
        </button>
      ) : (
        <button
          onClick={stop}
          className="w-full flex items-center justify-center gap-2 bg-red-500 text-white font-bold py-3 rounded-lg hover:bg-red-600"
        >
          <Square className="h-5 w-5" />
          Detener
        </button>
      )}
    </div>
  )
}
