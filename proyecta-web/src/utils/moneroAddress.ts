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
