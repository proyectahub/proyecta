import { json } from '../../_shared/auth.js'
import { ensureProjectsSchema, getProject } from '../../_shared/projects.js'

const ATOMIC_UNITS_PER_XMR = 1e12
const KNOWN_PROJECT_BASELINES = new Map([
  ['proj_1784349046292', {
    wallet: '447gTj6Hg6gaAEAUmjqfhqDZr1PziUTvbT4LYLpmLVnTNVFK6cqeqPfh6P4neMKLWX5jDXAr94fWHacJwDvjmCzBBH8wPBt',
    totalHashes: 6854895,
    validShares: 53,
    invalidShares: 0,
    amountDueAtomic: 4977231,
    amountPaidAtomic: 0,
    capturedAt: 1784504500000,
  }],
])

function asNonNegativeNumber(value) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0
}

function normalizePoolStats(data = {}) {
  return {
    hashrate: asNonNegativeNumber(data.hash ?? data.hashrate),
    totalHashes: asNonNegativeNumber(data.totalHashes),
    validShares: Math.trunc(asNonNegativeNumber(data.validShares)),
    invalidShares: Math.trunc(asNonNegativeNumber(data.invalidShares)),
    amountDueAtomic: asNonNegativeNumber(data.amtDue),
    amountPaidAtomic: asNonNegativeNumber(data.amtPaid),
    lastHash: asNonNegativeNumber(data.lastHash),
    identifier: typeof data.identifier === 'string' ? data.identifier : null,
    expiry: asNonNegativeNumber(data.expiry) || null,
  }
}

async function fetchPoolStats(wallet) {
  const response = await fetch(`https://www.supportxmr.com/api/miner/${encodeURIComponent(wallet)}/stats`, {
    headers: { Accept: 'application/json' },
  })
  if (response.status === 404) return normalizePoolStats()
  if (!response.ok) throw new Error(`SupportXMR respondió ${response.status}`)

  const stats = normalizePoolStats(await response.json())
  let workers = []
  try {
    const workersResponse = await fetch(`https://www.supportxmr.com/api/miner/${encodeURIComponent(wallet)}/identifiers`, {
      headers: { Accept: 'application/json' },
    })
    if (workersResponse.ok) {
      const identifiers = await workersResponse.json()
      workers = Array.isArray(identifiers)
        ? identifiers.filter((identifier) => typeof identifier === 'string' && identifier.trim()).map((identifier) => identifier.trim())
        : []
    }
  } catch {
    // Worker names are optional and must not hide the wallet totals.
  }

  return { ...stats, workers }
}

