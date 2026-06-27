import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import orcidRoutes from "./orcid.js"
import moneroRoutes from "./moneroRoutes.js"
import { initializeMoneroConnection } from "./monero.js"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

app.use("/api/orcid", orcidRoutes)
app.use("/api/monero", moneroRoutes)

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" })
})

// Initialize Monero RPC connection
initializeMoneroConnection()
  .then(() => console.log("[Server] Monero RPC initialized"))
  .catch((error) => console.warn("[Server] Monero RPC not available:", error))

app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`)
})