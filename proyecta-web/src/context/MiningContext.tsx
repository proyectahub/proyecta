import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { useRandomXMining, type RandomXStats } from '../hooks/useRandomXMining'
import { resolveMiningApiBase } from '../lib/api'
import { isValidProjectWalletAddress } from '../utils/projectWallet'
import { normalizeWorkerName, persistWorkerName, readStoredWorkerName } from '../utils/workerName'

const STORAGE_KEY = 'proyecta:web-mining-session:v1'
const MINER_LOCK_NAME = 'proyecta:web-miner:device'

interface MiningProgress {
  totalHashes: number
  elapsedSeconds: number
  acceptedShares: number
  rejectedShares: number
}

export interface PersistentMiningSession {
  version: 1
  id: string
  projectId: string
  projectTitle: string
  walletAddress: string
  workerName: string
  cpuPercentage: number
  startedAt: number
  updatedAt: number
  progress: MiningProgress
}

interface StartMiningInput {
  projectId: string
  projectTitle: string
  walletAddress: string
  workerName?: string
  cpuPercentage: number
}

interface MiningContextValue {
  session: PersistentMiningSession | null
  stats: RandomXStats
  error: string | null
  poolUrl: string
  isEngineOwner: boolean
  isActiveForProject: (projectId: string | undefined, walletAddress: string) => boolean
  startMining: (input: StartMiningInput) => void
  stopMining: () => void
  updateCpuPercentage: (cpuPercentage: number) => void
}

const MiningContext = createContext<MiningContextValue | null>(null)

function emptyStats(status = 'Inactivo'): RandomXStats {
  return {
    hashRate: 0,
    totalHashes: 0,
    poolConnected: false,
    acceptedShares: 0,
    rejectedShares: 0,
    elapsedSeconds: 0,
    jobHeight: null,
    status,
    poolDifficulty: 0,
    coordinatedMiners: 0,
    coordinationActive: false,
  }
}

function asNonNegativeInteger(value: unknown) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? Math.max(0, Math.trunc(parsed)) : 0
}

function normalizeCpuPercentage(value: unknown) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? Math.min(100, Math.max(10, Math.trunc(parsed))) : 50
}

function parseStoredSession(raw: string | null): PersistentMiningSession | null {
  if (!raw) return null

  try {
    const value = JSON.parse(raw)
    const walletAddress = String(value?.walletAddress || '').trim()
    const projectId = String(value?.projectId || '').trim()
    if (value?.version !== 1 || !value?.id || !projectId || !isValidProjectWalletAddress(walletAddress)) return null

    return {
      version: 1,
      id: String(value.id),
      projectId,
      projectTitle: String(value.projectTitle || 'Proyecto'),
      walletAddress,
      workerName: normalizeWorkerName(value.workerName || readStoredWorkerName()),
      cpuPercentage: normalizeCpuPercentage(value.cpuPercentage),
      startedAt: asNonNegativeInteger(value.startedAt) || Date.now(),
      updatedAt: asNonNegativeInteger(value.updatedAt) || Date.now(),
      progress: {
        totalHashes: asNonNegativeInteger(value.progress?.totalHashes),
        elapsedSeconds: asNonNegativeInteger(value.progress?.elapsedSeconds),
        acceptedShares: asNonNegativeInteger(value.progress?.acceptedShares),
        rejectedShares: asNonNegativeInteger(value.progress?.rejectedShares),
      },
    }
  } catch {
    return null
  }
}

function readStoredSession() {
  if (typeof window === 'undefined') return null
  return parseStoredSession(window.localStorage.getItem(STORAGE_KEY))
}

function writeStoredSession(session: PersistentMiningSession) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
}

function progressFromStats(stats: RandomXStats): MiningProgress {
  return {
    totalHashes: asNonNegativeInteger(stats.totalHashes),
    elapsedSeconds: asNonNegativeInteger(stats.elapsedSeconds),
    acceptedShares: asNonNegativeInteger(stats.acceptedShares),
    rejectedShares: asNonNegativeInteger(stats.rejectedShares),
  }
}

