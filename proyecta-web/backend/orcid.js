import express from "express"
import fetch from "node-fetch"

const router = express.Router()

function buildRedirectUri() {
  const configured = process.env.ORCID_REDIRECT_URI
  if (configured) {
    return configured
  }

  const base = process.env.PUBLIC_APP_URL || process.env.FRONTEND_URL || "https://proyecta.pages.dev"
  return `${base.replace(/\/$/, "")}/orcid/callback`
}

router.post("/exchange", async (req, res) => {
  try {
    const { code } = req.body

    if (!code) {
      return res.status(400).json({ error: "Missing authorization code" })
    }

    const redirectUri = buildRedirectUri()
    const orcidApiBaseUrl = process.env.ORCID_API_BASE_URL || "https://pub.orcid.org"
    const orcidAuthBaseUrl = process.env.ORCID_BASE_URL || "https://orcid.org"

    const tokenRes = await fetch(`${orcidAuthBaseUrl}/oauth/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: process.env.ORCID_CLIENT_ID || "",
        client_secret: process.env.ORCID_CLIENT_SECRET || "",
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
      }),
    })

    const tokenData = await tokenRes.json()

    if (!tokenData.access_token) {
      return res.status(400).json(tokenData)
    }

    const orcid = tokenData.orcid
    const profileRes = await fetch(`${orcidApiBaseUrl}/v3.0/${orcid}/person`, {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        Accept: "application/json",
      },
    })

    const profile = await profileRes.json()
    const givenNames = profile?.name?.["given-names"]?.value || ""
    const familyNames = profile?.name?.["family-name"]?.value || ""

    res.json({
      orcid,
      name: `${givenNames} ${familyNames}`.trim() || orcid,
      profile,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "ORCID exchange failed" })
  }
})

export default router

