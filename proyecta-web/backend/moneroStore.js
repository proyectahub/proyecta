import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const storePath = path.join(__dirname, "monero-addresses.json")

function ensureStoreExists() {
  if (!fs.existsSync(storePath)) {
    fs.writeFileSync(storePath, JSON.stringify({ addresses: {} }, null, 2), "utf8")
    fs.chmodSync(storePath, 0o600)
  }
}

function readStore() {
  ensureStoreExists()
  const data = fs.readFileSync(storePath, "utf8")
  return JSON.parse(data)
}

function writeStore(data) {
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

export { saveProjectAddress, getProjectAddress, updateBalanceHistory, getMiningStats, readStore, writeStore }