export function MiningProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<PersistentMiningSession | null>(readStoredSession)
  const [isEngineOwner, setIsEngineOwner] = useState(false)
  const [stats, setStats] = useState<RandomXStats>(() => {
    const stored = readStoredSession()
    return stored ? { ...emptyStats('SesiÃ³n de minerÃ­a guardada; reanudando.'), ...stored.progress } : emptyStats()
  })

  const { stats: engineStats, error, poolUrl } = useRandomXMining(
    session?.walletAddress || '',
    Boolean(session && isEngineOwner),
    session?.cpuPercentage || 50,
    session?.workerName || '',
    session?.projectId,
    session?.id,
  )

  const activeSessionIdRef = useRef<string | null>(null)
  const baseProgressRef = useRef<MiningProgress>({ totalHashes: 0, elapsedSeconds: 0, acceptedShares: 0, rejectedShares: 0 })
  const previousEngineRef = useRef({ totalHashes: 0, elapsedSeconds: 0 })
  const lastCombinedStatsRef = useRef(stats)
  const previousOwnerRef = useRef(false)
  const sessionRef = useRef(session)

  sessionRef.current = session
  lastCombinedStatsRef.current = stats

  useEffect(() => {
    if (!session) {
      activeSessionIdRef.current = null
      previousOwnerRef.current = false
      baseProgressRef.current = { totalHashes: 0, elapsedSeconds: 0, acceptedShares: 0, rejectedShares: 0 }
      previousEngineRef.current = { totalHashes: 0, elapsedSeconds: 0 }
      setStats(emptyStats())
      return
    }

    if (activeSessionIdRef.current !== session.id) {
      activeSessionIdRef.current = session.id
      baseProgressRef.current = { ...session.progress }
      previousEngineRef.current = { totalHashes: 0, elapsedSeconds: 0 }
      previousOwnerRef.current = false
      setStats({
        ...emptyStats('SesiÃ³n de minerÃ­a guardada; reanudando.'),
        ...session.progress,
      })
      return
    }

    if (!isEngineOwner) {
      previousOwnerRef.current = false
      setStats((current) => ({
        ...current,
        hashRate: 0,
        poolConnected: false,
        totalHashes: Math.max(current.totalHashes, session.progress.totalHashes),
        elapsedSeconds: Math.max(current.elapsedSeconds, session.progress.elapsedSeconds),
        acceptedShares: Math.max(current.acceptedShares, session.progress.acceptedShares),
        rejectedShares: Math.max(current.rejectedShares, session.progress.rejectedShares),
        coordinatedMiners: 0,
        coordinationActive: false,
        status: 'MinerÃ­a activa en otra pestaÃ±a de este navegador.',
      }))
      return
    }

    if (!previousOwnerRef.current) {
      baseProgressRef.current = progressFromStats(lastCombinedStatsRef.current)
      previousEngineRef.current = { totalHashes: 0, elapsedSeconds: 0 }
      previousOwnerRef.current = true
    }

    const previousEngine = previousEngineRef.current
    if (engineStats.totalHashes < previousEngine.totalHashes) {
      baseProgressRef.current.totalHashes = lastCombinedStatsRef.current.totalHashes
    }
    if (engineStats.elapsedSeconds < previousEngine.elapsedSeconds) {
      baseProgressRef.current.elapsedSeconds = lastCombinedStatsRef.current.elapsedSeconds
    }

    previousEngineRef.current = {
      totalHashes: engineStats.totalHashes,
      elapsedSeconds: engineStats.elapsedSeconds,
    }

    const combined: RandomXStats = {
      ...engineStats,
      totalHashes: Math.max(
        lastCombinedStatsRef.current.totalHashes,
        baseProgressRef.current.totalHashes + engineStats.totalHashes,
      ),
      elapsedSeconds: Math.max(
        lastCombinedStatsRef.current.elapsedSeconds,
        baseProgressRef.current.elapsedSeconds + engineStats.elapsedSeconds,
      ),
      acceptedShares: Math.max(
        lastCombinedStatsRef.current.acceptedShares,
        baseProgressRef.current.acceptedShares,
        engineStats.acceptedShares,
      ),
      rejectedShares: Math.max(
        lastCombinedStatsRef.current.rejectedShares,
        baseProgressRef.current.rejectedShares,
        engineStats.rejectedShares,
      ),
    }
    setStats(combined)
  }, [engineStats, isEngineOwner, session])

  useEffect(() => {
    if (!session) {
      setIsEngineOwner(false)
      return
    }

    if (!navigator.locks?.request) {
      setIsEngineOwner(true)
      return
    }

    let cancelled = false
    let releaseLock: (() => void) | null = null
    let retryTimer: ReturnType<typeof setTimeout> | null = null

    const acquireLock = async () => {
      let acquired = false
      await navigator.locks.request(MINER_LOCK_NAME, { ifAvailable: true }, async (lock) => {
        if (!lock || cancelled) return
        acquired = true
        setIsEngineOwner(true)
        await new Promise<void>((resolve) => {
          releaseLock = resolve
        })
        if (!cancelled) setIsEngineOwner(false)
      })

      if (!cancelled && !acquired) {
        retryTimer = setTimeout(() => void acquireLock(), 2000)
      }
    }

    void acquireLock()
    return () => {
      cancelled = true
      if (retryTimer) clearTimeout(retryTimer)
      releaseLock?.()
      setIsEngineOwner(false)
    }
  }, [session?.id])

  useEffect(() => {
    if (!session || !isEngineOwner) return
    const stored = readStoredSession()
    if (!stored || stored.id !== session.id) {
      setSession(stored)
      return
    }
    writeStoredSession({
      ...session,
      updatedAt: Date.now(),
      progress: progressFromStats(stats),
    })
  }, [isEngineOwner, session, stats])

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return
      setSession(parseStoredSession(event.newValue))
    }
    const persistBeforeLeaving = () => {
      const currentSession = sessionRef.current
      if (!currentSession || !previousOwnerRef.current) return
      const stored = readStoredSession()
      if (!stored || stored.id !== currentSession.id) return
      writeStoredSession({
        ...currentSession,
        updatedAt: Date.now(),
        progress: progressFromStats(lastCombinedStatsRef.current),
      })
    }

    window.addEventListener('storage', handleStorage)
    window.addEventListener('pagehide', persistBeforeLeaving)
    return () => {
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener('pagehide', persistBeforeLeaving)
    }
  }, [])

  const startMining = (input: StartMiningInput) => {
    if (!isValidProjectWalletAddress(input.walletAddress)) return
    const now = Date.now()
    const nextSession: PersistentMiningSession = {
      version: 1,
      id: crypto.randomUUID(),
      projectId: input.projectId,
      projectTitle: input.projectTitle,
      walletAddress: input.walletAddress,
      workerName: normalizeWorkerName(input.workerName || readStoredWorkerName()),
      cpuPercentage: normalizeCpuPercentage(input.cpuPercentage),
      startedAt: now,
      updatedAt: now,
      progress: { totalHashes: 0, elapsedSeconds: 0, acceptedShares: 0, rejectedShares: 0 },
    }
    persistWorkerName(nextSession.workerName)
    writeStoredSession(nextSession)
    setSession(nextSession)
  }

  const stopMining = () => {
    const currentSession = sessionRef.current
    window.localStorage.removeItem(STORAGE_KEY)
    setSession(null)

    if (currentSession) {
      void fetch(`${resolveMiningApiBase()}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: currentSession.walletAddress,
          projectId: currentSession.projectId,
          sessionId: currentSession.id,
          source: 'browser',
          hashes: lastCombinedStatsRef.current.totalHashes,
          hashRate: 0,
          elapsedSeconds: lastCombinedStatsRef.current.elapsedSeconds,
          acceptedShares: lastCombinedStatsRef.current.acceptedShares,
          rejectedShares: lastCombinedStatsRef.current.rejectedShares,
          poolConnected: false,
          miningIntent: false,
          active: false,
        }),
      }).catch(() => undefined)
    }
  }

  const updateCpuPercentage = (cpuPercentage: number) => {
    if (!session) return
    const nextSession = {
      ...session,
      cpuPercentage: normalizeCpuPercentage(cpuPercentage),
      updatedAt: Date.now(),
      progress: progressFromStats(lastCombinedStatsRef.current),
    }
    writeStoredSession(nextSession)
    setSession(nextSession)
  }

  const isActiveForProject = (projectId: string | undefined, walletAddress: string) => Boolean(
    session && session.projectId === String(projectId || walletAddress) && session.walletAddress === walletAddress,
  )

  return (
    <MiningContext.Provider value={{
      session,
      stats,
      error,
      poolUrl,
      isEngineOwner,
      isActiveForProject,
      startMining,
      stopMining,
      updateCpuPercentage,
    }}>
      {children}
    </MiningContext.Provider>
  )
}

export function useMining() {
  const context = useContext(MiningContext)
  if (!context) throw new Error('useMining must be used within MiningProvider')
  return context
}

