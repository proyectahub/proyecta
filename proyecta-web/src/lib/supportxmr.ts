export interface SupportXMRNormalizedStats {
  hashrate: number
  totalHashes: number
  balance: number
  totalPaid: number
  lastHash: number
  minPayout: number
  confirmedBalance?: number
  localBalance?: number
  visibleBalance?: number
  localHashrate?: number
  localTotalHashes?: number
  visibleHashrate?: number
  visibleTotalHashes?: number
  isLocalActive?: boolean
  isPoolConfirmed?: boolean
  status?: string
  confirmedValidShares?: number
  confirmedInvalidShares?: number
  externalMiningActive?: boolean
  poolIdentifier?: string | null
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
  const visibleBalance = data?.visibleBalance ?? data?.balance
  const localBalance = data?.localBalance ?? data?.localVisibleBalance ?? 0
  const confirmedBalance = data?.confirmedBalance ?? data?.confirmed?.balance ?? 0
  const localHashrate = data?.localHashrate ?? 0
  const visibleHashrate = data?.visibleHashrate ?? data?.hashrate
  const localTotalHashes = data?.localTotalHashes ?? 0
  const visibleTotalHashes = data?.visibleTotalHashes ?? data?.totalHashes
  const confirmedValidShares = data?.confirmedValidShares ?? data?.validShares ?? 0
  const confirmedInvalidShares = data?.confirmedInvalidShares ?? data?.invalidShares ?? 0
  const isUnified =
    data?.visibleBalance !== undefined ||
    data?.confirmedBalance !== undefined ||
    data?.localBalance !== undefined ||
    data?.isLocalActive !== undefined ||
    data?.isPoolConfirmed !== undefined ||
    typeof data?.status === 'string'

  return {
    hashrate: parseDecimalLike(visibleHashrate ?? data?.hashrate ?? data?.hash ?? 0),
    totalHashes: parseHashCount(visibleTotalHashes ?? data?.totalHashes ?? data?.total_hashes ?? data?.hashes ?? 0),
    balance: parseAtomicXmr(visibleBalance ?? data?.balance ?? data?.amtDue ?? data?.due ?? 0),
    totalPaid: parseAtomicXmr(data?.totalPaid ?? data?.paid ?? 0),
    lastHash: parseHashCount(data?.lastHash ?? Date.now()),
    minPayout: parseAtomicXmr(data?.minPayout ?? 0.3) || 0.3,
    confirmedBalance: isUnified ? parseAtomicXmr(confirmedBalance) : undefined,
    localBalance: isUnified ? parseAtomicXmr(localBalance) : undefined,
    visibleBalance: isUnified ? parseAtomicXmr(visibleBalance ?? data?.balance ?? 0) : undefined,
    localHashrate: isUnified ? parseDecimalLike(localHashrate) : undefined,
    localTotalHashes: isUnified ? parseHashCount(localTotalHashes) : undefined,
    visibleHashrate: isUnified ? parseDecimalLike(visibleHashrate ?? data?.hashrate ?? 0) : undefined,
    visibleTotalHashes: isUnified ? parseHashCount(visibleTotalHashes ?? data?.totalHashes ?? 0) : undefined,
    isLocalActive: isUnified ? Boolean(data?.isLocalActive) : undefined,
    isPoolConfirmed: isUnified ? Boolean(data?.isPoolConfirmed) : undefined,
    confirmedValidShares: isUnified ? parseHashCount(confirmedValidShares) : parseHashCount(data?.validShares ?? 0),
    confirmedInvalidShares: isUnified ? parseHashCount(confirmedInvalidShares) : parseHashCount(data?.invalidShares ?? 0),
    externalMiningActive: isUnified ? Boolean(data?.externalMiningActive ?? data?.isPoolConfirmed) : parseHashCount(data?.validShares ?? 0) > 0,
    poolIdentifier: typeof data?.poolIdentifier === 'string' ? data.poolIdentifier : typeof data?.identifier === 'string' ? data.identifier : null,
    status: isUnified ? (typeof data?.status === 'string' ? data.status : undefined) : undefined,
  }
}

