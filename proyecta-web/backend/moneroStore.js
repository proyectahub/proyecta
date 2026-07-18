import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const storePath = path.join(__dirname, "monero-addresses.json")
const ACTIVE_SESSION_TTL_MS = 90 * 1000
const STORED_SESSION_TTL_MS = 30 * 60 * 1000

function ensureStoreExists() {
  if (!fs.existsSync(storePath)) {
    fs.writeFileSync(storePath, JSON.stringify({ addresses: {}, miningTelemetry: {} }, null, 2), "utf8")
    fs.chmodSync(storePath, 0o600)
  }
}

function readStore() {
  ensureStoreExists()
  const data = fs.readFileSync(storePath, "utf8")
  const store = JSON.parse(data)
  if (!store.addresses) store.addresses = {}
  if (!store.miningTelemetry) store.miningTelemetry = {}
  if (!store.miningTelemetrySessions) store.miningTelemetrySessions = {}
  return store
}

function writeStore(data) {
  if (!data.addresses) data.addresses = {}
  if (!data.miningTelemetry) data.miningTelemetry = {}
  if (!data.miningTelemetrySessions) data.miningTelemetrySessions = {}
  fs.writeFileSync(storePath, JSON.stringify(data, null, 2), "utf8")
  fs.chmodSync(storePath, 0o600)
}

function saveProjectAddress(projectId, address, metadata = {}) {
  const store = readStore()
  store.addresses[projectId] = {
    address,
    createdAt: new Date().toISOString(),
    balanceHistory: [],
    ...metadata,
  }
  writeStore(store)
  return store.addresses[projectId]
}

function getProjectAddress(projectId) {
  const store = readStore()
  return store.addresses[projectId] || null
}

function updateBalanceHistory(projectId, balance) {
  const store = readStore()
  if (!store.addresses[projectId]) return null

  const addressData = store.addresses[projectId]
  if (!addressData.balanceHistory) {
    addressData.balanceHistory = []
  }

  addressData.balanceHistory.push({
    timestamp: new Date().toISOString(),
    balance,
  })

  if (addressData.balanceHistory.length > 100) {
    addressData.balanceHistory = addressData.balanceHistory.slice(-100)
  }

  writeStore(store)
  return addressData
}

function getMiningStats(projectId) {
  const store = readStore()
  const addressData = store.addresses[projectId]

  if (!addressData) return null

  const history = addressData.balanceHistory || []
  const currentBalance = history.length > 0 ? history[history.length - 1].balance : 0
  const previousBalance = history.length > 1 ? history[history.length - 2].balance : 0

  return {
    address: addressData.address,
    currentBalance,
    earned: currentBalance - previousBalance,
    balanceHistory: history,
    lastUpdated: addressData.lastUpdated || addressData.createdAt,
  }
}

function normalizeTelemetry(wallet, telemetry = {}) {
  const totalHashes = Math.max(0, Math.trunc(Number(telemetry.totalHashes ?? telemetry.hashes ?? 0) || 0))
  const hashRate = Number(telemetry.hashRate ?? 0)
  const elapsedSeconds = Math.max(0, Math.trunc(Number(telemetry.elapsedSeconds ?? 0) || 0))
  const acceptedShares = Math.max(0, Math.trunc(Number(telemetry.acceptedShares ?? 0) || 0))
  const rejectedShares = Math.max(0, Math.trunc(Number(telemetry.rejectedShares ?? 0) || 0))
  const poolConnected = Boolean(telemetry.poolConnected)
  const active = telemetry.active !== false && (poolConnected || hashRate > 0 || totalHashes > 0)
  const localVisibleBalance = active ? Math.max(totalHashes / 10000000000, 0.0001) : 0

  return {
    wallet,
    sessionId: typeof telemetry.sessionId === "string" ? telemetry.sessionId : null,
    totalHashes,
    hashRate: Number.isFinite(hashRate) ? hashRate : 0,
    elapsedSeconds,
    acceptedShares,
    rejectedShares,
    poolConnected,
    active,
    localVisibleBalance,
    lastSeenAt: new Date().toISOString(),
  }
}

function getSessionKey(telemetry = {}) {
  const source = typeof telemetry.source === "string" && telemetry.source.trim() ? telemetry.source.trim() : "browser"
  const sessionId = typeof telemetry.sessionId === "string" && telemetry.sessionId.trim() ? telemetry.sessionId.trim() : "default"
  return source + ":" + sessionId
}

