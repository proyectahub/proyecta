import { consumeRateLimit, ensureSchema, json, linkUserWallet, updateWalletProfile, getWalletFromRequest, getUserFromRequest } from "../_shared/auth.js"

export async function onRequestPost(context) {
  const { env, request } = context
  await ensureSchema(env.proyecta_auth)
  const user = await getUserFromRequest(env.proyecta_auth, request)
  if (!user) {
    return json({ error: 'Inicia sesión con tu cuenta PROYECTA antes de vincular una dirección Monero.' }, { status: 401 })
  }

  const rateLimit = await consumeRateLimit(env.proyecta_auth, request, 'wallet-link', 8, 15 * 60 * 1000)
  if (!rateLimit.allowed) {
    return json({ error: 'Demasiados intentos de vincular wallet. Intenta más tarde.' }, { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) } })
  }

  let payload = {}
  try {
    payload = await request.json()
  } catch {
    return json({ error: "El cuerpo de la solicitud no es válido." }, { status: 400 })
  }

  try {
    return linkUserWallet(env.proyecta_auth, request, payload)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No fue posible vincular la wallet.'
    const status = /formato válido/i.test(message) ? 400 : 400
    return json({ error: message }, { status })
  }
}

export async function onRequestGet(context) {
  const { env, request } = context
  await ensureSchema(env.proyecta_auth)

  const user = await getWalletFromRequest(env.proyecta_auth, request)
  if (!user) {
    return json({ error: 'No autorizado.' }, { status: 401 })
  }

  return json({ user })
}

export async function onRequestPatch(context) {
  const { env, request } = context
  await ensureSchema(env.proyecta_auth)

  let payload = {}
  try {
    payload = await request.json()
  } catch {
    return json({ error: 'El cuerpo de la solicitud no es válido.' }, { status: 400 })
  }

  return updateWalletProfile(env.proyecta_auth, request, payload)
}

export async function onRequestDelete(context) {
  const { env, request } = context
  await ensureSchema(env.proyecta_auth)

  const token = request.headers.get('Authorization')?.startsWith('Bearer ')
    ? request.headers.get('Authorization').slice(7).trim()
    : null

  if (token) {
    await env.proyecta_auth.prepare('DELETE FROM wallet_sessions WHERE token = ?').bind(token).run()
  }

  return json({ ok: true })
}

