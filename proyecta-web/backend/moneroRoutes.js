import express from "express"

const router = express.Router()

// Projects use an investigator-owned public address. The former routes created
// server-managed addresses and exposed RPC-derived data, which conflicts with
// PROYECTA's non-custodial model.
router.use((_req, res) => {
  res.status(410).json({
    error: "La API de wallets administradas fue retirada.",
    code: "NON_CUSTODIAL_WALLETS_ONLY",
    message: "PROYECTA solo acepta direcciones publicas controladas por el investigador.",
  })
})

export default router
