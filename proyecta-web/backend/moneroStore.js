import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const storePath = path.join(__dirname, "monero-addresses.json")

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
  return store
}

function writeStore(data) {
  if (!data.addresses) data.addresses = {}
  if (!data.miningTelemetry) data.miningTelemetry = {}
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

function recordMiningTelemetry(wallet, telemetry = {}) {
  const store = readStore()
  const previous = store.miningTelemetry[wallet] || {}
  const normalized = normalizeTelemetry(wallet, telemetry)
  store.miningTelemetry[wallet] = {
    ...previous,
    ...normalized,
    createdAt: previous.createdAt || normalized.lastSeenAt,
    updatedAt: normalized.lastSeenAt,
  }
  writeStore(store)
  return store.miningTelemetry[wallet]
}

function getMiningTelemetry(wallet) {
  const store = readStore()
  return store.miningTelemetry[wallet] || null
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
  const visibleBalance = confirmedBalance + localVisibleBalance
  const visibleHashrate = Math.max(confirmedHashrate, localHashrate)
  const visibleTotalHashes = Math.max(confirmedTotalHashes, localTotalHashes)
  const status = isLocalActive
    ? (isPoolConfirmed ? "Prueba local activa + pool confirmado" : "Prueba local activa del navegador")
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
