import { consumeRateLimit, ensureSchema, json, loginUser, sessionCookie } from "../_shared/auth.js"

export async function onRequestPost(context) {
  const { env, request } = context
  await ensureSchema(env.proyecta_auth)
  const rateLimit = await consumeRateLimit(env.proyecta_auth, request, 'login', 8, 15 * 60 * 1000)
  if (!rateLimit.allowed) {
    return json({ error: 'Demasiados intentos de inicio de sesión. Intenta más tarde.' }, { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) } })
  }

  let payload = {}
  try {
    payload = await request.json()
  } catch {
    return json({ error: "El cuerpo de la solicitud no es válido." }, { status: 400 })
  }

  try {
    const result = await loginUser(env.proyecta_auth, payload)
    return json({ user: result.user }, { headers: { 'Set-Cookie': sessionCookie(result.token) } })
  } catch (error) {
    const message = error instanceof Error ? error.message : "No fue posible iniciar sesión."
    return json({ error: message }, { status: 401 })
  }
}

