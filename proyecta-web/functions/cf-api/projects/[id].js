import { json } from '../_shared/auth.js'
import { getProject } from '../_shared/projects.js'

export async function onRequestGet({ env, params }) {
  try {
    const project = await getProject(env.proyecta_auth, params.id)
    if (!project) {
      return json({ error: 'Proyecto no encontrado.' }, { status: 404 })
    }
    return json(project)
  } catch (error) {
    return json({ error: 'No fue posible cargar el proyecto.' }, { status: 500 })
  }
}
