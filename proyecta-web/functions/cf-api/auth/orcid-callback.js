import { createSession, ensureSchema, json } from '../_shared/auth.js'
import { buildOrcidRedirectUri, decodeOrcidState, exchangeOrcidCode, linkOrcidToUser, resolveOrcidDisplayName } from '../_shared/orcid.js'

export async function onRequestGet(context) {
  const { env, request } = context
  await ensureSchema(env.proyecta_auth)

  const url = new URL(request.url)
  const code = url.searchParams.get('code') || ''
  const state = url.searchParams.get('state') || ''
  const error = url.searchParams.get('error') || ''

  if (error) {
    return new Response(null, {
      status: 302,
      headers: {
        Location: '/login?oauth_error=orcid',
      },
    })
  }

  if (!code) {
    return new Response(null, {
      status: 302,
      headers: {
        Location: '/login?oauth_error=missing_code',
      },
    })
  }

  const clientId = env.ORCID_CLIENT_ID || env.PUBLIC_ORCID_CLIENT_ID || ''
  const clientSecret = env.ORCID_CLIENT_SECRET || ''
  if (!clientId || !clientSecret) {
    return json({ error: 'ORCID no está configurado.' }, { status: 500 })
  }

  const redirectUri = buildOrcidRedirectUri(request, env)
  const tokenData = await exchangeOrcidCode({
    code,
    clientId,
    clientSecret,
    redirectUri,
    baseUrl: env.ORCID_BASE_URL,
  })

  if (!tokenData?.access_token) {
    return new Response(null, {
      status: 302,
      headers: {
        Location: '/login?oauth_error=token_exchange',
      },
    })
  }

  const orcid = tokenData.orcid || ''
  if (!orcid) {
    return new Response(null, {
      status: 302,
      headers: {
        Location: '/login?oauth_error=no_orcid',
      },
    })
  }

  const displayName = await resolveOrcidDisplayName(tokenData.access_token, orcid, env.ORCID_API_BASE_URL)
  const oauthState = decodeOrcidState(state)

  if (oauthState.mode !== 'link' || !oauthState.userId) {
    return new Response(null, {
      status: 302,
      headers: {
        Location: '/login?oauth_error=invalid_state',
      },
    })
  }

  const user = await linkOrcidToUser(env.proyecta_auth, oauthState.userId, orcid, displayName)
  const session = await createSession(env.proyecta_auth, user.id)
  const redirect = new URL('/orcid/callback', new URL(request.url).origin)
  redirect.searchParams.set('token', session.token)
  redirect.searchParams.set('orcid', orcid)
  redirect.searchParams.set('linked', '1')

  return new Response(null, {
    status: 302,
    headers: {
      Location: redirect.toString(),
    },
  })
}
