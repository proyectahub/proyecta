import express from "express"
import fetch from "node-fetch"

const router = express.Router()

router.post("/exchange", async (req, res) => {
  try {
    const { code } = req.body

    // 🔥 STEP 1: obtener access_token
    const tokenRes = await fetch("https://sandbox.orcid.org/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: process.env.ORCID_CLIENT_ID,
        client_secret: process.env.ORCID_CLIENT_SECRET,
        grant_type: "authorization_code",
        code,
        redirect_uri: "http://localhost:5174/orcid/callback",
      }),
    })

    const tokenData = await tokenRes.json()

    if (!tokenData.access_token) {
      return res.status(400).json(tokenData)
    }

    const orcid = tokenData.orcid

    // 🔥 STEP 2: obtener perfil
    const profileRes = await fetch(
      `https://pub.sandbox.orcid.org/v3.0/${orcid}/person`,
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          Accept: "application/json",
        },
      }
    )

    const profile = await profileRes.json()

    // 🔥 STEP 3: respuesta limpia
    res.json({
      orcid,
      name:
        profile.name.["given-names"].value +
        " " +
        profile.name.["family-name"].value,
      profile,
    })

  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "ORCID exchange failed" })
  }
})

export default router