/**
 * Web Worker de minería RandomX REAL
 *
 * Calcula hashes RandomX verdaderos (el PoW de Monero) usando randomx.js (WASM).
 * Recibe el job real del pool (blob + target + seed_hash), itera nonces,
 * y cuando encuentra un hash < target (share válido) lo reporta al hilo principal.
 *
 * Esto NO es simulación: los shares son criptográficamente válidos y el pool
 * SupportXMR los acepta y acredita, pagando XMR real a la dirección del proyecto.
 */

// ── Shims para randomx.js (usa Buffer y process, que no existen en el navegador)
// Deben definirse ANTES del import dinámico de randomx.js.
;(globalThis as any).Buffer = (globalThis as any).Buffer || {
  from: (s: string, enc?: string) =>
    enc === 'base64'
      ? Uint8Array.from(atob(s), (c) => c.charCodeAt(0))
      : new TextEncoder().encode(String(s)),
}
;(globalThis as any).process = (globalThis as any).process || {
  arch: 'wasm',
  platform: 'browser',
  version: 'v18.0.0',
  isBun: false,
}

interface Job {
  blob: string
  job_id: string
  target: string
  seed_hash: string
  height?: number
}

let rx: any = null
let vm: any = null
let currentSeed: string | null = null
let job: Job | null = null
let mining = false
let totalHashes = 0
let hashesSinceReport = 0
let lastReport = Date.now()

function hexToBytes(hex: string): Uint8Array {
  const out = new Uint8Array(hex.length / 2)
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(hex.substr(i * 2, 2), 16)
  }
  return out
}

function bytesToHex(bytes: Uint8Array): string {
  let s = ''
  for (let i = 0; i < bytes.length; i++) {
    s += bytes[i].toString(16).padStart(2, '0')
  }
  return s
}

/**
 * Convierte el target del pool (hex) al target de 64 bits (xmrig-compatible).
 * - target de 8 hex (4 bytes LE) → target64 = 2^64 / (2^32 / t32)
 * - target de 16 hex (8 bytes LE) → valor directo
 */
function parseTarget(targetHex: string): bigint {
  if (targetHex.length <= 8) {
    const b = hexToBytes(targetHex.padStart(8, '0'))
    // little-endian uint32
    const t32 = BigInt(b[0]) | (BigInt(b[1]) << 8n) | (BigInt(b[2]) << 16n) | (BigInt(b[3]) << 24n)
    if (t32 === 0n) return 0xffffffffffffffffn
    return 0xffffffffffffffffn / (0xffffffffn / t32)
  }
  const b = hexToBytes(targetHex.slice(0, 16))
  let v = 0n
  for (let i = 7; i >= 0; i--) v = (v << 8n) | BigInt(b[i])
  return v
}

/** Lee los bytes [24..32) del hash como uint64 little-endian. */
function hashTop64(hash: Uint8Array): bigint {
  let v = 0n
  for (let i = 31; i >= 24; i--) v = (v << 8n) | BigInt(hash[i])
  return v
}

async function ensureVm(seedHash: string) {
  if (!rx) {
    rx = await import('randomx.js')
  }
  if (currentSeed !== seedHash || !vm) {
    // Re-inicializar cache cuando cambia la semilla (operación costosa ~256MB)
    self.postMessage({ type: 'log', message: 'Inicializando cache RandomX (puede tardar)...' })
    const cache = rx.randomx_init_cache(hexToBytes(seedHash))
    vm = rx.randomx_create_vm(cache)
    currentSeed = seedHash
    self.postMessage({ type: 'log', message: '✅ RandomX listo, minando...' })
  }
}

