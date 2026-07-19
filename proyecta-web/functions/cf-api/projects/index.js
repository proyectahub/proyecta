import { ensureSchema, getUserFromRequest, json } from '../_shared/auth.js'
import { listProjects, saveProject } from '../_shared/projects.js'

export async function onRequestOptions() {
  return new Response(null, { status: 204 })
}

export async function onRequestGet({ env }) {
  try {
    return json(await listProjects(env.proyecta_auth))
  } catch (error) {
    return json({ error: 'No fue posible cargar proyectos.' }, { status: 500 })
  }
}

export async function onRequestPost({ env, request }) {
  try {
    await ensureSchema(env.proyecta_auth)
    const user = await getUserFromRequest(env.proyecta_auth, request)
    if (!user) {
      return json({ error: 'Inicia sesión para publicar un proyecto.' }, { status: 401 })
    }

    const raw = await request.text()
    const payload = JSON.parse(raw.replace(/^\uFEFF/, ''))
    return saveProject(env.proyecta_auth, payload, user)
  } catch (error) {
    return json({ error: 'No fue posible guardar el proyecto.' }, { status: 500 })
  }
}
