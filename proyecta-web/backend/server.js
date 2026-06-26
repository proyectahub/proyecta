import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import orcidRoutes from "./orcid.js"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

app.use("/api/orcid", orcidRoutes)

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" })
})

app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`)
})