function pruneWalletTelemetrySessions(store, wallet) {
  const sessions = store.miningTelemetrySessions?.[wallet]
  if (!sessions) return

  const cutoff = Date.now() - STORED_SESSION_TTL_MS
  for (const [sessionKey, session] of Object.entries(sessions)) {
    const lastSeen = new Date(session.updatedAt || session.lastSeenAt || 0).getTime()
    if (!Number.isFinite(lastSeen) || lastSeen < cutoff) {
      delete sessions[sessionKey]
    }
  }

  if (Object.keys(sessions).length === 0) {
    delete store.miningTelemetrySessions[wallet]
  }
}

function recordMiningTelemetry(wallet, telemetry = {}) {
  const store = readStore()
  const normalized = normalizeTelemetry(wallet, telemetry)
  const source = typeof telemetry.source === "string" && telemetry.source.trim() ? telemetry.source.trim() : "browser"
  const sessionKey = getSessionKey({ ...telemetry, source })

  pruneWalletTelemetrySessions(store, wallet)

  if (!store.miningTelemetrySessions[wallet]) {
    store.miningTelemetrySessions[wallet] = {}
  }

  const previous = store.miningTelemetrySessions[wallet][sessionKey] || {}
  const session = {
    ...previous,
    ...normalized,
    source,
    sessionId: normalized.sessionId || sessionKey,
    createdAt: previous.createdAt || normalized.lastSeenAt,
    updatedAt: normalized.lastSeenAt,
  }

  store.miningTelemetrySessions[wallet][sessionKey] = session
  store.miningTelemetry[wallet] = session
  writeStore(store)
  return session
}

function getMiningTelemetry(wallet) {
  const store = readStore()
  const sessions = store.miningTelemetrySessions?.[wallet] || {}
  const cutoff = Date.now() - ACTIVE_SESSION_TTL_MS
  const activeSessions = Object.values(sessions).filter((session) => {
    const lastSeen = new Date(session.updatedAt || session.lastSeenAt || 0).getTime()
    return Number.isFinite(lastSeen) && lastSeen >= cutoff && session.active !== false
  })

  if (activeSessions.length === 0) {
    const legacy = store.miningTelemetry[wallet] || null
    if (!legacy) return null
    const lastSeen = new Date(legacy.updatedAt || legacy.lastSeenAt || 0).getTime()
    return Number.isFinite(lastSeen) && lastSeen >= cutoff ? legacy : null
  }

  const totals = activeSessions.reduce(
    (accumulator, session) => {
      const source = session.source === "native" || session.source === "app" ? "native" : "browser"
      const totalHashes = Math.max(0, Math.trunc(Number(session.totalHashes || 0)))
      const hashRate = Number(session.hashRate || 0)
      const balance = Number(session.localVisibleBalance || 0)

      accumulator.totalHashes += totalHashes
      accumulator.hashRate += Number.isFinite(hashRate) ? hashRate : 0
      accumulator.localVisibleBalance += Number.isFinite(balance) ? balance : 0
      accumulator.acceptedShares += Math.max(0, Math.trunc(Number(session.acceptedShares || 0)))
      accumulator.rejectedShares += Math.max(0, Math.trunc(Number(session.rejectedShares || 0)))
      accumulator.elapsedSeconds = Math.max(accumulator.elapsedSeconds, Math.max(0, Math.trunc(Number(session.elapsedSeconds || 0))))
      accumulator.poolConnected = accumulator.poolConnected || Boolean(session.poolConnected)
      accumulator.sources[source] += 1
      accumulator.sourceHashrate[source] += Number.isFinite(hashRate) ? hashRate : 0
      return accumulator
    },
    {
      wallet,
      totalHashes: 0,
      hashRate: 0,
      elapsedSeconds: 0,
      acceptedShares: 0,
      rejectedShares: 0,
      poolConnected: false,
      localVisibleBalance: 0,
      sources: { browser: 0, native: 0 },
      sourceHashrate: { browser: 0, native: 0 },
    },
  )

  return {
    ...totals,
    active: true,
    activeSessions: activeSessions.length,
    browserSessions: totals.sources.browser,
    nativeSessions: totals.sources.native,
    browserHashrate: totals.sourceHashrate.browser,
    nativeHashrate: totals.sourceHashrate.native,
    lastSeenAt: activeSessions
      .map((session) => session.updatedAt || session.lastSeenAt)
      .filter(Boolean)
      .sort()
      .at(-1) || new Date().toISOString(),
  }
}

