const WORKER_NAME_STORAGE_KEY = 'proyecta:worker-name:v1'

function randomSuffix() {
  const bytes = crypto.getRandomValues(new Uint8Array(4))
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('').slice(0, 8)
}

export function normalizeWorkerName(input: unknown) {
  const value = String(input ?? '').trim()
  const cleaned = value
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^[-_.]+|[-_.]+$/g, '')
    .slice(0, 32)

  return cleaned || `proyecta-${randomSuffix()}`
}

export function createRandomWorkerName() {
  return `proyecta-${randomSuffix()}`
}

export function readStoredWorkerName() {
  if (typeof window === 'undefined') return createRandomWorkerName()

  const stored = window.localStorage.getItem(WORKER_NAME_STORAGE_KEY)
  return normalizeWorkerName(stored || createRandomWorkerName())
}

export function persistWorkerName(value: string) {
  if (typeof window === 'undefined') return normalizeWorkerName(value)
  const normalized = normalizeWorkerName(value)
  window.localStorage.setItem(WORKER_NAME_STORAGE_KEY, normalized)
  return normalized
}
