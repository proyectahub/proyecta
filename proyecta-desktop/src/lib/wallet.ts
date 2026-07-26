const WALLET_STORAGE_KEY = 'proyecta:wallet-address:v1'

export function readStoredWallet() {
  if (typeof window === 'undefined') return ''
  return window.localStorage.getItem(WALLET_STORAGE_KEY)?.trim() ?? ''
}

export function persistWallet(value: string) {
  const wallet = value.trim()
  if (typeof window !== 'undefined') {
    if (wallet) {
      window.localStorage.setItem(WALLET_STORAGE_KEY, wallet)
    } else {
      window.localStorage.removeItem(WALLET_STORAGE_KEY)
    }
  }
  return wallet
}
