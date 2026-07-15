import { ensureSchema, json, loginUser } from "../_shared/auth.js"

export async function onRequestPost(context) {
  const { env, request } = context
  await ensureSchema(env.proyecta_auth)

  let payload = {}
  try {
    payload = await request.json()
  } catch {
    return json({ error: "El cuerpo de la solicitud no es vÃ¡lido." }, { status: 400 })
  }

  try {
    return json(await loginUser(env.proyecta_auth, payload))
  } catch (error) {
    const message = error instanceof Error ? error.message : "No fue posible iniciar sesiÃ³n."
    return json({ error: message }, { status: 401 })
  }
}

