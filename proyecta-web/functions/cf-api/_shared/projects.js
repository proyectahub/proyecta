import { json } from './auth.js'

const PROJECTS_SCHEMA = `
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  funding_goal REAL NOT NULL,
  fundraising_address TEXT NOT NULL,
  monero_address TEXT NOT NULL,
  author TEXT NOT NULL,
  author_name TEXT NOT NULL,
  raised REAL NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  hitos_json TEXT NOT NULL DEFAULT '[]',
  cover_image TEXT NOT NULL DEFAULT '',
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
)
`

const PROJECT_MINING_BASELINES_SCHEMA = `
CREATE TABLE IF NOT EXISTS project_mining_baselines (
  project_id TEXT PRIMARY KEY,
  wallet TEXT NOT NULL,
  total_hashes REAL NOT NULL DEFAULT 0,
  valid_shares INTEGER NOT NULL DEFAULT 0,
  invalid_shares INTEGER NOT NULL DEFAULT 0,
  amount_due_atomic REAL NOT NULL DEFAULT 0,
  amount_paid_atomic REAL NOT NULL DEFAULT 0,
  captured_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
)
`

export async function ensureProjectsSchema(db) {
  await db.exec(PROJECTS_SCHEMA.replace(/\s+/g, ' ').trim())
  await db.exec('CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at)')
  await db.exec(PROJECT_MINING_BASELINES_SCHEMA.replace(/\s+/g, ' ').trim())
  return db
}

function asText(value, fallback = '') {
  return String(value ?? fallback).trim()
}

function asNumber(value, fallback = 0) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function containsHtml(value) {
  return /<\/?[a-z][^>]*>/i.test(value)
}

function restoreEscapedProjectHtml(value) {
  const raw = asText(value)
  if (!/&lt;\/?[a-z][\s\S]*?&gt;/i.test(raw)) return raw

  return raw
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#(?:39|x27);/gi, "'")
    .replace(/&amp;/gi, '&')
}

const PROJECT_HTML_TAGS = new Set(['a', 'blockquote', 'br', 'code', 'em', 'h1', 'h2', 'h3', 'hr', 'img', 'li', 'ol', 'p', 'pre', 's', 'strong', 'table', 'tbody', 'td', 'th', 'thead', 'tr', 'u', 'ul'])

function safeProjectUrl(value, protocols) {
  try {
    return protocols.includes(new URL(value).protocol) ? value : ''
  } catch {
    return ''
  }
}

