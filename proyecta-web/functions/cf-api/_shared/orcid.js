const DEFAULT_ORCID_BASE_URL = 'https://orcid.org'
const DEFAULT_ORCID_API_BASE_URL = 'https://pub.orcid.org'

export function buildOrcidRedirectUri(request, env) {
  return env.ORCID_REDIRECT_URI || new URL('/cf-api/auth/orcid-callback', request.url).toString()
}

export function buildOrcidAuthorizeUrl({ clientId, redirectUri, state, baseUrl = DEFAULT_ORCID_BASE_URL }) {
  return (
    `${baseUrl.replace(/\/$/, '')}/oauth/authorize?client_id=${encodeURIComponent(clientId)}` +
    `&response_type=code` +
    `&scope=/authenticate` +
    `&state=${encodeURIComponent(state)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}`
  )
}

export function encodeOrcidState(payload) {
  const mode = payload?.mode === 'link' ? 'link' : 'login'
  const userId = encodeURIComponent(String(payload?.userId || ''))
  return `${mode}:${userId}`
}

export function decodeOrcidState(state) {
  const raw = String(state || '')
  const [modeRaw = 'login', userIdRaw = ''] = raw.split(':')
  return {
    mode: modeRaw === 'link' ? 'link' : 'login',
    userId: decodeURIComponent(userIdRaw || ''),
  }
}

export async function exchangeOrcidCode({ code, clientId, clientSecret, redirectUri, baseUrl = DEFAULT_ORCID_BASE_URL }) {
  const response = await fetch(`${baseUrl.replace(/\/$/, '')}/oauth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: clientId || '',
      client_secret: clientSecret || '',
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
    }),
  })

  return response.json()
}

export async function resolveOrcidDisplayName(accessToken, orcid, apiBaseUrl = DEFAULT_ORCID_API_BASE_URL) {
  if (!accessToken || !orcid) return ''

  try {
    const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/v3.0/${orcid}/person`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    })

    if (!response.ok) return ''

    const data = await response.json()
    const givenNames = data?.name?.['given-names']?.value || ''
    const familyName = data?.name?.['family-name']?.value || ''
    return `${givenNames} ${familyName}`.trim()
  } catch {
    return ''
  }
}

export async function findUserByOrcid(db, orcid) {
  return db.prepare('SELECT * FROM users WHERE orcid_id = ? LIMIT 1').bind(orcid).first()
}

export async function linkOrcidToUser(db, userId, orcid, displayName) {
  const current = await db.prepare('SELECT * FROM users WHERE id = ? LIMIT 1').bind(userId).first()
  if (!current) {
    throw new Error('No encontramos el perfil del investigador.')
  }

  const existingByOrcid = await findUserByOrcid(db, orcid)
  if (existingByOrcid && existingByOrcid.id !== current.id) {
    throw new Error('Ese ORCID ya está vinculado a otra cuenta.')
  }

  const nextName = displayName && (!current.full_name || String(current.full_name).startsWith('Investigador ORCID'))
    ? displayName
    : current.full_name

  const updatedAt = Date.now()
  await db
    .prepare(
      `
      UPDATE users
      SET orcid_id = ?, full_name = ?, updated_at = ?
      WHERE id = ?
    `,
    )
    .bind(orcid, nextName, updatedAt, current.id)
    .run()

  return db.prepare('SELECT * FROM users WHERE id = ? LIMIT 1').bind(current.id).first()
}
