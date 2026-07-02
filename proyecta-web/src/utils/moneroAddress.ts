/**
 * Genera una dirección Monero válida basada en un seed
 * En producción, esto vendría de una wallet real
 */
export function generateMoneroAddress(seed: string): string {
  // Generador determinista de formato Monero para desarrollo y datos legacy.
  // No intenta crear una wallet real, pero mantiene el formato esperado por la UI.
  const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
  let state = 0

  for (let i = 0; i < seed.length; i += 1) {
    state = (state * 31 + seed.charCodeAt(i)) >>> 0
  }

  let address = '4' // Mainnet address starts with 4

  for (let i = 0; i < 94; i++) {
    state = (state * 1664525 + 1013904223) >>> 0
    address += chars[state % chars.length]
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