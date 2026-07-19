import { clearSessionCookie, ensureSchema, json, parseBearerToken } from "../_shared/auth.js"

export async function onRequestPost(context) {
  const { env, request } = context
  await ensureSchema(env.proyecta_auth)

  const token = parseBearerToken(request)
  if (token) {
    await env.proyecta_auth.prepare("DELETE FROM sessions WHERE token = ?").bind(token).run()
  }

  return json({ ok: true }, { headers: { 'Set-Cookie': clearSessionCookie() } })
}