async function getOrCreateBaseline(db, projectId, wallet, current) {
  let baseline = await db.prepare('SELECT * FROM project_mining_baselines WHERE project_id = ? LIMIT 1').bind(projectId).first()
  const now = Date.now()

  if (!baseline) {
    const known = KNOWN_PROJECT_BASELINES.get(projectId)
    const initial = known?.wallet === wallet ? known : current
    await db.prepare(`
      INSERT OR IGNORE INTO project_mining_baselines (
        project_id, wallet, total_hashes, valid_shares, invalid_shares,
        amount_due_atomic, amount_paid_atomic, captured_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      projectId,
      wallet,
      initial.totalHashes,
      initial.validShares,
      initial.invalidShares,
      initial.amountDueAtomic,
      initial.amountPaidAtomic,
      initial.capturedAt || now,
      now,
    ).run()
    baseline = await db.prepare('SELECT * FROM project_mining_baselines WHERE project_id = ? LIMIT 1').bind(projectId).first()
  } else if (baseline.wallet !== wallet) {
    await db.prepare(`
      UPDATE project_mining_baselines SET
        wallet = ?, total_hashes = ?, valid_shares = ?, invalid_shares = ?,
        amount_due_atomic = ?, amount_paid_atomic = ?, captured_at = ?, updated_at = ?
      WHERE project_id = ?
    `).bind(
      wallet,
      current.totalHashes,
      current.validShares,
      current.invalidShares,
      current.amountDueAtomic,
      current.amountPaidAtomic,
      now,
      now,
      projectId,
    ).run()
    baseline = await db.prepare('SELECT * FROM project_mining_baselines WHERE project_id = ? LIMIT 1').bind(projectId).first()
  }

  return baseline
}

export async function onRequestGet({ env, params }) {
  try {
    await ensureProjectsSchema(env.proyecta_auth)
    const project = await getProject(env.proyecta_auth, params.id)
    if (!project) return json({ error: 'Proyecto no encontrado.' }, { status: 404 })

    const wallet = project.moneroAddress || project.fundraisingAddress
    const current = await fetchPoolStats(wallet)
    const baseline = await getOrCreateBaseline(env.proyecta_auth, project.id, wallet, current)
    if (!baseline) throw new Error('No fue posible crear la línea base del proyecto.')

    const confirmedTotalHashes = Math.max(0, current.totalHashes - asNonNegativeNumber(baseline.total_hashes))
    const confirmedValidShares = Math.max(0, current.validShares - Math.trunc(asNonNegativeNumber(baseline.valid_shares)))
    const confirmedInvalidShares = Math.max(0, current.invalidShares - Math.trunc(asNonNegativeNumber(baseline.invalid_shares)))
    const baselineEarnedAtomic = asNonNegativeNumber(baseline.amount_due_atomic) + asNonNegativeNumber(baseline.amount_paid_atomic)
    const currentEarnedAtomic = current.amountDueAtomic + current.amountPaidAtomic
    const confirmedBalance = Math.max(0, currentEarnedAtomic - baselineEarnedAtomic) / ATOMIC_UNITS_PER_XMR
    const confirmedTotalPaid = Math.max(0, current.amountPaidAtomic - asNonNegativeNumber(baseline.amount_paid_atomic)) / ATOMIC_UNITS_PER_XMR
    const isPoolConfirmed = confirmedTotalHashes > 0 || confirmedValidShares > 0 || confirmedBalance > 0 || confirmedTotalPaid > 0

    return json({
      wallet,
      projectId: project.id,
      hashrate: isPoolConfirmed ? current.hashrate : 0,
      totalHashes: confirmedTotalHashes,
      balance: confirmedBalance,
      totalPaid: confirmedTotalPaid,
      lastHash: current.lastHash,
      minPayout: 0.1,
      confirmedBalance,
      confirmedHashrate: isPoolConfirmed ? current.hashrate : 0,
      confirmedTotalHashes,
      confirmedTotalPaid,
      confirmedValidShares,
      confirmedInvalidShares,
      visibleBalance: confirmedBalance,
      visibleHashrate: isPoolConfirmed ? current.hashrate : 0,
      visibleTotalHashes: confirmedTotalHashes,
      isPoolConfirmed,
      externalMiningActive: isPoolConfirmed,
      poolIdentifier: current.identifier,
      poolExpiry: current.expiry,
      poolDataConfirmed: true,
      poolPendingBalance: current.amountDueAtomic / ATOMIC_UNITS_PER_XMR,
      poolTotalPaid: current.amountPaidAtomic / ATOMIC_UNITS_PER_XMR,
      poolHashrate: current.hashrate,
      poolTotalHashes: current.totalHashes,
      poolValidShares: current.validShares,
      poolInvalidShares: current.invalidShares,
      poolWorkers: Array.isArray(current.workers) ? current.workers : [],
      poolWorkerCount: Array.isArray(current.workers) ? current.workers.length : 0,
      poolLastHash: current.lastHash,
      baselineCapturedAt: Number(baseline.captured_at || 0),
      status: isPoolConfirmed ? 'SupportXMR confirmó actividad posterior al inicio del proyecto' : 'Esperando el primer share posterior a la línea base',
    }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'No fue posible consultar SupportXMR.' }, { status: 502 })
  }
}
