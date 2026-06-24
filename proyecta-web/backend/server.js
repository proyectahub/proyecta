import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import orcidRoutes from "./orcid.js"

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

app.use("/api/orcid", orcidRoutes)

app.listen(3000, () => {
  console.log("🚀 Backend running on http://localhost:3000")
})