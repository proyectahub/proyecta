export interface SupportXMRNormalizedStats {
  hashrate: number
  totalHashes: number
  balance: number
  totalPaid: number
  lastHash: number
  minPayout: number
}

function parseDecimalLike(value: unknown): number {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0
  }

  if (typeof value !== 'string') {
    return 0
  }

  const normalized = value.trim().replace(/\s+/g, '').replace(',', '.')
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : 0
}

function parseAtomicXmr(value: unknown): number {
  const raw = parseDecimalLike(value)
  if (raw === 0) return 0

  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (/[.,]/.test(trimmed)) {
      return raw
    }
  }

  if (Math.abs(raw) >= 1e6) {
    return raw / 1e12
  }

  return raw
}

function parseHashCount(value: unknown): number {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? Math.max(0, Math.trunc(value)) : 0
  }

  if (typeof value !== 'string') {
    return 0
  }

  const digits = value.replace(/[^0-9-]/g, '')
  if (!digits) return 0
  const parsed = Number(digits)
  return Number.isFinite(parsed) ? Math.max(0, Math.trunc(parsed)) : 0
}

export function normalizeSupportXMRStats(data: any): SupportXMRNormalizedStats {
  return {
    hashrate: parseDecimalLike(data?.hashrate ?? data?.hash ?? 0),
    totalHashes: parseHashCount(data?.totalHashes ?? data?.total_hashes ?? data?.hashes ?? 0),
    balance: parseAtomicXmr(data?.balance ?? data?.amtDue ?? data?.due ?? 0),
    totalPaid: parseAtomicXmr(data?.totalPaid ?? data?.paid ?? 0),
    lastHash: parseHashCount(data?.lastHash ?? Date.now()),
    minPayout: parseAtomicXmr(data?.minPayout ?? 0.3) || 0.3,
  }
}
