import { ensureSchema, json, updateUserProfile } from "../_shared/auth.js"

export async function onRequestPatch(context) {
  const { env, request } = context
  await ensureSchema(env.proyecta_auth)

  let payload = {}
  try {
    payload = await request.json()
  } catch {
    return json({ error: "El cuerpo de la solicitud no es válido." }, { status: 400 })
  }

  return updateUserProfile(env.proyecta_auth, request, payload)
}

