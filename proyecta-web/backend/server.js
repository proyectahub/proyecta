import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import orcidRoutes from "./orcid.js"
import moneroRoutes from "./moneroRoutes.js"
import { initializeMoneroConnection } from "./monero.js"
import { readStore } from "./moneroStore.js"

function createMiningCompatibilityRouter() {
  const router = express.Router()

  router.get("/health", (_req, res) => {
    res.json({ ok: true, status: "healthy", service: "mining" })
  })

  router.post("/submit", (req, res) => {
    const hashes = Number(req.body?.hashes || 0)
    res.json({ ok: true, poolConnected: true, accepted: true, submittedHashes: hashes })
  })

  router.get("/status/:wallet", (req, res) => {
    res.json({
      isConnected: true,
      wallet: req.params.wallet,
      acceptedShares: 0,
      rejectedShares: 0,
      miners: 1,
      uptime: 0,
    })
  })

  router.get("/pool-stats/:wallet", async (req, res) => {
    const wallet = req.params.wallet
    try {
      const response = await fetch(`https://supportxmr.com/api/miner/${wallet}/stats`, {
        headers: { "User-Agent": "PROYECTA/1.0" },
      })

      if (!response.ok) {
        throw new Error(`SupportXMR API ${response.status}`)
      }

      const data = await response.json()
      res.json({
        wallet,
        totalHashes: Number(data.totalHashes ?? data.total_hashes ?? 0),
        totalPaid: Number(data.totalPaid ?? data.paid ?? 0),
        balance: Number(data.balance ?? data.amtDue ?? 0),
        hashrate: Number(data.hashrate ?? data.hash ?? 0),
        lastHash: Number(data.lastHash ?? Date.now()),
        minPayout: Number(data.minPayout ?? 0.3),
      })
    } catch (error) {
      res.json({
        wallet,
        totalHashes: 0,
        totalPaid: 0,
        balance: 0,
        hashrate: 0,
        lastHash: Date.now(),
        minPayout: 0.3,
        error: error instanceof Error ? error.message : String(error),
      })
    }
  })

  router.get("/payments/:wallet", async (req, res) => {
    try {
      const response = await fetch(`https://supportxmr.com/api/miner/${req.params.wallet}/payments`)
      const data = response.ok ? await response.json() : []
      res.json({ payments: Array.isArray(data) ? data : [] })
    } catch (error) {
      res.json({ payments: [], error: error instanceof Error ? error.message : String(error) })
    }
  })

  router.get("/addresses", (_req, res) => {
    const store = readStore()
    res.json(Object.values(store.addresses || {}))
  })

  return router
}

dotenv.config()

const app = express()
const PORT = Number(process.env.PORT || 3000)

app.use(cors())
app.use(express.json())

app.use("/api/orcid", orcidRoutes)
app.use("/api/monero", moneroRoutes)
app.use("/api/mining", createMiningCompatibilityRouter())

app.get("/health", (_req, res) => {
  res.json({ status: "ok" })
})

void initializeMoneroConnection()
  .then(() => console.log("[Server] Monero RPC initialized"))
  .catch((error) => console.warn("[Server] Monero RPC not available:", error))

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`)
})
