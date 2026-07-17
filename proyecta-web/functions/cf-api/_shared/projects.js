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

export async function ensureProjectsSchema(db) {
  await db.exec(PROJECTS_SCHEMA.replace(/\s+/g, ' ').trim())
  await db.exec('CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at)')
  return db
}

function asText(value, fallback = '') {
  return String(value ?? fallback).trim()
}

function asNumber(value, fallback = 0) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
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
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    fundingGoal: Number(row.funding_goal || 0),
    fundraisingAddress: row.fundraising_address,
    moneroAddress: row.monero_address || row.fundraising_address,
    author: row.author,
    authorName: row.author_name,
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

export async function getProject(db, id) {
  await ensureProjectsSchema(db)
  const row = await db.prepare('SELECT * FROM projects WHERE id = ? LIMIT 1').bind(id).first()
  return mapProjectRow(row)
}

export async function saveProject(db, input) {
  await ensureProjectsSchema(db)
  const project = normalizeProjectPayload(input)

  if (!project.title || !project.description || !project.fundingGoal || !project.fundraisingAddress) {
    return json({ error: 'Faltan datos del proyecto.' }, { status: 400 })
  }

  await db.prepare(`
    INSERT INTO projects (
      id, title, description, category, funding_goal, fundraising_address, monero_address,
      author, author_name, raised, status, hitos_json, cover_image, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      title = excluded.title,
      description = excluded.description,
      category = excluded.category,
      funding_goal = excluded.funding_goal,
      fundraising_address = excluded.fundraising_address,
      monero_address = excluded.monero_address,
      author = excluded.author,
      author_name = excluded.author_name,
      raised = excluded.raised,
      status = excluded.status,
      hitos_json = excluded.hitos_json,
      cover_image = excluded.cover_image,
      updated_at = excluded.updated_at
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