function sanitizeProjectHtml(value) {
  const raw = asText(value)
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<\s*(script|style|iframe|object|embed|svg|math)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, '')

  return raw.replace(/<\s*(\/?)\s*([a-z0-9]+)([^>]*)>/gi, (_match, closing, rawTag, rawAttributes) => {
    const tag = String(rawTag).toLowerCase()
    if (!PROJECT_HTML_TAGS.has(tag)) return ''
    if (closing) return `</${tag}>`
    if (tag === 'br' || tag === 'hr') return `<${tag}>`
    const textAlign = /\bstyle\s*=\s*["'][^"']*\btext-align\s*:\s*(left|center|right|justify)\s*;?[^"']*["']/i.exec(rawAttributes)?.[1]
    const alignAttribute = textAlign && ['h1', 'h2', 'h3', 'p'].includes(tag) ? ` style="text-align:${textAlign.toLowerCase()}"` : ''
    if (tag === 'a') {
      const href = safeProjectUrl(/\bhref\s*=\s*["']?([^"'\s>]+)/i.exec(rawAttributes)?.[1] || '', ['https:', 'http:', 'mailto:'])
      return href ? `<a href="${href.replace(/"/g, '&quot;')}" target="_blank" rel="noopener noreferrer">` : '<a>'
    }
    if (tag === 'img') {
      const src = safeProjectUrl(/\bsrc\s*=\s*["']?([^"'\s>]+)/i.exec(rawAttributes)?.[1] || '', ['https:'])
      const alt = String(/\balt\s*=\s*["']?([^"'>]*)/i.exec(rawAttributes)?.[1] || '').replace(/[<>"']/g, '')
      return src ? `<img src="${src.replace(/"/g, '&quot;')}" alt="${alt}">` : ''
    }
    return `<${tag}${alignAttribute}>`
  })
}

const LEGACY_ENCODING_REPLACEMENTS = new Map([
  ['\u00c3\u00a1', '\u00e1'], ['\u00c3\u00a9', '\u00e9'], ['\u00c3\u00ad', '\u00ed'],
  ['\u00c3\u00b3', '\u00f3'], ['\u00c3\u00ba', '\u00fa'], ['\u00c3\u0081', '\u00c1'],
  ['\u00c3\u0089', '\u00c9'], ['\u00c3\u008d', '\u00cd'], ['\u00c3\u0093', '\u00d3'],
  ['\u00c3\u009a', '\u00da'], ['\u00c3\u00b1', '\u00f1'], ['\u00c3\u0091', '\u00d1'],
  ['\u00c2\u00bf', '\u00bf'], ['\u00c2\u00a1', '\u00a1'], ['\u00c2', ''],
  ['\u00e2\u20ac\u201c', '-'], ['\u00e2\u20ac\u201d', '-'],
  ['\u00e2\u20ac\u0153', '"'], ['\u00e2\u20ac\u009d', '"'], ['\u00e2\u20ac\u2122', "'"],
])

function repairLegacyEncoding(value) {
  let repaired = asText(value)
  for (const [damaged, replacement] of LEGACY_ENCODING_REPLACEMENTS) {
    repaired = repaired.replaceAll(damaged, replacement)
  }
  return repaired
}

function legacyPlainText(value) {
  return repairLegacyEncoding(value)
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<li[^>]*>/gi, '- ')
    .replace(/<\/(p|div|li|h[1-6])>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#(?:39|x27);/gi, "'")
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function parseHitos(value) {
  if (Array.isArray(value)) return value
  if (typeof value !== 'string' || !value.trim()) return []
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function normalizeProjectPayload(input = {}) {
  const now = Date.now()
  const fundraisingAddress = asText(input.fundraisingAddress || input.fundraising_address || input.moneroAddress || input.monero_address)
  const id = asText(input.id) || `proj_${crypto.randomUUID().slice(0, 8)}`
  const hitos = parseHitos(input.hitos || input.hitos_json)

  return {
    id,
    title: asText(input.title),
    description: asText(input.description),
    category: asText(input.category, 'other') || 'other',
    fundingGoal: asNumber(input.fundingGoal ?? input.funding_goal, 0),
    fundraisingAddress,
    moneroAddress: fundraisingAddress,
    author: asText(input.author, 'anonymous') || 'anonymous',
    authorName: asText(input.authorName || input.author_name, 'Investigador') || 'Investigador',
    raised: asNumber(input.raised, 0),
    status: asText(input.status, 'active') || 'active',
    hitos,
    coverImage: asText(input.coverImage || input.cover_image),
    createdAt: asNumber(input.createdAt ?? input.created_at, now),
    updatedAt: asNumber(input.updatedAt ?? input.updated_at, now),
  }
}

export function mapProjectRow(row) {
  if (!row) return null
  const description = restoreEscapedProjectHtml(row.description)
  return {
    id: row.id,
    title: legacyPlainText(row.title),
    description: containsHtml(description) ? sanitizeProjectHtml(description) : legacyPlainText(description),
    category: row.category,
    fundingGoal: Number(row.funding_goal || 0),
    fundraisingAddress: row.fundraising_address,
    moneroAddress: row.monero_address || row.fundraising_address,
    author: row.author,
    authorName: legacyPlainText(row.author_name),
    raised: Number(row.raised || 0),
    status: row.status || 'active',
    hitos: parseHitos(row.hitos_json),
    coverImage: row.cover_image || '',
    createdAt: Number(row.created_at || 0),
    updatedAt: Number(row.updated_at || 0),
  }
}

export async function listProjects(db) {
  await ensureProjectsSchema(db)
  const result = await db.prepare('SELECT * FROM projects ORDER BY created_at DESC').all()
  return (Array.isArray(result?.results) ? result.results : []).map(mapProjectRow).filter(Boolean)
}

export async function listProjectsByAuthor(db, authorId) {
  await ensureProjectsSchema(db)
  const result = await db
    .prepare('SELECT * FROM projects WHERE author = ? ORDER BY updated_at DESC')
    .bind(authorId)
    .all()
  return (Array.isArray(result?.results) ? result.results : []).map(mapProjectRow).filter(Boolean)
}

export async function getProject(db, id) {
  await ensureProjectsSchema(db)
  const row = await db.prepare('SELECT * FROM projects WHERE id = ? LIMIT 1').bind(id).first()
  return mapProjectRow(row)
}

export async function saveProject(db, input, owner) {
  await ensureProjectsSchema(db)
  if (!owner?.id) {
    return json({ error: 'No autorizado.' }, { status: 401 })
  }

  const project = normalizeProjectPayload({
    ...input,
    id: `proj_${crypto.randomUUID()}`,
    author: owner.id,
    authorName: owner.fullName || owner.name || 'Investigador',
    raised: 0,
    status: 'active',
    hitos: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  })

  if (!project.title || !project.description || project.fundingGoal <= 0 || !/^[48][a-zA-Z0-9]{94}$/.test(project.fundraisingAddress)) {
    return json({ error: 'Faltan datos del proyecto.' }, { status: 400 })
  }

  project.description = restoreEscapedProjectHtml(project.description)
  project.description = containsHtml(project.description) ? sanitizeProjectHtml(project.description) : legacyPlainText(project.description)

  await db.prepare(`
    INSERT INTO projects (
      id, title, description, category, funding_goal, fundraising_address, monero_address,
      author, author_name, raised, status, hitos_json, cover_image, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    project.id,
    project.title,
    project.description,
    project.category,
    project.fundingGoal,
    project.fundraisingAddress,
    project.moneroAddress,
    project.author,
    project.authorName,
    project.raised,
    project.status,
    JSON.stringify(project.hitos),
    project.coverImage,
    project.createdAt,
    Date.now(),
  ).run()

  const saved = await getProject(db, project.id)
  return json(saved, { status: 201 })
}

export async function updateProject(db, id, input, owner) {
  await ensureProjectsSchema(db)
  if (!owner?.id) {
    return json({ error: 'No autorizado.' }, { status: 401 })
  }

  const current = await getProject(db, id)
  if (!current) {
    return json({ error: 'Proyecto no encontrado.' }, { status: 404 })
  }

  if (current.author !== owner.id) {
    return json({ error: 'No tienes permiso para editar este proyecto.' }, { status: 403 })
  }

  const next = normalizeProjectPayload({
    ...current,
    ...input,
    id: current.id,
    author: current.author,
    authorName: current.authorName,
    createdAt: current.createdAt,
    updatedAt: Date.now(),
    fundraisingAddress: input.fundraisingAddress || input.fundraising_address || current.fundraisingAddress,
  })

  if (!next.title || !next.description || next.fundingGoal <= 0 || !/^[48][a-zA-Z0-9]{94}$/.test(next.fundraisingAddress)) {
    return json({ error: 'Faltan datos del proyecto.' }, { status: 400 })
  }

  next.description = restoreEscapedProjectHtml(next.description)
  next.description = containsHtml(next.description) ? sanitizeProjectHtml(next.description) : legacyPlainText(next.description)

  await db.prepare(`
    UPDATE projects
    SET title = ?, description = ?, category = ?, funding_goal = ?, fundraising_address = ?, monero_address = ?,
        author = ?, author_name = ?, raised = ?, status = ?, hitos_json = ?, cover_image = ?, updated_at = ?
    WHERE id = ?
  `).bind(
    next.title,
    next.description,
    next.category,
    next.fundingGoal,
    next.fundraisingAddress,
    next.moneroAddress,
    next.author,
    next.authorName,
    next.raised,
    next.status,
    JSON.stringify(next.hitos),
    next.coverImage,
    next.updatedAt,
    current.id,
  ).run()

  return json(await getProject(db, current.id))
}
