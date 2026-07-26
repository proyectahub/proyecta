import { consumeRateLimit, ensureSchema, getUserFromRequest, json } from '../_shared/auth.js'

const CATEGORIES = new Set(['general', 'mejoras', 'investigacion', 'mineria', 'gobernanza'])
const MAX_TITLE_LENGTH = 140
const MAX_CONTENT_LENGTH = 5000

export async function onRequestGet({ env }) {
  await ensureSchema(env.proyecta_auth)
  const result = await env.proyecta_auth.prepare(`
    SELECT t.id, t.author_id AS authorId, t.author_name AS authorName, t.title, t.content,
      t.category, t.created_at AS createdAt, t.updated_at AS updatedAt,
      COUNT(r.id) AS replyCount
    FROM forum_topics t
    LEFT JOIN forum_replies r ON r.topic_id = t.id
    GROUP BY t.id
    ORDER BY t.updated_at DESC
    LIMIT 100
  `).all()
  return json(result.results || [])
}

export async function onRequestPost({ env, request }) {
  await ensureSchema(env.proyecta_auth)
  const user = await getUserFromRequest(env.proyecta_auth, request)
  if (!user) return json({ error: 'Inicia sesión para crear un tema.' }, { status: 401 })

  const rateLimit = await consumeRateLimit(env.proyecta_auth, request, `forum-topic:${user.id}`, 8, 60 * 60 * 1000)
  if (!rateLimit.allowed) {
    return json({ error: 'Has creado varios temas recientemente. Intenta más tarde.' }, { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) } })
  }

  let payload
  try { payload = await request.json() } catch { return json({ error: 'Tema inválido.' }, { status: 400 }) }
  const title = String(payload.title || '').trim()
  const content = String(payload.content || '').trim()
  const category = CATEGORIES.has(String(payload.category || '')) ? String(payload.category) : 'general'

  if (title.length < 8 || title.length > MAX_TITLE_LENGTH) {
    return json({ error: `El título debe tener entre 8 y ${MAX_TITLE_LENGTH} caracteres.` }, { status: 400 })
  }
  if (content.length < 20 || content.length > MAX_CONTENT_LENGTH) {
    return json({ error: `La publicación debe tener entre 20 y ${MAX_CONTENT_LENGTH} caracteres.` }, { status: 400 })
  }

  const timestamp = Date.now()
  const topic = {
    id: `forum_${crypto.randomUUID()}`,
    authorId: user.id,
    authorName: user.fullName || 'Miembro PROYECTA',
    title,
    content,
    category,
    createdAt: timestamp,
    updatedAt: timestamp,
    replyCount: 0,
  }
  await env.proyecta_auth.prepare(`
    INSERT INTO forum_topics (id, author_id, author_name, title, content, category, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(topic.id, topic.authorId, topic.authorName, topic.title, topic.content, topic.category, topic.createdAt, topic.updatedAt).run()

  return json(topic, { status: 201 })
}
