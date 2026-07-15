import { createUser, ensureSchema, json } from "../_shared/auth.js"

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
    const result = await createUser(env.proyecta_auth, payload)
    return json(result, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "No fue posible crear la cuenta."
    const status = /ya estÃ¡ registrado/i.test(message) ? 409 : 400
    return json({ error: message }, { status })
  }
}

