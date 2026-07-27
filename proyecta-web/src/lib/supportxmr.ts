export interface SupportXMRNormalizedStats {
  hashrate: number
  totalHashes: number
  balance: number
  totalPaid: number
  lastHash: number
  minPayout: number
  confirmedBalance?: number
  confirmedHashrate?: number
  confirmedTotalHashes?: number
  confirmedTotalPaid?: number
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
  externalMiningDetected?: boolean
  poolIdentifier?: string | null
  localMiners?: number
  localBrowserMiners?: number
  localNativeMiners?: number
  localBrowserHashrate?: number
  localNativeHashrate?: number
  bridgeConnected?: boolean
  bridgeMiners?: number
  bridgeAcceptedShares?: number
  bridgeRejectedShares?: number
  poolDifficulty?: number
  expectedShareSeconds?: number | null
  shareProbability95Seconds?: number | null
  nonceCoordinationActive?: boolean
  poolExpiry?: number | null
  baselineCapturedAt?: number | null
  poolDataConfirmed?: boolean
  poolPendingBalance?: number
  poolTotalPaid?: number
  poolHashrate?: number
  poolTotalHashes?: number
  poolValidShares?: number
  poolInvalidShares?: number
  poolWorkers?: string[]
  poolWorkerCount?: number
  poolLastHash?: number
  appWorkers?: string[]
  appWorkerCount?: number
  appHashrate?: number
  appTotalHashes?: number
  appValidShares?: number
  appInvalidShares?: number
  appLastHash?: number
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
  const confirmedHashrate = data?.confirmedHashrate ?? data?.confirmed?.hashrate ?? 0
  const confirmedTotalHashes = data?.confirmedTotalHashes ?? data?.confirmed?.totalHashes ?? 0
  const confirmedTotalPaid = data?.confirmedTotalPaid ?? data?.confirmed?.totalPaid ?? 0
  const localHashrate = data?.localHashrate ?? 0
  const visibleHashrate = data?.visibleHashrate ?? data?.hashrate
  const localTotalHashes = data?.localTotalHashes ?? 0
  const visibleTotalHashes = data?.visibleTotalHashes ?? data?.totalHashes
  const confirmedValidShares = data?.confirmedValidShares ?? data?.validShares ?? 0
  const confirmedInvalidShares = data?.confirmedInvalidShares ?? data?.invalidShares ?? 0
  const localMiners = data?.localMiners ?? 0
  const localBrowserMiners = data?.localBrowserMiners ?? 0
  const localNativeMiners = data?.localNativeMiners ?? 0
  const localBrowserHashrate = data?.localBrowserHashrate ?? 0
  const localNativeHashrate = data?.localNativeHashrate ?? 0
  const bridgeMiners = data?.bridgeMiners ?? 0
  const bridgeAcceptedShares = data?.bridgeAcceptedShares ?? 0
  const bridgeRejectedShares = data?.bridgeRejectedShares ?? 0
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
    confirmedBalance: isUnified
      ? parseAtomicXmr(confirmedBalance)
      : parseAtomicXmr(data?.balance ?? data?.amtDue ?? data?.due ?? 0),
    confirmedHashrate: isUnified ? parseDecimalLike(confirmedHashrate) : undefined,
    confirmedTotalHashes: isUnified ? parseHashCount(confirmedTotalHashes) : undefined,
    confirmedTotalPaid: isUnified ? parseAtomicXmr(confirmedTotalPaid) : undefined,
    localBalance: isUnified ? parseAtomicXmr(localBalance) : undefined,
    visibleBalance: isUnified ? parseAtomicXmr(visibleBalance ?? data?.balance ?? 0) : undefined,
    localHashrate: isUnified ? parseDecimalLike(localHashrate) : undefined,
    localTotalHashes: isUnified ? parseHashCount(localTotalHashes) : undefined,
    visibleHashrate: isUnified ? parseDecimalLike(visibleHashrate ?? data?.hashrate ?? 0) : undefined,
    visibleTotalHashes: isUnified ? parseHashCount(visibleTotalHashes ?? data?.totalHashes ?? 0) : undefined,
    isLocalActive: isUnified ? Boolean(data?.isLocalActive) : undefined,
    isPoolConfirmed: isUnified
      ? Boolean(data?.isPoolConfirmed)
      : parseHashCount(data?.totalHashes ?? data?.total_hashes ?? data?.hashes ?? 0) > 0 ||
        parseAtomicXmr(data?.balance ?? data?.amtDue ?? data?.due ?? 0) > 0 ||
        parseAtomicXmr(data?.totalPaid ?? data?.paid ?? 0) > 0 ||
        parseHashCount(data?.validShares ?? data?.valid_shares ?? 0) > 0,
    confirmedValidShares: isUnified ? parseHashCount(confirmedValidShares) : parseHashCount(data?.validShares ?? 0),
    confirmedInvalidShares: isUnified ? parseHashCount(confirmedInvalidShares) : parseHashCount(data?.invalidShares ?? 0),
    externalMiningActive: isUnified ? Boolean(data?.externalMiningActive ?? data?.isPoolConfirmed) : parseHashCount(data?.validShares ?? 0) > 0,
    poolIdentifier: typeof data?.poolIdentifier === 'string' ? data.poolIdentifier : typeof data?.identifier === 'string' ? data.identifier : null,
    localMiners: isUnified ? parseHashCount(localMiners) : undefined,
    localBrowserMiners: isUnified ? parseHashCount(localBrowserMiners) : undefined,
    localNativeMiners: isUnified ? parseHashCount(localNativeMiners) : undefined,
    localBrowserHashrate: isUnified ? parseDecimalLike(localBrowserHashrate) : undefined,
    localNativeHashrate: isUnified ? parseDecimalLike(localNativeHashrate) : undefined,
    bridgeConnected: isUnified ? Boolean(data?.bridgeConnected) : undefined,
    bridgeMiners: isUnified ? parseHashCount(bridgeMiners) : undefined,
    bridgeAcceptedShares: isUnified ? parseHashCount(bridgeAcceptedShares) : undefined,
    bridgeRejectedShares: isUnified ? parseHashCount(bridgeRejectedShares) : undefined,
    poolDifficulty: isUnified ? parseDecimalLike(data?.poolDifficulty ?? 0) : undefined,
    expectedShareSeconds: isUnified && data?.expectedShareSeconds != null ? parseDecimalLike(data.expectedShareSeconds) : null,
    shareProbability95Seconds: isUnified && data?.shareProbability95Seconds != null ? parseDecimalLike(data.shareProbability95Seconds) : null,
    nonceCoordinationActive: isUnified ? Boolean(data?.nonceCoordinationActive) : undefined,
    poolExpiry: isUnified ? (Number(data?.poolExpiry || 0) || null) : undefined,
    baselineCapturedAt: isUnified ? (Number(data?.baselineCapturedAt || 0) || null) : undefined,
    poolDataConfirmed: isUnified ? Boolean(data?.poolDataConfirmed) : undefined,
    poolPendingBalance: isUnified ? parseAtomicXmr(data?.poolPendingBalance ?? 0) : undefined,
    poolTotalPaid: isUnified ? parseAtomicXmr(data?.poolTotalPaid ?? 0) : undefined,
    poolHashrate: isUnified ? parseDecimalLike(data?.poolHashrate ?? 0) : undefined,
    poolTotalHashes: isUnified ? parseHashCount(data?.poolTotalHashes ?? 0) : undefined,
    poolValidShares: isUnified ? parseHashCount(data?.poolValidShares ?? 0) : undefined,
    poolInvalidShares: isUnified ? parseHashCount(data?.poolInvalidShares ?? 0) : undefined,
    poolWorkers: isUnified && Array.isArray(data?.poolWorkers)
      ? data.poolWorkers.filter((worker: unknown): worker is string => typeof worker === 'string' && Boolean(worker.trim())).map((worker: string) => worker.trim())
      : undefined,
    poolWorkerCount: isUnified ? parseHashCount(data?.poolWorkerCount ?? 0) : undefined,
    poolLastHash: isUnified ? parseHashCount(data?.poolLastHash ?? 0) : undefined,
    appWorkers: isUnified && Array.isArray(data?.appWorkers)
      ? data.appWorkers.filter((worker: unknown): worker is string => typeof worker === 'string' && Boolean(worker.trim())).map((worker: string) => worker.trim())
      : undefined,
    appWorkerCount: isUnified ? parseHashCount(data?.appWorkerCount ?? 0) : undefined,
    appHashrate: isUnified ? parseDecimalLike(data?.appHashrate ?? 0) : undefined,
    appTotalHashes: isUnified ? parseHashCount(data?.appTotalHashes ?? 0) : undefined,
    appValidShares: isUnified ? parseHashCount(data?.appValidShares ?? 0) : undefined,
    appInvalidShares: isUnified ? parseHashCount(data?.appInvalidShares ?? 0) : undefined,
    appLastHash: isUnified ? parseHashCount(data?.appLastHash ?? 0) : undefined,
    status: isUnified ? (typeof data?.status === 'string' ? data.status : undefined) : undefined,
  }
}

