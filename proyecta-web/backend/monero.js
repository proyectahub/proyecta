import fetch from "node-fetch"

const MONERO_RPC_HOST = process.env.MONERO_RPC_HOST || "https://node.moneroworld.com:18089"
const MONERO_RPC_USER = process.env.MONERO_RPC_USER || ""
const MONERO_RPC_PASS = process.env.MONERO_RPC_PASS || ""
const MASTER_SEED = process.env.MONERO_MASTER_SEED || ""

let moneroConnection = null

async function initializeMoneroConnection() {
  if (!MASTER_SEED) {
    console.warn("[Monero] No MONERO_MASTER_SEED configured. Monero operations will be limited.")
    return null
  }

  try {
    const response = await rpcCall("get_version")
    console.log("[Monero] RPC connection established:", response)
    moneroConnection = { ready: true }
    return moneroConnection
  } catch (error) {
    console.warn("[Monero] RPC connection failed:", error.message)
    return null
  }
}

async function rpcCall(method, params = {}) {
  const body = {
    jsonrpc: "2.0",
    id: "0",
    method,
    params,
  }

  const response = await fetch(MONERO_RPC_HOST + "/json_rpc", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    auth: MONERO_RPC_USER && MONERO_RPC_PASS ? `${MONERO_RPC_USER}:${MONERO_RPC_PASS}` : undefined,
  })

  if (!response.ok) {
    throw new Error(`RPC error: ${response.statusText}`)
  }

  const data = await response.json()
  if (data.error) {
    throw new Error(`RPC error: ${data.error.message}`)
  }

  return data.result
}

function hashProjectIdToIndex(projectId) {
  let hash = 0
  for (let i = 0; i < projectId.length; i++) {
    hash = (hash << 5) - hash + projectId.charCodeAt(i)
    hash = hash & hash
  }
  return Math.abs(hash) % 1000
}

async function generateProjectAddress(projectId) {
  if (!MASTER_SEED) {
    throw new Error("Monero master seed not configured")
  }

  const addressIndex = hashProjectIdToIndex(projectId)
  const derivationPath = `m/44'/128'/0'/0'/${addressIndex}'`

  try {
    const result = await rpcCall("create_address", {
      account_index: 0,
      label: `project_${projectId}`,
    })

    return {
      address: result.address,
      projectId,
      index: addressIndex,
      derivationPath,
    }
  } catch (error) {
    console.error(`[Monero] Failed to generate address for ${projectId}:`, error)
    throw error
  }
}

async function validateAddressBalance(address) {
  if (!address) return { valid: false, balance: 0 }

  try {
    const result = await rpcCall("get_balance", {
      address,
    })

    return {
      valid: true,
      balance: result.balance,
      unlocked_balance: result.unlocked_balance,
    }
  } catch (error) {
    console.error(`[Monero] Failed to validate address ${address}:`, error)
    return { valid: false, balance: 0 }
  }
}

async function listAddresses() {
  try {
    const result = await rpcCall("get_accounts")
    return result.subaddress_accounts || []
  } catch (error) {
    console.error("[Monero] Failed to list addresses:", error)
    return []
  }
}

export { initializeMoneroConnection, generateProjectAddress, validateAddressBalance, listAddresses, moneroConnection }
