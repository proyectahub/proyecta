import { consumeRateLimit, ensureSchema, getUserFromRequest, json } from '../../_shared/auth.js'

const MAX_REPLY_LENGTH = 3000

export async function onRequestGet({ env, params }) {
  await ensureSchema(env.proyecta_auth)
  const result = await env.proyecta_auth.prepare(`
    SELECT id, topic_id AS topicId, author_id AS authorId, author_name AS authorName, content, created_at AS createdAt
    FROM forum_replies WHERE topic_id = ? ORDER BY created_at ASC
  `).bind(params.id).all()
  return json(result.results || [])
}

export async function onRequestPost({ env, params, request }) {
  await ensureSchema(env.proyecta_auth)
  const user = await getUserFromRequest(env.proyecta_auth, request)
  if (!user) return json({ error: 'Inicia sesión para responder.' }, { status: 401 })

  const topic = await env.proyecta_auth.prepare('SELECT id FROM forum_topics WHERE id = ? LIMIT 1').bind(params.id).first()
  if (!topic) return json({ error: 'Tema no encontrado.' }, { status: 404 })

  const rateLimit = await consumeRateLimit(env.proyecta_auth, request, `forum-reply:${user.id}`, 30, 10 * 60 * 1000)
  if (!rateLimit.allowed) {
    return json({ error: 'Has enviado varias respuestas recientemente. Intenta más tarde.' }, { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) } })
  }

  let payload
  try { payload = await request.json() } catch { return json({ error: 'Respuesta inválida.' }, { status: 400 }) }
  const content = String(payload.content || '').trim()
  if (!content || content.length > MAX_REPLY_LENGTH) {
    return json({ error: `La respuesta debe tener entre 1 y ${MAX_REPLY_LENGTH} caracteres.` }, { status: 400 })
  }

  const reply = {
    id: `forum_reply_${crypto.randomUUID()}`,
    topicId: params.id,
    authorId: user.id,
    authorName: user.fullName || 'Miembro PROYECTA',
    content,
    createdAt: Date.now(),
  }
  await env.proyecta_auth.batch([
    env.proyecta_auth.prepare(`
      INSERT INTO forum_replies (id, topic_id, author_id, author_name, content, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(reply.id, reply.topicId, reply.authorId, reply.authorName, reply.content, reply.createdAt),
    env.proyecta_auth.prepare('UPDATE forum_topics SET updated_at = ? WHERE id = ?').bind(reply.createdAt, params.id),
  ])
  return json(reply, { status: 201 })
}
