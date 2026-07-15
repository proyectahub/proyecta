const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30

const AUTH_SCHEMA_STATEMENTS = [
  `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  password_salt TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT '',
  affiliation TEXT NOT NULL DEFAULT '',
  location TEXT NOT NULL DEFAULT '',
  bio TEXT NOT NULL DEFAULT '',
  image TEXT NOT NULL DEFAULT '',
  orcid_id TEXT,
  institution TEXT,
  research_area TEXT,
  monero_wallet_main_address TEXT,
  monero_wallet_view_key TEXT,
  monero_wallet_user_vita_address TEXT,
  monero_wallet_linked_at INTEGER,
  wallet_mode TEXT NOT NULL DEFAULT 'external',
  wallet_web_url TEXT NOT NULL DEFAULT '',
  vita_backed INTEGER NOT NULL DEFAULT 0,
  vita_earned INTEGER NOT NULL DEFAULT 0,
  vita_pledged INTEGER NOT NULL DEFAULT 0,
  accepted_privacy_notice INTEGER NOT NULL DEFAULT 0,
  accepted_publishing_terms INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
)
`,
  `
CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
)
`,
  `CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id)`,
  `
CREATE TABLE IF NOT EXISTS wallet_profiles (
  id TEXT PRIMARY KEY,
  main_address TEXT NOT NULL UNIQUE,
  view_key TEXT NOT NULL,
  user_vita_address TEXT NOT NULL,
  wallet_mode TEXT NOT NULL DEFAULT 'external',
  wallet_web_url TEXT NOT NULL DEFAULT '',
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  institution TEXT NOT NULL DEFAULT '',
  research_area TEXT NOT NULL DEFAULT '',
  orcid_id TEXT,
  reputation INTEGER NOT NULL DEFAULT 0,
  vita_backed INTEGER NOT NULL DEFAULT 0,
  vita_earned INTEGER NOT NULL DEFAULT 0,
  vita_pledged INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
)
`,
  `
CREATE TABLE IF NOT EXISTS wallet_sessions (
  token TEXT PRIMARY KEY,
  wallet_id TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  FOREIGN KEY (wallet_id) REFERENCES wallet_profiles(id) ON DELETE CASCADE
)
`,
  `CREATE INDEX IF NOT EXISTS idx_wallet_sessions_wallet_id ON wallet_sessions(wallet_id)`,
]
function now() {
  return Date.now()
}

function json(body, init = {}) {
  return Response.json(body, init)
}

function normalizeText(value) {
  return String(value ?? '').trim()
}

function normalizeEmail(value) {
  return normalizeText(value).toLowerCase()
}

function buildId(prefix) {
  return `${prefix}_${crypto.randomUUID()}`
}

function normalizeWalletMode(value) {
  return normalizeText(value) === 'monero_web' ? 'monero_web' : 'external'
}

