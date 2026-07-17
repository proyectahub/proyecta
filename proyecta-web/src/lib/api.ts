export const API_BASE = import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? "http://localhost:3000" : "https://proyecta-production-c6d6.up.railway.app")
const DEMO_FALLBACK_ENV = import.meta.env.VITE_ALLOW_DEMO_FALLBACK !== "false"

const BACKEND_UNAVAILABLE_MESSAGE =
  "El acceso de Proyecta está temporalmente en modo local. La portada sigue disponible mientras se reconecta el servicio."

const NETWORK_ERROR_MESSAGE =
  "No pudimos conectar con el servidor en este momento. Verifica tu conexión a internet e intenta de nuevo."

function runningOnLocalHost() {
  if (typeof window === "undefined") return false
  const host = window.location.hostname.toLowerCase()
  return host === "localhost" || host === "127.0.0.1" || host === "::1"
}

export function isDemoFallbackEnabled() {
  return import.meta.env.DEV || DEMO_FALLBACK_ENV || runningOnLocalHost()
}

function stripTrailingSlash(value: string) {
  return value.replace(/\/+$/, "")
}

function isStaticPagesHost(hostname: string) {
  return hostname.endsWith(".pages.dev") || hostname === "proyecta.pages.dev"
}

function normalizeMiningApiUrl(sourceUrl: string) {
  const normalized = new URL(
    sourceUrl,
    typeof window !== "undefined" ? window.location.origin : "https://proyecta.pages.dev",
  )
  normalized.pathname = stripTrailingSlash(normalized.pathname)

  if (!normalized.pathname || normalized.pathname === "/") {
    normalized.pathname = "/api/mining"
  } else if (normalized.pathname.endsWith("/api")) {
    normalized.pathname = `${normalized.pathname}/mining`
  } else if (!normalized.pathname.endsWith("/api/mining")) {
    normalized.pathname = `${normalized.pathname}/api/mining`
  }

  normalized.search = ""
  normalized.hash = ""
  return stripTrailingSlash(normalized.toString())
}

export function resolveMiningApiBase() {
  if (import.meta.env.DEV) {
    return "http://localhost:3000/api/mining"
  }

  const configuredUrl = import.meta.env.VITE_MINING_API_URL || API_BASE
  try {
    return normalizeMiningApiUrl(configuredUrl)
  } catch {
    return normalizeMiningApiUrl(API_BASE)
  }
}

export function resolveMiningWebSocketUrl() {
  const configuredUrl = import.meta.env.VITE_MINING_WS_URL

  if (configuredUrl) {
    try {
      const normalized = new URL(
        configuredUrl,
        typeof window !== "undefined" ? window.location.origin : "https://proyecta.pages.dev",
      )
      if (!isStaticPagesHost(normalized.hostname)) {
        return normalized.toString()
      }
    } catch {
      // Si la variable está mal formada, se calcula desde el backend HTTP.
    }
  }

  if (import.meta.env.DEV) {
    return "ws://localhost:3000/ws/mining"
  }

  const sourceUrl = resolveMiningApiBase()

  if (typeof window !== "undefined" && sourceUrl && sourceUrl !== "/api") {
    try {
      const normalized = new URL(sourceUrl, window.location.origin)
      const wsProtocol = normalized.protocol === "https:" ? "wss:" : "ws:"
      const basePath = normalized.pathname.replace(/\/api\/?$/, "").replace(/\/api\/mining\/?$/, "")
      return `${wsProtocol}//${normalized.host}${basePath}/ws/mining`
    } catch {
      // Si la URL no se puede normalizar, caemos al host actual como último recurso.
    }
  }

  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:"
  return `${protocol}//${window.location.host}/ws/mining`
}

export async function parseApiJson(response: Response) {
  const contentType = response.headers.get("content-type") ?? ""

  if (!contentType.toLowerCase().includes("application/json")) {
    throw new Error(
      "Proyecta no pudo interpretar la respuesta del servidor. Intenta de nuevo en unos minutos.",
    )
  }

  return response.json()
}

export async function checkApiHealth(externalSignal: AbortSignal) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 8000)

  if (externalSignal) {
    if (externalSignal.aborted) {
      clearTimeout(timeoutId)
      return false
    }
    externalSignal.addEventListener("abort", () => controller.abort(), { once: true })
  }

  try {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      if (controller.signal.aborted) break

      try {
        const response = await fetch(`${API_BASE}/api/health`, {
          signal: controller.signal,
          cache: "no-store",
          method: "GET",
          headers: { Accept: "application/json" },
        })

        if (!response.ok) continue

        const contentType = response.headers.get("content-type") ?? ""
        if (!contentType.toLowerCase().includes("application/json")) continue

        const data = await response.json()
        if (Boolean(data.ok)) return true
      } catch {
        if (attempt === 0 && !controller.signal.aborted) {
          await new Promise<void>((resolve) => {
            const t = setTimeout(resolve, 600)
            controller.signal.addEventListener(
              "abort",
              () => {
                clearTimeout(t)
                resolve()
              },
              { once: true },
            )
          })
        }
      }
    }
  } finally {
    clearTimeout(timeoutId)
  }

  return false
}

export function normalizeApiError(error: unknown) {
  if (!error) {
    return new Error(BACKEND_UNAVAILABLE_MESSAGE)
  }

  if (error instanceof Error) {
    const message = error.message

    if (/backend temporal|HTML inesperada|no pudo interpretar la respuesta del servidor/i.test(message)) {
      return new Error(BACKEND_UNAVAILABLE_MESSAGE)
    }

    if (/Failed to fetch|NetworkError|CORS|fetch|cross-origin/i.test(message)) {
      return new Error(NETWORK_ERROR_MESSAGE)
    }

    if (message.includes("400") || message.includes("401") || message.includes("403") || message.includes("404")) {
      return error
    }

    return error
  }

  return new Error(BACKEND_UNAVAILABLE_MESSAGE)
}
