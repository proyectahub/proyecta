import { getUserFromRequest, json } from '../_shared/auth.js'
import { getProject, updateProject } from '../_shared/projects.js'

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

export async function onRequestPut({ env, params, request }) {
  try {
    const user = await getUserFromRequest(env.proyecta_auth, request)
    if (!user) {
      return json({ error: 'Inicia sesiÃ³n para editar un proyecto.' }, { status: 401 })
    }

    const raw = await request.text()
    const payload = JSON.parse(raw.replace(/^\uFEFF/, ''))
    return updateProject(env.proyecta_auth, params.id, payload, user)
  } catch (error) {
    return json({ error: 'No fue posible actualizar el proyecto.' }, { status: 500 })
  }
}
