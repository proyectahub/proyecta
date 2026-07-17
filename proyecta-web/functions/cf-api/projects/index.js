import { json } from '../_shared/auth.js'
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
    const payload = await request.json()
    return saveProject(env.proyecta_auth, payload)
  } catch (error) {
    return json({ error: 'No fue posible guardar el proyecto.' }, { status: 500 })
  }
}
