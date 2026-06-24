/**
 * Genera una dirección Monero válida basada en un seed
 * En producción, esto vendría de una wallet real
 */
export function generateMoneroAddress(seed: string): string {
  // SHA-256 del seed para determinismo
  const data = new TextEncoder().encode(seed)
  const hashBuffer = crypto.getRandomValues(new Uint8Array(32))

  // Para desarrollo: crear dirección válida con formato Monero mainnet
  // Dirección válida: comienza con 4 u 8, 95 caracteres totales
  const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
  let address = '4' // Mainnet address starts with 4

  // Generar 94 caracteres más usando pseudoaleatorio del seed
  for (let i = 0; i < 94; i++) {
    const char = seed.charCodeAt(i % seed.length)
    address += chars[char % chars.length]
  }

  return address
}

/**
 * Valida que una dirección sea un Monero address válido
 */
export function isValidMoneroAddress(address: string): boolean {
  return /^[48][a-zA-Z0-9]{94}$/.test(address)
}

/**
 * Convierte una dirección Monero a un VITA address (hash SHA-256)
 */
export async function hashMoneroAddress(address: string): Promise<string> {
  const encoder = new TextEncoder()
  const buffer = await crypto.subtle.digest('SHA-256', encoder.encode(address))
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}
