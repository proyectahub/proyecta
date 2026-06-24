import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import type { Scientist } from "../data/mockData"
import { currentUser } from "../data/mockData"
import { API_BASE, isDemoFallbackEnabled, normalizeApiError, parseApiJson } from "../lib/api"

type AuthContextValue = {
  user: Scientist | null
  loading: boolean
  isAuthenticated: boolean
  refreshUser: () => Promise<void>
  logout: () => Promise<void>
  loginWithCredentials: (email: string, password: string) => Promise<Scientist | null>
  registerWithCredentials: (
    name: string,
    email: string,
    password: string,
    consents: {
      acceptedPrivacyNotice: boolean
      acceptedPublishingTerms: boolean
    },
  ) => Promise<Scientist | null>
  // Interaction tracking for compute donation popup
  interactionCount: number
  incrementInteractionCount: () => void
  resetInteractionCount: () => void
}

const SESSION_STORAGE_KEY = "proyecta-session-token"
const DEMO_SESSION_TOKEN = "proyecta-demo-session-token"
const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function getStoredSessionToken() {
  return window.localStorage.getItem(SESSION_STORAGE_KEY)
}

function storeSessionToken(token: string) {
  window.localStorage.setItem(SESSION_STORAGE_KEY, token)
}

function storeDemoSession() {
  window.localStorage.setItem(SESSION_STORAGE_KEY, DEMO_SESSION_TOKEN)
}

function clearSessionToken() {
  window.localStorage.removeItem(SESSION_STORAGE_KEY)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Scientist | null>(null)
  const [loading, setLoading] = useState(true)
  const [interactionCount, setInteractionCount] = useState(0)
  const allowDemoFallback = isDemoFallbackEnabled()

  const fetchUser = async () => {
    const token = getStoredSessionToken()

    if (!token) {
      setUser(null)
      setLoading(false)
      return
    }

    if (token === DEMO_SESSION_TOKEN && allowDemoFallback) {
      setUser(currentUser)
      setLoading(false)
      return
    }

    if (token === DEMO_SESSION_TOKEN && !allowDemoFallback) {
      clearSessionToken()
      setUser(null)
      setLoading(false)
      return
    }

    try {
      const res = await fetch(`${API_BASE}/api/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          clearSessionToken()
          setUser(null)
          setLoading(false)
          return
        }
        throw new Error(`Unable to reach auth endpoint: ${res.status}`)
      }

      const data = await parseApiJson(res)

      if (data.user) {
        setUser(data.user)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error("Auth fetch error:", error)
      if (allowDemoFallback) {
        storeDemoSession()
        setUser(currentUser)
      } else {
        setUser(null)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchUser()
  }, [])

  const refreshUser = async () => {
    setLoading(true)
    await fetchUser()
  }

  const incrementInteractionCount = () => {
    setInteractionCount((prev) => prev + 1)
  }

  const resetInteractionCount = () => {
    setInteractionCount(0)
  }

  const logout = async () => {
    const token = getStoredSessionToken()

    try {
      await fetch(`${API_BASE}/api/logout`, {
        method: "POST",
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : undefined,
      })
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      clearSessionToken()
      setUser(null)
    }
  }

  const loginWithCredentials = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await parseApiJson(response)

      if (!response.ok) {
        throw new Error(data.error || "No fue posible iniciar sesión.")
      }

      if (data.token) {
        storeSessionToken(data.token)
      }

      if (data.user) {
        setUser(data.user)
        return data.user as Scientist
      }

      return null
    } catch (error) {
      const normalizedError = normalizeApiError(error)

      // Log del error para debugging
      if (error instanceof Error) {
        console.error("Auth error details:", {
          originalMessage: error.message,
          normalizedMessage: normalizedError.message,
          isDemoFallbackAllowed: allowDemoFallback,
        })
      }

      const isBackendUnavailable =
        /temporalmente en mantenimiento|Failed to fetch|NetworkError|HTML inesperada|no pudo interpretar/i.test(
          normalizedError.message,
        )

      if (isBackendUnavailable && allowDemoFallback) {
        console.warn("Backend unavailable, using demo fallback")
        storeDemoSession()
        setUser(currentUser)
        return currentUser
      }

      throw normalizedError
    }
  }

  const registerWithCredentials = async (
    name: string,
    email: string,
    password: string,
    consents: {
      acceptedPrivacyNotice: boolean
      acceptedPublishingTerms: boolean
    },
  ) => {
    try {
      const response = await fetch(`${API_BASE}/api/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password, ...consents }),
      })

      const data = await parseApiJson(response)

      if (!response.ok) {
        throw new Error(data.error || "No fue posible crear tu cuenta.")
      }

      if (data.token) {
        storeSessionToken(data.token)
      }

      if (data.user) {
        setUser(data.user)
        return data.user as Scientist
      }

      return null
    } catch (error) {
      const normalizedError = normalizeApiError(error)

      // Log del error para debugging
      if (error instanceof Error) {
        console.error("Auth error details:", {
          originalMessage: error.message,
          normalizedMessage: normalizedError.message,
          isDemoFallbackAllowed: allowDemoFallback,
        })
      }

      const isBackendUnavailable =
        /temporalmente en mantenimiento|Failed to fetch|NetworkError|HTML inesperada|no pudo interpretar/i.test(
          normalizedError.message,
        )

      if (isBackendUnavailable && allowDemoFallback) {
        console.warn("Backend unavailable, using demo fallback")
        storeDemoSession()
        setUser(currentUser)
        return currentUser
      }

      throw normalizedError
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        refreshUser,
        logout,
        loginWithCredentials,
        registerWithCredentials,
        interactionCount,
        incrementInteractionCount,
        resetInteractionCount,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }

  return context
}