function randomToken() {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

async function sha256Hex(value) {
  const encoder = new TextEncoder()
  const buffer = await crypto.subtle.digest('SHA-256', encoder.encode(value))
  return Array.from(new Uint8Array(buffer), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

async function hashPassword(password, salt) {
  return sha256Hex(`${salt}:${password}`)
}

async function hashWallet(address) {
  return sha256Hex(address)
}

function parseBearerToken(request) {
  const authorization = request.headers.get('Authorization') || request.headers.get('authorization') || ''
  if (!authorization.startsWith('Bearer ')) return null
  return authorization.slice('Bearer '.length).trim() || null
}

async function ensureSchema(db) {
  for (const statement of AUTH_SCHEMA_STATEMENTS) {
    const sql = statement.replace(/\s+/g, ' ').trim()
    await db.exec(sql)
  }

  const ensureColumn = async (table, column, definition) => {
    const info = await db.prepare('PRAGMA table_info(' + table + ')').all()
    const columns = Array.isArray(info?.results) ? info.results : []
    if (!columns.some((item) => item.name === column)) {
      await db.exec('ALTER TABLE ' + table + ' ADD COLUMN ' + column + ' ' + definition)
    }
  }

  await ensureColumn('users', 'wallet_mode', "TEXT NOT NULL DEFAULT 'external'")
  await ensureColumn('users', 'wallet_web_url', "TEXT NOT NULL DEFAULT ''")
  await ensureColumn('wallet_profiles', 'wallet_mode', "TEXT NOT NULL DEFAULT 'external'")
  await ensureColumn('wallet_profiles', 'wallet_web_url', "TEXT NOT NULL DEFAULT ''")

  return db
}

function buildMoneroWallet(row) {
  if (!row?.monero_wallet_main_address) {
    return undefined
  }

  return {
    mainAddress: row.monero_wallet_main_address,
    viewKey: row.monero_wallet_view_key || '',
    userVitaAddress: row.monero_wallet_user_vita_address || '',
    linkedAt: Number(row.monero_wallet_linked_at || now()),
  }
}

function buildUser(row) {
  if (!row) return null

  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name || '',
    name: row.full_name || '',
    role: row.role || '',
    affiliation: row.affiliation || '',
    location: row.location || '',
    bio: row.bio || '',
    image: row.image || '',
    orcidId: row.orcid_id || undefined,
    institution: row.institution || undefined,
    researchArea: row.research_area || undefined,
    walletMode: row.wallet_mode || 'external',
    walletWebUrl: row.wallet_web_url || '',
    moneroWallet: buildMoneroWallet(row),
    vitaBacked: Number(row.vita_backed || 0),
    vitaEarned: Number(row.vita_earned || 0),
    vitaPledged: Number(row.vita_pledged || 0),
    createdAt: Number(row.created_at || now()),
  }
}

function buildWalletProfile(row) {
  if (!row) return null

  return {
    wallet: {
      mainAddress: row.main_address,
      viewKey: row.view_key,
      userVitaAddress: row.user_vita_address,
      createdAt: Number(row.created_at || now()),
    },
    fullName: row.full_name || '',
    email: row.email || '',
    institution: row.institution || '',
    researchArea: row.research_area || '',
    orcidId: row.orcid_id || undefined,
    walletMode: row.wallet_mode || 'external',
    walletWebUrl: row.wallet_web_url || '',
    reputation: Number(row.reputation || 0),
    vitaBacked: Number(row.vita_backed || 0),
    vitaEarned: Number(row.vita_earned || 0),
    vitaPledged: Number(row.vita_pledged || 0),
  }
}

async function getUserFromRequest(db, request) {
  const token = parseBearerToken(request)
  if (!token) return null

  const session = await db
    .prepare(
      `
      SELECT s.user_id, s.expires_at, u.*
      FROM sessions s
      JOIN users u ON u.id = s.user_id
      WHERE s.token = ?
      LIMIT 1
    `,
    )
    .bind(token)
    .first()

  if (!session) return null

  if (Number(session.expires_at || 0) < now()) {
    await db.prepare('DELETE FROM sessions WHERE token = ?').bind(token).run()
    return null
  }

  return buildUser(session)
}

async function getWalletFromRequest(db, request) {
  const token = parseBearerToken(request)
  if (!token) return null

  const session = await db
    .prepare(
      `
      SELECT s.wallet_id, s.expires_at, w.*
      FROM wallet_sessions s
      JOIN wallet_profiles w ON w.id = s.wallet_id
      WHERE s.token = ?
      LIMIT 1
    `,
    )
    .bind(token)
    .first()

  if (!session) return null

  if (Number(session.expires_at || 0) < now()) {
    await db.prepare('DELETE FROM wallet_sessions WHERE token = ?').bind(token).run()
    return null
  }

  return buildWalletProfile(session)
}

async function createSession(db, userId) {
  const token = randomToken()
  const createdAt = now()
  const expiresAt = createdAt + SESSION_TTL_MS

  await db
    .prepare(
      `
      INSERT INTO sessions (token, user_id, created_at, expires_at)
      VALUES (?, ?, ?, ?)
    `,
    )
    .bind(token, userId, createdAt, expiresAt)
    .run()

  return { token, expiresAt }
}

async function createWalletSession(db, walletId) {
  const token = randomToken()
  const createdAt = now()
  const expiresAt = createdAt + SESSION_TTL_MS

  await db
    .prepare(
      `
      INSERT INTO wallet_sessions (token, wallet_id, created_at, expires_at)
      VALUES (?, ?, ?, ?)
    `,
    )
    .bind(token, walletId, createdAt, expiresAt)
    .run()

  return { token, expiresAt }
}

async function fetchUserByEmail(db, email) {
  return db
    .prepare('SELECT * FROM users WHERE email = ? LIMIT 1')
    .bind(normalizeEmail(email))
    .first()
}

async function createUser(db, payload) {
  const email = normalizeEmail(payload.email)
  const fullName = normalizeText(payload.fullName || payload.name)
  const password = normalizeText(payload.password)

  if (!email) {
    throw new Error('El email es obligatorio.')
  }

  if (!fullName) {
    throw new Error('El nombre completo es obligatorio.')
  }

  if (password.length < 6) {
    throw new Error('La contraseÃ±a debe tener al menos 6 caracteres.')
  }

  const existing = await fetchUserByEmail(db, email)
  if (existing) {
    throw new Error('Ese email ya estÃ¡ registrado.')
  }

  const salt = randomToken()
  const passwordHash = await hashPassword(password, salt)
  const createdAt = now()
  const user = {
    id: buildId('user'),
    email,
    password_hash: passwordHash,
    password_salt: salt,
    full_name: fullName,
    role: normalizeText(payload.role),
    affiliation: normalizeText(payload.affiliation),
    location: normalizeText(payload.location),
    bio: normalizeText(payload.bio),
    image: normalizeText(payload.image),
    orcid_id: normalizeText(payload.orcidId),
    institution: normalizeText(payload.institution),
    research_area: normalizeText(payload.researchArea),
    wallet_mode: normalizeWalletMode(payload.walletMode),
    wallet_web_url: normalizeText(payload.walletWebUrl),
    monero_wallet_main_address: null,
    monero_wallet_view_key: null,
    monero_wallet_user_vita_address: null,
    monero_wallet_linked_at: null,
    vita_backed: 0,
    vita_earned: 0,
    vita_pledged: 0,
    accepted_privacy_notice: payload.acceptedPrivacyNotice ? 1 : 0,
    accepted_publishing_terms: payload.acceptedPublishingTerms ? 1 : 0,
    created_at: createdAt,
    updated_at: createdAt,
  }

  await db
    .prepare(
      `
      INSERT INTO users (
        id, email, password_hash, password_salt, full_name, role, affiliation, location, bio, image,
        orcid_id, institution, research_area, wallet_mode, wallet_web_url, monero_wallet_main_address, monero_wallet_view_key,
        monero_wallet_user_vita_address, monero_wallet_linked_at, vita_backed, vita_earned, vita_pledged,
        accepted_privacy_notice, accepted_publishing_terms, created_at, updated_at
      )
      VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
    `,
    )
    .bind(
      user.id,
      user.email,
      user.password_hash,
      user.password_salt,
      user.full_name,
      user.role,
      user.affiliation,
      user.location,
      user.bio,
      user.image,
      user.orcid_id,
      user.institution,
      user.research_area,
      user.wallet_mode,
      user.wallet_web_url,
      user.monero_wallet_main_address,
      user.monero_wallet_view_key,
      user.monero_wallet_user_vita_address,
      user.monero_wallet_linked_at,
      user.vita_backed,
      user.vita_earned,
      user.vita_pledged,
      user.accepted_privacy_notice,
      user.accepted_publishing_terms,
      user.created_at,
      user.updated_at,
    )
    .run()

  const { token } = await createSession(db, user.id)
  const saved = await db.prepare('SELECT * FROM users WHERE id = ? LIMIT 1').bind(user.id).first()

  return {
    token,
    user: buildUser(saved),
  }
}

async function loginUser(db, payload) {
  const email = normalizeEmail(payload.email)
  const password = normalizeText(payload.password)

  if (!email) throw new Error('El email es obligatorio.')
  if (!password) throw new Error('La contraseÃ±a es obligatoria.')

  const user = await fetchUserByEmail(db, email)
  if (!user) {
    throw new Error('Email o contraseÃ±a incorrectos.')
  }

  const passwordHash = await hashPassword(password, user.password_salt)
  if (passwordHash !== user.password_hash) {
    throw new Error('Email o contraseÃ±a incorrectos.')
  }

  const { token } = await createSession(db, user.id)
  return {
    token,
    user: buildUser(user),
  }
}

async function updateUserProfile(db, request, updates) {
  const user = await getUserFromRequest(db, request)
  if (!user) {
    return json({ error: 'No autorizado.' }, { status: 401 })
  }

  const current = await db.prepare('SELECT * FROM users WHERE id = ? LIMIT 1').bind(user.id).first()
  if (!current) {
    return json({ error: 'Perfil no encontrado.' }, { status: 404 })
  }

  const next = {
    full_name: normalizeText(updates.fullName || updates.name || current.full_name),
    role: normalizeText(updates.role || current.role),
    affiliation: normalizeText(updates.affiliation || current.affiliation),
    location: normalizeText(updates.location || current.location),
    bio: normalizeText(updates.bio || current.bio),
    image: normalizeText(updates.image || current.image),
    orcid_id: normalizeText(updates.orcidId || current.orcid_id),
    institution: normalizeText(updates.institution || current.institution),
    research_area: normalizeText(updates.researchArea || current.research_area),
    wallet_mode: normalizeWalletMode(updates.walletMode ?? current.wallet_mode),
    wallet_web_url: normalizeText(updates.walletWebUrl ?? current.wallet_web_url),
    updated_at: now(),
  }

  await db
    .prepare(
      `
      UPDATE users
      SET full_name = ?, role = ?, affiliation = ?, location = ?, bio = ?, image = ?,
          orcid_id = ?, institution = ?, research_area = ?, wallet_mode = ?, wallet_web_url = ?, updated_at = ?
      WHERE id = ?
    `,
    )
    .bind(
      next.full_name,
      next.role,
      next.affiliation,
      next.location,
      next.bio,
      next.image,
      next.orcid_id,
      next.institution,
      next.research_area,
      next.wallet_mode,
      next.wallet_web_url,
      next.updated_at,
      user.id,
    )
    .run()

  const saved = await db.prepare('SELECT * FROM users WHERE id = ? LIMIT 1').bind(user.id).first()
  return json({ user: buildUser(saved) })
}

async function linkUserWallet(db, request, payload) {
  const user = await getUserFromRequest(db, request)
  if (!user) {
    return json({ error: 'No autorizado.' }, { status: 401 })
  }

  const mainAddress = normalizeText(payload.mainAddress)
  const viewKey = normalizeText(payload.viewKey)
  const walletMode = normalizeWalletMode(payload.walletMode)
  const walletWebUrl = normalizeText(payload.walletWebUrl)

  if (!/^[48][a-zA-Z0-9]{94}$/.test(mainAddress)) {
    return json({ error: 'La direcciÃ³n Monero no tiene un formato vÃ¡lido.' }, { status: 400 })
  }

  if (viewKey && !/^[a-fA-F0-9]{64}$/.test(viewKey)) {
    return json({ error: 'La view key pÃºblica no tiene un formato vÃ¡lido.' }, { status: 400 })
  }

  const userVitaAddress = await hashWallet(mainAddress)
  const linkedAt = now()

  await db
    .prepare(
      `
      UPDATE users
      SET monero_wallet_main_address = ?, monero_wallet_view_key = ?,
          monero_wallet_user_vita_address = ?, monero_wallet_linked_at = ?,
          wallet_mode = ?, wallet_web_url = ?, updated_at = ?
      WHERE id = ?
    `,
    )
    .bind(
      mainAddress,
      viewKey || '',
      userVitaAddress,
      linkedAt,
      walletMode,
      walletWebUrl,
      linkedAt,
      user.id,
    )
    .run()

  const saved = await db.prepare('SELECT * FROM users WHERE id = ? LIMIT 1').bind(user.id).first()
  return json({ user: buildUser(saved) })
}

async function upsertWalletProfile(db, payload) {
  const mainAddress = normalizeText(payload.mainAddress)
  const viewKey = normalizeText(payload.viewKey)
  const walletMode = normalizeWalletMode(payload.walletMode)
  const walletWebUrl = normalizeText(payload.walletWebUrl)

  if (!/^[48][a-zA-Z0-9]{94}$/.test(mainAddress)) {
    throw new Error('La direcciÃ³n Monero no tiene un formato vÃ¡lido.')
  }

  if (viewKey && !/^[a-fA-F0-9]{64}$/.test(viewKey)) {
    throw new Error('La view key pÃºblica no tiene un formato vÃ¡lido.')
  }

  const userVitaAddress = await hashWallet(mainAddress)
  const existing = await db
    .prepare('SELECT * FROM wallet_profiles WHERE main_address = ? LIMIT 1')
    .bind(mainAddress)
    .first()

  const wallet = {
    id: existing?.id || buildId('wallet'),
    main_address: mainAddress,
    view_key: viewKey || '',
    user_vita_address: userVitaAddress,
    wallet_mode: walletMode,
    wallet_web_url: walletWebUrl,
    full_name: normalizeText(payload.fullName || existing?.full_name || ''),
    email: normalizeText(payload.email || existing?.email || ''),
    institution: normalizeText(payload.institution || existing?.institution || ''),
    research_area: normalizeText(payload.researchArea || existing?.research_area || ''),
    orcid_id: normalizeText(payload.orcidId || existing?.orcid_id || ''),
    reputation: Number(payload.reputation ?? existing?.reputation ?? 0),
    vita_backed: Number(payload.vitaBacked ?? existing?.vita_backed ?? 0),
    vita_earned: Number(payload.vitaEarned ?? existing?.vita_earned ?? 0),
    vita_pledged: Number(payload.vitaPledged ?? existing?.vita_pledged ?? 0),
    created_at: Number(existing?.created_at || now()),
    updated_at: now(),
  }

  if (existing) {
    await db
      .prepare(
        `
        UPDATE wallet_profiles
        SET view_key = ?, user_vita_address = ?, wallet_mode = ?, wallet_web_url = ?, full_name = ?, email = ?, institution = ?,
            research_area = ?, orcid_id = ?, reputation = ?, vita_backed = ?, vita_earned = ?,
            vita_pledged = ?, updated_at = ?
        WHERE id = ?
      `,
      )
      .bind(
        wallet.view_key || '',
        wallet.user_vita_address,
        wallet.wallet_mode,
        wallet.wallet_web_url,
        wallet.full_name,
        wallet.email,
        wallet.institution,
        wallet.research_area,
        wallet.orcid_id,
        wallet.reputation,
        wallet.vita_backed,
        wallet.vita_earned,
        wallet.vita_pledged,
        wallet.updated_at,
        wallet.id,
      )
      .run()
  } else {
    await db
      .prepare(
        `
        INSERT INTO wallet_profiles (
          id, main_address, view_key, user_vita_address, full_name, email, institution,
          research_area, orcid_id, wallet_mode, wallet_web_url, reputation, vita_backed, vita_earned,
          vita_pledged, created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      )
      .bind(
        wallet.id,
        wallet.main_address,
        wallet.view_key || '',
        wallet.user_vita_address,
        wallet.wallet_mode,
        wallet.wallet_web_url,
        wallet.full_name,
        wallet.email,
        wallet.institution,
        wallet.research_area,
        wallet.orcid_id,
        wallet.reputation,
        wallet.vita_backed,
        wallet.vita_earned,
        wallet.vita_pledged,
        wallet.created_at,
        wallet.updated_at,
      )
      .run()
  }

  const saved = await db.prepare('SELECT * FROM wallet_profiles WHERE id = ? LIMIT 1').bind(wallet.id).first()
  return buildWalletProfile(saved)
}

async function loginWallet(db, payload) {
  const wallet = await upsertWalletProfile(db, payload)
  const { token } = await createWalletSession(db, wallet.wallet.userVitaAddress)
  return { token, user: wallet }
}

async function updateWalletProfile(db, request, updates) {
  const wallet = await getWalletFromRequest(db, request)
  if (!wallet) {
    return json({ error: 'No autorizado.' }, { status: 401 })
  }

  const current = await db
    .prepare('SELECT * FROM wallet_profiles WHERE user_vita_address = ? LIMIT 1')
    .bind(wallet.wallet.userVitaAddress)
    .first()

  if (!current) {
    return json({ error: 'Perfil de wallet no encontrado.' }, { status: 404 })
  }

  await db
    .prepare(
      `
      UPDATE wallet_profiles
      SET full_name = ?, email = ?, institution = ?, research_area = ?, orcid_id = ?, updated_at = ?
      WHERE id = ?
    `,
    )
    .bind(
      normalizeText(updates.fullName || updates.name || current.full_name),
      normalizeText(updates.email || current.email),
      normalizeText(updates.institution || current.institution),
      normalizeText(updates.researchArea || current.research_area),
      normalizeText(updates.orcidId || current.orcid_id),
      now(),
      current.id,
    )
    .run()

  const saved = await db.prepare('SELECT * FROM wallet_profiles WHERE id = ? LIMIT 1').bind(current.id).first()
  return json({ user: buildWalletProfile(saved) })
}

export {
  buildUser,
  buildWalletProfile,
  createSession,
  createWalletSession,
  createUser,
  ensureSchema,
  getUserFromRequest,
  getWalletFromRequest,
  json,
  linkUserWallet,
  loginUser,
  loginWallet,
  normalizeEmail,
  normalizeText,
  parseBearerToken,
  upsertWalletProfile,
  updateUserProfile,
  updateWalletProfile,
}


