import { useEffect, useState } from "react"
import type { ArticleSource, FeedArticle } from "../data/mockData"

export type ApiArticle = {
  id: string
  title: string
  excerpt: string
  category: string
  createdAt: string
  readTime: string
  figureImage: string
  figureCaption: string
  sources: ArticleSource[]
  metrics: {
    votes: number
    comments: number
    peerScore: number
  }
  author: {
    id: string
    name: string
    image: string
    role: string
    affiliation: string
    orcidId: string
    reputation: number
    bio: string
    location: string
  }
  viewerState: {
    vote: number
    followingAuthor: boolean
  }
}

export type CommunityOverview = {
  stats: Array<{ value: string; label: string }>
  trendingTopics: string[]
  novas: {
    name: string
    phase: string
    storage: string
    targetNetwork: string
    summary: string
    policy: {
      publicationReward: number
      reviewReward: number
      commentReward: number
      positiveVoteBonus: number
    }
  }
  recentReviews: Array<{
    id: string
    reviewer: string
    specialty: string
    quote: string
    about: string
  }>
  recentComments: Array<{
    id: string
    author: string
    comment: string
    articleTitle: string
  }>
}

function formatRelativeLabel(value: string) {
  if (!value) return "Reciente"

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Reciente"

  const diffInHours = Math.round((Date.now() - date.getTime()) / (1000 * 60 * 60))
  if (diffInHours < 24) return `Hace ${Math.max(1, diffInHours)} horas`

  const diffInDays = Math.round(diffInHours / 24)
  return diffInDays <= 1 ? "Ayer" : `Hace ${diffInDays} días`
}

function formatPublishedLabel(value: string) {
  if (!value) return "Publicado recientemente"

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Publicado recientemente"

  const formatter = new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  return `Publicado el ${formatter.format(date)}`
}

function mapApiArticle(article: ApiArticle, index: number): FeedArticle {
  return {
    id: article.id || `article-${index + 1}`,
    title: article.title || "Publicación Proyecta",
    excerpt: article.excerpt || "Esta publicación aún no tiene extracto disponible.",
    heroKicker: "",
    category: article.category || "General",
    timeAgo: formatRelativeLabel(article.createdAt),
    publishedLabel: formatPublishedLabel(article.createdAt),
    readTime: article.readTime || "3 min de lectura",
    figureImage: article.figureImage || "",
    figureCaption: article.figureCaption || "",
    sources: Array.isArray(article.sources) ? article.sources : [],
    contentHtml: "",
    tags: [],
    metrics: {
      votes: Number(article.metrics?.votes ?? 0),
      comments: Number(article.metrics?.comments ?? 0),
      peerScore: Number(article.metrics?.peerScore ?? 0),
    },
    author: {
      id: article.author.id || `author-${index + 1}`,
      name: article.author.name || "Autor Proyecta",
      image:
        article.author.image ||
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=240&h=240&fit=crop&crop=faces",
      role: article.author.role || "Divulgador/a",
      affiliation: article.author.affiliation || "Comunidad Proyecta",
      orcidId: article.author.orcidId || "",
      reputation: Number(article.author.reputation ?? 0),
      bio: article.author.bio || "",
      location: article.author.location || "LatAm",
    },
    viewerState: {
      vote: Number(article.viewerState?.vote ?? 0),
      followingAuthor: Boolean(article.viewerState?.followingAuthor),
    },
  }
}

const defaultOverview: CommunityOverview = {
  stats: [],
  trendingTopics: [],
  novas: {
    name: "",
    phase: "",
    storage: "",
    targetNetwork: "",
    summary: "",
    policy: {
      publicationReward: 0,
      reviewReward: 0,
      commentReward: 0,
      positiveVoteBonus: 0,
    },
  },
  recentReviews: [],
  recentComments: [],
}

export function useCommunityFeedData() {
  const apiBaseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:3000"
  const [articles, setArticles] = useState<FeedArticle[]>([])
  const [isSyncing, setIsSyncing] = useState(true)
  const [communityOverview, setCommunityOverview] = useState<CommunityOverview>(defaultOverview)
  const [refreshKey, setRefreshKey] = useState(0)

  const refetch = () => setRefreshKey((k) => k + 1)

  useEffect(() => {
    const controller = new AbortController()

    async function syncArticles() {
      setIsSyncing(true)
      try {
        const token = window.localStorage.getItem("proyecta-session-token")
        const response = await fetch(`${apiBaseUrl}/api/articles`, {
          signal: controller.signal,
          headers: token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : undefined,
        })

        if (!response.ok) {
          throw new Error(`Unable to load articles: ${response.status}`)
        }

        const data = (await response.json()) as ApiArticle[]
        if (Array.isArray(data)) {
          setArticles(data.map(mapApiArticle))
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Article sync error:", error)
          setArticles([])
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsSyncing(false)
        }
      }
    }

    async function loadCommunityOverview() {
      try {
        const response = await fetch(`${apiBaseUrl}/api/community/overview`, {
          signal: controller.signal,
        })

        if (!response.ok) return

        const data = (await response.json()) as CommunityOverview
        setCommunityOverview(data)
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Community overview error:", error)
        }
      }
    }

    void Promise.all([syncArticles(), loadCommunityOverview()])

    return () => controller.abort()
  }, [apiBaseUrl, refreshKey])

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        setRefreshKey((k) => k + 1)
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
  }, [])

  return {
    apiBaseUrl,
    articles,
    communityOverview,
    isSyncing,
    refetch,
  }
}