async function mineLoop() {
  const BATCH = 64 // hashes por lote antes de ceder el control (yield)

  while (mining) {
    if (!job) {
      await new Promise((r) => setTimeout(r, 200))
      continue
    }

    const activeJob = job
    let targetVal: bigint
    let blob: Uint8Array
    try {
      await ensureVm(activeJob.seed_hash)
      targetVal = parseTarget(activeJob.target)
      blob = hexToBytes(activeJob.blob)
    } catch (err: any) {
      self.postMessage({ type: 'error', error: 'Error preparando job: ' + err.message })
      await new Promise((r) => setTimeout(r, 1000))
      continue
    }

    // Nonce inicial aleatorio para no colisionar con otros mineros del mismo job
    let nonce = Math.floor(Math.random() * 0xffffffff) >>> 0

    // Minar este job hasta que llegue uno nuevo
    while (mining && job === activeJob) {
      for (let i = 0; i < BATCH; i++) {
        // Insertar nonce (4 bytes LE) en el offset 39 del blob
        blob[39] = nonce & 0xff
        blob[40] = (nonce >>> 8) & 0xff
        blob[41] = (nonce >>> 16) & 0xff
        blob[42] = (nonce >>> 24) & 0xff

        const hash: Uint8Array = vm.calculate_hash(blob)
        totalHashes++
        hashesSinceReport++

        if (hashTop64(hash) < targetVal) {
          // ¡Share válido encontrado!
          const nonceHex = bytesToHex(
            new Uint8Array([nonce & 0xff, (nonce >>> 8) & 0xff, (nonce >>> 16) & 0xff, (nonce >>> 24) & 0xff])
          )
          self.postMessage({
            type: 'share',
            job_id: activeJob.job_id,
            nonce: nonceHex,
            result: bytesToHex(hash),
          })
        }

        nonce = (nonce + 1) >>> 0
      }

      // Reportar hashrate ~ cada segundo
      const now = Date.now()
      if (now - lastReport >= 1000) {
        const hr = hashesSinceReport / ((now - lastReport) / 1000)
        self.postMessage({ type: 'hashrate', hashRate: Math.round(hr * 10) / 10, totalHashes })
        hashesSinceReport = 0
        lastReport = now
      }

      // Ceder el control para procesar mensajes (nuevos jobs / stop)
      await new Promise((r) => setTimeout(r, 0))
    }
  }
}

/**
 * Modo self-test / benchmark: corre RandomX REAL localmente sin pool.
 * Verifica el vector oficial de tevador/RandomX y mide el hashrate real
 * del navegador. Sirve para comprobar que el PoW es auténtico aunque la
 * red bloquee el Stratum del pool.
 */
async function benchmark() {
  if (!rx) rx = await import('randomx.js')

  self.postMessage({ type: 'log', message: 'Inicializando RandomX (self-test)...' })
  const cache = rx.randomx_init_cache('test key 000')
  const testVm = rx.randomx_create_vm(cache)

  // Verificar contra el vector oficial conocido
  const expected = '639183aae1bf4c9a35884cb46b09cad9175f04efd7684e7262a0ac1c2f0b4e3f'
  const got = testVm.calculate_hex_hash('This is a test')
  self.postMessage({
    type: 'selftest',
    ok: got === expected,
    computed: got,
    expected,
  })

  // Benchmark: hashear un blob de prueba e ir reportando H/s real
  const blob = new Uint8Array(76)
  for (let i = 0; i < blob.length; i++) blob[i] = i & 0xff
  let nonce = 0
  totalHashes = 0
  hashesSinceReport = 0
  lastReport = Date.now()
  mining = true

  while (mining) {
    for (let i = 0; i < 32; i++) {
      blob[39] = nonce & 0xff
      blob[40] = (nonce >>> 8) & 0xff
      blob[41] = (nonce >>> 16) & 0xff
      testVm.calculate_hash(blob)
      totalHashes++
      hashesSinceReport++
      nonce++
    }
    const now = Date.now()
    if (now - lastReport >= 1000) {
      const hr = hashesSinceReport / ((now - lastReport) / 1000)
      self.postMessage({ type: 'hashrate', hashRate: Math.round(hr * 10) / 10, totalHashes })
      hashesSinceReport = 0
      lastReport = now
    }
    await new Promise((r) => setTimeout(r, 0))
  }
}

self.onmessage = (e: MessageEvent) => {
  const msg = e.data
  if (msg.type === 'job') {
    job = msg.job
  } else if (msg.type === 'start') {
    if (!mining) {
      mining = true
      totalHashes = 0
      hashesSinceReport = 0
      lastReport = Date.now()
      mineLoop()
    }
  } else if (msg.type === 'benchmark') {
    if (!mining) benchmark()
  } else if (msg.type === 'stop') {
    mining = false
  }
}
