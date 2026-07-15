import { ensureSchema, getUserFromRequest, json } from "../_shared/auth.js"

export async function onRequestGet(context) {
  const { env, request } = context

  try {
    await ensureSchema(env.proyecta_auth)

    const user = await getUserFromRequest(env.proyecta_auth, request)
    if (!user) {
      return json({ error: "No autorizado." }, { status: 401 })
    }

    return json({ user })
  } catch {
    return json({ error: 'No fue posible cargar tu sesión.' }, { status: 500 })
  }
}
