import { consumeRateLimit, createUser, ensureSchema, json, sessionCookie } from "../_shared/auth.js"

export async function onRequestPost(context) {
  const { env, request } = context
  await ensureSchema(env.proyecta_auth)
  const rateLimit = await consumeRateLimit(env.proyecta_auth, request, 'register', 5, 60 * 60 * 1000)
  if (!rateLimit.allowed) {
    return json({ error: 'Demasiados registros desde esta red. Intenta más tarde.' }, { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) } })
  }

  let payload = {}
  try {
    payload = await request.json()
  } catch {
    return json({ error: "El cuerpo de la solicitud no es válido." }, { status: 400 })
  }

  try {
    const result = await createUser(env.proyecta_auth, payload)
    return json({ user: result.user }, { status: 201, headers: { 'Set-Cookie': sessionCookie(result.token) } })
  } catch (error) {
    const message = error instanceof Error ? error.message : "No fue posible crear la cuenta."
    const status = /ya está registrado/i.test(message) ? 409 : 400
    return json({ error: message }, { status })
  }
}

