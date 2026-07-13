import { ensureSchema, getUserFromRequest, json } from '../_shared/auth.js'
import { buildOrcidAuthorizeUrl, buildOrcidRedirectUri, encodeOrcidState } from '../_shared/orcid.js'

export async function onRequestPost(context) {
  const { env, request } = context
  await ensureSchema(env.proyecta_auth)

  const user = await getUserFromRequest(env.proyecta_auth, request)
  if (!user) {
    return json({ error: 'No autenticado.' }, { status: 401 })
  }

  const clientId = env.ORCID_CLIENT_ID || env.PUBLIC_ORCID_CLIENT_ID || ''
  if (!clientId) {
    return json({ error: 'ORCID no está configurado.' }, { status: 500 })
  }

  const redirectUri = buildOrcidRedirectUri(request, env)
  const state = encodeOrcidState({ mode: 'link', userId: user.id })
  const url = buildOrcidAuthorizeUrl({ clientId, redirectUri, state, baseUrl: env.ORCID_BASE_URL })
  return json({ url })
}
