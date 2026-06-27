import express from "express"
import { generateProjectAddress, validateAddressBalance } from "./monero.js"
import { isValidMoneroAddress, isValidProjectId, sanitizeAddress, sanitizeProjectId } from "./moneroValidator.js"
import { saveProjectAddress, getProjectAddress, updateBalanceHistory, getMiningStats } from "./moneroStore.js"

const router = express.Router()

function requireAuth(req, res, next) {
  const token = req.headers["x-session-token"] || req.headers.authorization?.replace("Bearer ", "")
  if (!token) {
    return res.status(401).json({ error: "Authentication required" })
  }
  req.sessionToken = token
  next()
}

router.post("/new-address", requireAuth, async (req, res) => {
  try {
    const { projectId } = req.body
    if (!projectId || !isValidProjectId(projectId)) {
      return res.status(400).json({ error: "Invalid project ID" })
    }

    const addressData = await generateProjectAddress(projectId)
    saveProjectAddress(projectId, addressData.address, {
      derivationPath: addressData.derivationPath,
      index: addressData.index,
    })

    res.status(201).json(addressData)
  } catch (error) {
    console.error("[Monero Routes] Error generating address:", error)
    res.status(500).json({ error: "Failed to generate address" })
  }
})

router.get("/address/:projectId", requireAuth, async (req, res) => {
  try {
    const projectId = sanitizeProjectId(req.params.projectId)
    if (!isValidProjectId(projectId)) {
      return res.status(400).json({ error: "Invalid project ID" })
    }

    const address = getProjectAddress(projectId)
    if (!address) {
      return res.status(404).json({ error: "Address not found for project" })
    }

    res.json(address)
  } catch (error) {
    console.error("[Monero Routes] Error fetching address:", error)
    res.status(500).json({ error: "Failed to fetch address" })
  }
})

router.get("/validate/:projectId", requireAuth, async (req, res) => {
  try {
    const projectId = sanitizeProjectId(req.params.projectId)
    const addressData = getProjectAddress(projectId)

    if (!addressData) {
      return res.status(404).json({ error: "Address not found" })
    }

    const validationResult = await validateAddressBalance(addressData.address)
    res.json(validationResult)
  } catch (error) {
    console.error("[Monero Routes] Error validating address:", error)
    res.status(500).json({ error: "Failed to validate address" })
  }
})

router.get("/addresses", requireAuth, async (req, res) => {
  try {
    const { readStore } = await import("./moneroStore.js")
    const store = readStore()
    const addresses = Object.values(store.addresses || {})
    res.json(addresses)
  } catch (error) {
    console.error("[Monero Routes] Error listing addresses:", error)
    res.status(500).json({ error: "Failed to list addresses" })
  }
})

router.get("/stats/:projectId", requireAuth, async (req, res) => {
  try {
    const projectId = sanitizeProjectId(req.params.projectId)
    const stats = getMiningStats(projectId)

    if (!stats) {
      return res.status(404).json({ error: "Stats not found for project" })
    }

    res.json(stats)
  } catch (error) {
    console.error("[Monero Routes] Error fetching stats:", error)
    res.status(500).json({ error: "Failed to fetch stats" })
  }
})

router.get("/rpc-info", requireAuth, async (req, res) => {
  res.json({
    rpcHost: process.env.MONERO_RPC_HOST || "Not configured",
    seedConfigured: !!process.env.MONERO_MASTER_SEED,
  })
})

export default router
