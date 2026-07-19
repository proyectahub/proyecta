import { consumeRateLimit, ensureSchema, getUserFromRequest, json } from '../../_shared/auth.js'
import { getProject } from '../../_shared/projects.js'

const MAX_COMMENT_LENGTH = 2000

export async function onRequestGet({ env, params }) {
  await ensureSchema(env.proyecta_auth)
  const result = await env.proyecta_auth.prepare(`
    SELECT id, author_id AS authorId, author_name AS author, content, parent_id AS parentId, created_at AS createdAt
    FROM project_comments WHERE project_id = ? ORDER BY created_at DESC
  `).bind(params.id).all()
  return json(result.results || [])
}

export async function onRequestPost({ env, params, request }) {
  await ensureSchema(env.proyecta_auth)
  const user = await getUserFromRequest(env.proyecta_auth, request)
  if (!user) return json({ error: 'Inicia sesión para comentar.' }, { status: 401 })
  const rateLimit = await consumeRateLimit(env.proyecta_auth, request, `project-comment:${user.id}`, 20, 10 * 60 * 1000)
  if (!rateLimit.allowed) return json({ error: 'Demasiados comentarios. Intenta más tarde.' }, { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) } })
  if (!await getProject(env.proyecta_auth, params.id)) return json({ error: 'Proyecto no encontrado.' }, { status: 404 })

  let payload
  try { payload = await request.json() } catch { return json({ error: 'Comentario inválido.' }, { status: 400 }) }
  const content = String(payload.content || '').trim()
  const parentId = String(payload.parentId || '').trim() || null
  if (!content || content.length > MAX_COMMENT_LENGTH) return json({ error: `El comentario debe tener entre 1 y ${MAX_COMMENT_LENGTH} caracteres.` }, { status: 400 })
  if (parentId) {
    const parent = await env.proyecta_auth.prepare('SELECT id FROM project_comments WHERE id = ? AND project_id = ? LIMIT 1').bind(parentId, params.id).first()
    if (!parent) return json({ error: 'El comentario al que respondes no existe.' }, { status: 400 })
  }

  const comment = { id: `comment_${crypto.randomUUID()}`, projectId: params.id, authorId: user.id, author: user.fullName || 'Miembro PROYECTA', content, parentId, createdAt: Date.now() }
  await env.proyecta_auth.prepare(`INSERT INTO project_comments (id, project_id, author_id, author_name, content, parent_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`)
    .bind(comment.id, comment.projectId, comment.authorId, comment.author, comment.content, comment.parentId, comment.createdAt).run()
  return json(comment, { status: 201 })
}

export async function onRequestDelete({ env, params, request }) {
  await ensureSchema(env.proyecta_auth)
  const user = await getUserFromRequest(env.proyecta_auth, request)
  if (!user) return json({ error: 'No autorizado.' }, { status: 401 })
  const commentId = new URL(request.url).searchParams.get('commentId')
  if (!commentId) return json({ error: 'Falta commentId.' }, { status: 400 })
  const owned = await env.proyecta_auth.prepare('SELECT id FROM project_comments WHERE id = ? AND project_id = ? AND author_id = ? LIMIT 1').bind(commentId, params.id, user.id).first()
  if (!owned) return json({ error: 'Comentario no encontrado o no autorizado.' }, { status: 404 })
  await env.proyecta_auth.batch([
    env.proyecta_auth.prepare('DELETE FROM project_comments WHERE parent_id = ? AND project_id = ?').bind(commentId, params.id),
    env.proyecta_auth.prepare('DELETE FROM project_comments WHERE id = ? AND project_id = ?').bind(commentId, params.id),
  ])
  return json({ ok: true })
}