function isConfirmedPoolStats(stats) {
  if (!stats) return false
  return Number(stats.hashrate || 0) > 0 || Number(stats.totalHashes || 0) > 0 || Number(stats.balance || 0) > 0 || Number(stats.totalPaid || 0) > 0 || Number(stats.validShares || 0) > 0
}

function buildUnifiedMiningSummary(wallet, confirmedStats = null) {
  const telemetry = getMiningTelemetry(wallet)
  const isLocalActive = Boolean(telemetry?.active)
  const localVisibleBalance = Number(telemetry?.localVisibleBalance || 0)
  const localHashrate = Number(telemetry?.hashRate || 0)
  const localTotalHashes = Math.max(0, Math.trunc(Number(telemetry?.totalHashes || 0)))
  const confirmedBalance = Number(confirmedStats?.balance || 0)
  const confirmedHashrate = Number(confirmedStats?.hashrate || 0)
  const confirmedTotalHashes = Math.max(0, Math.trunc(Number(confirmedStats?.totalHashes || 0)))
  const confirmedTotalPaid = Number(confirmedStats?.totalPaid || 0)
  const confirmedValidShares = Math.max(0, Math.trunc(Number(confirmedStats?.validShares || 0)))
  const confirmedInvalidShares = Math.max(0, Math.trunc(Number(confirmedStats?.invalidShares || 0)))
  const poolIdentifier = typeof confirmedStats?.identifier === "string" ? confirmedStats.identifier : null
  const poolExpiry = Number(confirmedStats?.expiry || 0) || null
  const isPoolConfirmed = isConfirmedPoolStats(confirmedStats)
  const localMiners = Math.max(0, Math.trunc(Number(telemetry?.activeSessions || (isLocalActive ? 1 : 0))))
  const localBrowserMiners = Math.max(0, Math.trunc(Number(telemetry?.browserSessions || 0)))
  const localNativeMiners = Math.max(0, Math.trunc(Number(telemetry?.nativeSessions || 0)))
  const localBrowserHashrate = Number(telemetry?.browserHashrate || 0)
  const localNativeHashrate = Number(telemetry?.nativeHashrate || 0)
  const visibleBalance = confirmedBalance + localVisibleBalance
  const visibleHashrate = confirmedHashrate + localHashrate
  const visibleTotalHashes = confirmedTotalHashes + localTotalHashes
  const status = isLocalActive
    ? (isPoolConfirmed ? "Pool confirmado + aporte local activo" : "Aporte local activo del proyecto")
    : (isPoolConfirmed ? "Pool confirmado" : "Esperando confirmación del pool")

  return {
    wallet,
    hashrate: visibleHashrate,
    totalHashes: visibleTotalHashes,
    balance: visibleBalance,
    totalPaid: confirmedTotalPaid,
    lastHash: Number.isFinite(Number(confirmedStats?.lastHash)) ? Number(confirmedStats?.lastHash) : Date.now(),
    minPayout: Number(confirmedStats?.minPayout || 0.3) || 0.3,
    confirmedBalance,
    confirmedHashrate,
    confirmedTotalHashes,
    confirmedTotalPaid,
    confirmedValidShares,
    confirmedInvalidShares,
    poolIdentifier,
    poolExpiry,
    localBalance: localVisibleBalance,
    localHashrate,
    localTotalHashes,
    localMiners,
    localBrowserMiners,
    localNativeMiners,
    localBrowserHashrate,
    localNativeHashrate,
    visibleBalance,
    visibleHashrate,
    visibleTotalHashes,
    isLocalActive,
    isPoolConfirmed,
    status,
    externalMiningActive: isPoolConfirmed,
    lastSeenAt: telemetry?.lastSeenAt || null,
  }
}

export { saveProjectAddress, getProjectAddress, updateBalanceHistory, getMiningStats, readStore, writeStore, recordMiningTelemetry, getMiningTelemetry, buildUnifiedMiningSummary }
