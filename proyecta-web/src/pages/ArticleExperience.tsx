import { useEffect, useMemo, useState } from "react"
import { Link, useParams } from "react-router-dom"
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Bookmark,
  ChevronLeft,
  ClipboardList,
  ExternalLink,
  FileDown,
  FlaskConical,
  Info,
  Lightbulb,
  type LucideIcon,
  MessageSquare,
  Share2,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Trash2,
  UserCheck,
  UserPlus,
} from "lucide-react"
import { toast } from "react-hot-toast"
import type { ArticleSource, FeedArticle } from "../data/mockData"
import { useAuth } from "../context/AuthContext"
import { ProyectaMark } from "../components/brand/ProyectaBrand"
import { useCommunityFeedData } from "../hooks/useCommunityFeedData"

type ReviewRecommendation = "Aprobar" | "Solicitar mejoras" | "Abrir discusión"

type ReviewCriterionKey = "clarity" | "rigor" | "utility" | "novelty" | "reproducibility"

type ReviewCriterionDefinition = {
  key: ReviewCriterionKey
  label: string
  description: string
  accent: "blue" | "indigo" | "amber" | "emerald" | "slate"
  icon: LucideIcon
}

type ReviewDraft = {
  rating: number
  clarity: number
  rigor: number
  utility: number
  novelty: number
  reproducibility: number
  recommendation: ReviewRecommendation
  strengths: string
  improvements: string
  openQuestions: string
  comment: string
}

type ReviewAuthor = {
  id: string
  name: string
  image: string
  role: string
}

type ReviewEntry = {
  id: string
  rating: number
  clarity: number
  rigor: number
  utility: number
  novelty: number
  reproducibility: number
  recommendation: string
  strengths: string
  improvements: string
  openQuestions: string
  comment: string
  createdAt: string
  author: ReviewAuthor | null
}

type CommentEntry = {
  id: string
  comment: string
  createdAt: string
  author: ReviewAuthor | null
  timeAgo: string
}

type ApiArticle = {
  id: string
  title: string
  excerpt: string
  category: string
  createdAt: string
  doi: string
  contentHtml: string
  figureImage: string
  figureCaption: string
  sources: ArticleSource[]
  readTime: string
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
    review: {
      rating: number
      clarity: number
      rigor: number
      utility: number
      novelty: number
      reproducibility: number
      recommendation: string
      strengths: string
      improvements: string
      openQuestions: string
      comment: string
    } | null
  }
  reviews: ReviewEntry[]
  comments: CommentEntry[]
}

const accentClasses = {
  blue: {
    bar: "bg-fuchsia-500",
    pill: "border-fuchsia-100 bg-fuchsia-50 text-fuchsia-700",
    text: "text-fuchsia-600",
    button: "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700 hover:border-fuchsia-300 hover:bg-fuchsia-100",
    selected: "border-fuchsia-500 bg-fuchsia-600 text-white shadow-sm shadow-fuchsia-200",
  },
  indigo: {
    bar: "bg-purple-500",
    pill: "border-purple-100 bg-purple-50 text-purple-700",
    text: "text-purple-600",
    button: "border-purple-200 bg-purple-50 text-purple-700 hover:border-purple-300 hover:bg-purple-100",
    selected: "border-purple-500 bg-purple-600 text-white shadow-sm shadow-purple-200",
  },
  amber: {
    bar: "bg-amber-500",
    pill: "border-amber-100 bg-amber-50 text-amber-700",
    text: "text-amber-600",
    button: "border-amber-200 bg-amber-50 text-amber-700 hover:border-amber-300 hover:bg-amber-100",
    selected: "border-amber-500 bg-amber-500 text-slate-950 shadow-sm shadow-amber-200",
  },
  emerald: {
    bar: "bg-emerald-500",
    pill: "border-emerald-100 bg-emerald-50 text-emerald-700",
    text: "text-emerald-600",
    button: "border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-300 hover:bg-emerald-100",
    selected: "border-emerald-500 bg-emerald-600 text-white shadow-sm shadow-emerald-200",
  },
  slate: {
    bar: "bg-slate-500",
    pill: "border-slate-200 bg-slate-100 text-slate-700",
    text: "text-slate-600",
    button: "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-slate-100",
    selected: "border-slate-600 bg-slate-700 text-white shadow-sm shadow-slate-200",
  },
} as const

const peerReviewCriteria: ReviewCriterionDefinition[] = [
  {
    key: "clarity",
    label: "Claridad",
    description: "Evalua si el hallazgo se entiende, se contextualiza y puede ser seguido por la comunidad.",
    accent: "blue",
    icon: Target,
  },
  {
    key: "rigor",
    label: "Rigor",
    description: "Valora si la métodologia, la evidencia y los límites del trabajo estan bien expuestos.",
    accent: "indigo",
    icon: FlaskConical,
  },
  {
    key: "utility",
    label: "Utilidad",
    description: "Mide cuánto ayuda este artículo a otros investigadores, divulgadores o lectores especializados.",
    accent: "amber",
    icon: Lightbulb,
  },
  {
    key: "novelty",
    label: "Novedad",
    description: "Permite valorar si el aporte agrega una idea, enfoque o combinacion que vale la pena destacar.",
    accent: "emerald",
    icon: Sparkles,
  },
  {
    key: "reproducibility",
    label: "Reproducibilidad",
    description: "Evalua si hay suficiente detalle para que otra persona pueda revisar, contrastar o replicar el trabajo.",
    accent: "slate",
    icon: ClipboardList,
  },
]

const reviewRecommendations: Array<{
  value: ReviewRecommendation
  label: string
  hint: string
  tone: string
}> = [
  {
    value: "Aprobar",
    label: "Aprobar",
    hint: "El artículo ya aporta con suficiente claridad y solidez.",
    tone: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  {
    value: "Solicitar mejoras",
    label: "Solicitar mejoras",
    hint: "El trabajo es valioso, pero necesita ajustes o mayor precisiï¿½n.",
    tone: "border-amber-200 bg-amber-50 text-amber-700",
  },
  {
    value: "Abrir discusión",
    label: "Abrir discusión",
    hint: "Hay dudas importantes que ameritan debate abierto antes de destacar el artículo.",
    tone: "border-rose-200 bg-rose-50 text-rose-700",
  },
]

const emptyReviewDraft: ReviewDraft = {
  rating: 0,
  clarity: 0,
  rigor: 0,
  utility: 0,
  novelty: 0,
  reproducibility: 0,
  recommendation: "Solicitar mejoras",
  strengths: "",
  improvements: "",
  openQuestions: "",
  comment: "",
}

function formatPublishedLabel(value: string) {
  if (!value) return "Publicado recientemente"

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return "Publicado recientemente"
  }

  const formatter = new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
  return `Publicado el ${formatter.format(date)}`
}

function formatLongDate(value: string) {
  if (!value) return "Fecha editorial por confirmar"

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return "Fecha editorial por confirmar"
  }

  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date)
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
}

function formatCompactDate(value: string) {
  if (!value) return "Reciente"

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return "Reciente"
  }

  const formatter = new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
  return formatter.format(date)
}

function formatScore(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1)
}

function getReviewLabel(value: number) {
  if (value >= 4.5) return "Excelente para divulgar"
  if (value >= 3.5) return "Muy buen aporte"
  if (value >= 2.5) return "Interesante, pero puede crecer"
  if (value >= 1.5) return "Necesita mayor claridad"
  if (value > 0) return "Lectura incipiente"
  return "Sin valoraciones todavía"
}

function getRatingPrompt(value: number) {
  switch (value) {
    case 1:
      return "Todavía no comunica bien el aporte."
    case 2:
      return "Tiene potencial, pero necesita más claridad."
    case 3:
      return "Aporta y se entiende, aunque puede mejorar."
    case 4:
      return "Muy buen artículo de divulgación científica."
    case 5:
      return "Excelente: clara, valiosa y lista para destacar."
    default:
      return "Marca de 1 a 5 estrellas según qué tan bien comunica y aporta este artículo."
  }
}

function getCriterionValue(source: Partial<Record<ReviewCriterionKey, number>>, key: ReviewCriterionKey, fallback = 0) {
  return Number(source[key] ?? fallback ?? 0)
}

function mapApiArticleToFeed(article: ApiArticle): FeedArticle {
  return {
    id: article.id ?? "article",
    title: article.title ?? "Publicaciï¿½n Proyecta",
    excerpt: article.excerpt ?? "Este artï¿½culo aï¿½n no tiene extracto disponible.",
    heroKicker: "",
    category: article.category ?? "General",
    timeAgo: "Reciente",
    publishedLabel: formatPublishedLabel(article.createdAt),
    readTime: article.readTime ?? "3 min de lectura",
    contentHtml: article.contentHtml ?? "",
    figureImage: article.figureImage ?? "",
    figureCaption: article.figureCaption ?? "",
    sources: Array.isArray(article.sources) ? article.sources : [],
    tags: [],
    metrics: {
      votes: article.metrics.votes ?? 0,
      comments: article.metrics.comments ?? 0,
      peerScore: article.metrics.peerScore ?? 0,
    },
    author: {
      id: article.author.id ?? "author-nova",
      name: article.author.name ?? "Autor Proyecta",
      image:
        article.author.image ??
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43ew=240&h=240&fit=crop&crop=faces",
      role: article.author.role ?? "Divulgador/a",
      affiliation: article.author.affiliation ?? "Comunidad Proyecta",
      orcidId: article.author.orcidId ?? "",
      reputation: article.author.reputation ?? 0,
      bio: article.author.bio ?? "",
      location: article.author.location ?? "LatAm",
    },
  }
}

function getRecommendationTone(recommendation: string) {
  switch (recommendation) {
    case "Aprobar":
      return "border-emerald-200 bg-emerald-50 text-emerald-700"
    case "Abrir discusion":
      return "border-rose-200 bg-rose-50 text-rose-700"
    default:
      return "border-amber-200 bg-amber-50 text-amber-700"
  }
}

function normalizeReview(review: ReviewEntry): Required<Pick<ReviewEntry, "rating">> & ReviewEntry {
  const clarity = getCriterionValue(review, "clarity", review.rating)
  const rigor = getCriterionValue(review, "rigor", review.rating)
  const utility = getCriterionValue(review, "utility", review.rating)
  const novelty = getCriterionValue(review, "novelty", review.rating)
  const reproducibility = getCriterionValue(review, "reproducibility", review.rating)
  const rating = Number(review.rating ?? ((clarity + rigor + utility + novelty + reproducibility) / 5).toFixed(1))

  return {
    ...review,
    rating,
    clarity,
    rigor,
    utility,
    novelty,
    reproducibility,
    recommendation: review.recommendation ?? "Solicitar mejoras",
  }
}

function ScoreSelector({
  criterion,
  value,
  onChange,
}: {
  criterion: ReviewCriterionDefinition
  value: number
  onChange: (value: number) => void
}) {
  const palette = accentClasses[criterion.accent]
  const Icon = criterion.icon

  return (
    <div className="rounded-[24px] border border-slate-200 bg-white/90 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="inline-flex items-center gap-2 text-sm font-bold text-slate-900">
            <span className={`rounded-full border px-2.5 py-1 text-xs ${palette.pill}`}>
              <Icon size={14} />
            </span>
            {criterion.label}
          </p>
          <p className="max-w-xl text-sm leading-6 text-slate-500">{criterion.description}</p>
        </div>
        <div className={`rounded-full border px-3 py-1 text-sm font-bold ${palette.pill}`}>{value ? `${value}/5` : "Sin evaluar"}</div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {[1, 2, 3, 4, 5].map((score) => (
          <button
            key={`${criterion.key}-${score}`}
            type="button"
            onClick={() => onChange(score)}
            className={`flex h-10 w-10 items-center justify-center rounded-2xl border text-sm font-bold transition ${
              score === value ? palette.selected : palette.button
            }`}
            aria-label={`${criterion.label} ${score} de 5`}
          >
            {score}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function ArticleExperience() {
  const { id } = useParams()
  const { user } = useAuth()
  const { articles } = useCommunityFeedData()
  const apiBaseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:3000"
  const token = window.localStorage.getItem("proyecta-session-token")
  const [hasVoted, setHasVoted] = useState<0 | 1 | -1>(0)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewDraft, setReviewDraft] = useState<ReviewDraft>(emptyReviewDraft)
  const [remoteArticle, setRemoteArticle] = useState<FeedArticle | null>(null)
  const [articleDoi, setArticleDoi] = useState("")
  const [articleReviews, setArticleReviews] = useState<ReviewEntry[]>([])
  const [articleComments, setArticleComments] = useState<CommentEntry[]>([])
  const [newComment, setNewComment] = useState("")
  const [isFollowingAuthor, setIsFollowingAuthor] = useState(false)
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)
  const [isLoadingArticle, setIsLoadingArticle] = useState(true)
  const [articleNotFound, setArticleNotFound] = useState(false)

  useEffect(() => {
    if (!id) {
      return
    }

    const controller = new AbortController()

    async function loadArticle() {
      setIsLoadingArticle(true)
      setArticleNotFound(false)

      try {
        const response = await fetch(`${apiBaseUrl}/api/articles/${id}`, {
          signal: controller.signal,
          headers: token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : undefined,
        })

        if (!response.ok) {
          if (!controller.signal.aborted) {
            setRemoteArticle(null)
            setArticleDoi("")
            setArticleReviews([])
            setArticleComments([])
            setArticleNotFound(response.status === 404)
          }
          return
        }

        const data = (await response.json()) as ApiArticle
        const viewerReview = data.viewerState.review
        setRemoteArticle(mapApiArticleToFeed(data))
        setArticleDoi(String(data.doi ?? "").trim())
        setHasVoted((data.viewerState.vote as 0 | 1 | -1 | undefined) ?? 0)
        setReviewDraft(
          viewerReview
            ? {
                rating: Number(viewerReview.rating ?? 0),
                clarity: Number(viewerReview.clarity ?? viewerReview.rating ?? 0),
                rigor: Number(viewerReview.rigor ?? viewerReview.rating ?? 0),
                utility: Number(viewerReview.utility ?? viewerReview.rating ?? 0),
                novelty: Number(viewerReview.novelty ?? viewerReview.rating ?? 0),
                reproducibility: Number(viewerReview.reproducibility ?? viewerReview.rating ?? 0),
                recommendation:
                  (viewerReview.recommendation as ReviewRecommendation | undefined) ?? "Solicitar mejoras",
                strengths: viewerReview.strengths ?? "",
                improvements: viewerReview.improvements ?? "",
                openQuestions: viewerReview.openQuestions ?? "",
                comment: viewerReview.comment ?? "",
              }
            : emptyReviewDraft,
        )
        setArticleReviews(Array.isArray(data.reviews) ? data.reviews : [])
        setArticleComments(Array.isArray(data.comments) ? data.comments : [])
        setIsFollowingAuthor(Boolean(data.viewerState.followingAuthor))
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Article load error:", error)
          setRemoteArticle(null)
          setArticleReviews([])
          setArticleComments([])
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingArticle(false)
        }
      }
    }

    void loadArticle()
    return () => controller.abort()
  }, [apiBaseUrl, id, token])

  const article = remoteArticle

  const relatedArticles = useMemo(
    () => (article ? articles.filter((item) => item.id !== article.id).slice(0, 2) : []),
    [article, articles],
  )

  const normalizedReviews = useMemo(() => articleReviews.map((review) => normalizeReview(review)), [articleReviews])

  const currentUserReview = useMemo(
    () => normalizedReviews.find((review) => review.author.id === user.id) ?? null,
    [normalizedReviews, user.id],
  )

  const peerReviewSummary = useMemo(() => {
    if (!normalizedReviews.length) {
      return {
        count: 0,
        overall: article.metrics.peerScore ?? 0,
        clarity: 0,
        rigor: 0,
        utility: 0,
        novelty: 0,
        reproducibility: 0,
        dominantRecommendation: "Sin consenso todav?a",
      }
    }

    const totals = normalizedReviews.reduce(
      (accumulator, review) => ({
        overall: accumulator.overall + Number(review.rating ?? 0),
        clarity: accumulator.clarity + getCriterionValue(review, "clarity", review.rating),
        rigor: accumulator.rigor + getCriterionValue(review, "rigor", review.rating),
        utility: accumulator.utility + getCriterionValue(review, "utility", review.rating),
        novelty: accumulator.novelty + getCriterionValue(review, "novelty", review.rating),
        reproducibility: accumulator.reproducibility + getCriterionValue(review, "reproducibility", review.rating),
        recommendations: {
          ...accumulator.recommendations,
          [review.recommendation ?? "Solicitar mejoras"]:
            (accumulator.recommendations[review.recommendation ?? "Solicitar mejoras"] ?? 0) + 1,
        },
      }),
      {
        overall: 0,
        clarity: 0,
        rigor: 0,
        utility: 0,
        novelty: 0,
        reproducibility: 0,
        recommendations: {} as Record<string, number>,
      },
    )

    const dominantRecommendation =
      Object.entries(totals.recommendations).sort((left, right) => right[1] - left[1])[0]?.[0] ?? "Solicitar mejoras"

    return {
      count: normalizedReviews.length,
      overall: Number((totals.overall / normalizedReviews.length).toFixed(1)),
      clarity: Number((totals.clarity / normalizedReviews.length).toFixed(1)),
      rigor: Number((totals.rigor / normalizedReviews.length).toFixed(1)),
      utility: Number((totals.utility / normalizedReviews.length).toFixed(1)),
      novelty: Number((totals.novelty / normalizedReviews.length).toFixed(1)),
      reproducibility: Number((totals.reproducibility / normalizedReviews.length).toFixed(1)),
      dominantRecommendation,
    }
  }, [article.metrics.peerScore, normalizedReviews])

  const renderedComments = useMemo<CommentEntry[]>(() => articleComments, [articleComments])

  const reviewInsightCards = useMemo(
    () => [
      {
        title: "Claridad y contexto",
        copy: "Valora si el título, la explicacin y la figura ayudan a entender rapido de que trata el aporte y por que importa.",
        icon: Target,
      },
      {
        title: "Rigor y sustento",
        copy: "Aunque sea un artículo de divulgación, conviene revisar si comunica evidencia, límites y fuentes con suficiente seriedad.",
        icon: FlaskConical,
      },
      {
        title: "Utilidad para la comunidad",
        copy: "Pregunta si este artículo ayuda a aprender, debatir o seguir explorando el tema desde la comunidad científica y lectora.",
        icon: Sparkles,
      },
      {
        title: "Respeto en la revisión",
        copy: "Comenta ideas, enfoque y comunicacion. Evita descalificaciones personales y busca que tu observacion sea precisa y constructiva.",
        icon: ShieldCheck,
      },
    ],
    [],
  )

  if (isLoadingArticle) {
    return (
      <div className="nova-shell p-8 md:p-10">
        <p className="nova-eyebrow">Cargando artículo</p>
        <h1 className="nova-title mt-3 text-3xl font-extrabold text-slate-900">
          Estamos preparando esta lectura.
        </h1>
      </div>
    )
  }

  if (!article) {
    return (
      <div className="nova-shell p-8 md:p-10">
        <p className="nova-eyebrow">{articleNotFound ? "Artículo no disponible" : "Sin conexión"}</p>
        <h1 className="nova-title mt-3 text-3xl font-extrabold text-slate-900">
          {articleNotFound
            ? "Este artículo no está disponible en Proyecta."
            : "No pudimos cargar esta publicación en este momento."}
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
          {articleNotFound
            ? "Es posible que haya sido retirada, movida o que el enlace ya no exista."
            : "Intenta recargar la pï¿½gina o vuelve al feed mientras restablecemos la conexiï¿½n con el servidor."}
        </p>
        <Link to="/" className="nova-button-soft mt-6 inline-flex">
          <ChevronLeft size={16} />
          Volver al inicio
        </Link>
      </div>
    )
  }

  const articleCanonicalUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/article/${article.id}`
      : `https://proyecta.pages.dev/article/${article.id}`
  const brandMarkUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/brand/nova-mark.svg`
      : `https://proyecta.pages.dev/brand/nova-mark.svg`

  // Fase 1: DOI interno (no es un DOI registrado). Sirve para trazabilidad y para el PDF.
  const provisionalDoi = `NOVA.${article.id}`
  const doiValue = articleDoi.trim() ? articleDoi.trim() : provisionalDoi
  const doiKindLabel = articleDoi.trim() ? "DOI" : "DOI provisional interno"
  const citationLabel = `${article.author.name} (${formatLongDate(article.createdAt ?? "")}). ${article.title}. Proyecta. ${articleCanonicalUrl}`

  const handleCopyCitation = async () => {
    try {
      if (typeof navigator === "undefined" || !navigator.clipboard) {
        toast.error("Tu navegador no permite copiar automáticamente. Copia la cita manualmente.")
        return
      }
      await navigator.clipboard.writeText(citationLabel)
      toast.success("Cita copiada al portapapeles.")
    } catch {
      toast.error("No fue posible copiar la cita en este momento.")
    }
  }

  const handleDownloadPdf = () => {
    if (typeof window === "undefined") {
      return
    }

    const printWindow = window.open("", "_blank", "width=1100,height=900")
    if (!printWindow) {
      toast.error("Activa las ventanas emergentes para descargar el PDF.")
      return
    }

    const figureMarkup = article.figureImage ? `
        <figure style="margin: 24px 0 28px; overflow: hidden; border: 1px solid #dbe4f3; border-radius: 24px; background: #f8fbff;">
          <img src="${escapeHtml(article.figureImage)}" alt="${escapeHtml(article.figureCaption || article.title)}" style="display:block; width:100%; max-height:420px; object-fit:cover;" />
          ${
            article.figureCaption
              ? `<figcaption style="padding: 16px 20px; font-size: 12px; line-height: 1.7; color: #52627a; border-top: 1px solid #dbe4f3;">${escapeHtml(article.figureCaption)}</figcaption>`
              : ""
          }
        </figure>
      `
      : ""

    const sourcesMarkup = article.sources.length ? `
        <section style="margin-top: 28px;">
          <h2 style="margin: 0 0 14px; font-size: 20px; font-weight: 800; color: #0f172a;">Referencias consultables</h2>
          <ol style="margin: 0; padding-left: 22px; color: #334155; line-height: 1.8;">
            ${article.sources
              .map(
                (source) => `
                <li style="margin-bottom: 10px;">
                  <span style="font-weight: 700; color: #0f172a;">${escapeHtml(source.title)}</span>
                  ${source.publisher ? `<span style="color:#52627a;">. ${escapeHtml(source.publisher)}</span>` : ""}
                  <span style="display:block; color:#2563eb; word-break:break-word;">${escapeHtml(source.url)}</span>
                </li>
              `,
              )
              .join("")}
          </ol>
        </section>
      `
      : ""

    const printDocument = `
      <!doctype html>
      <html lang="es">
        <head>
          <meta charset="utf-8" />
          <title>${escapeHtml(article.title)} | Proyecta</title>
          <style>
            :root {
              color-scheme: light;
            }
            * {
              box-sizing: border-box;
            }
            body {
              margin: 0;
              font-family: "Segoe UI", "Helvtica Neue", Arial, sans-serif;
              color: #0f172a;
              background: #eef4ff;
            }
            main {
              max-width: 980px;
              margin: 0 auto;
              padding: 40px 28px 56px;
            }
            .sheet {
              background: #ffffff;
              border: 1px solid #dbe4f3;
              border-radius: 32px;
              overflow: hidden;
              box-shadow: 0 24px 80px -40px rgba(15, 23, 42, 0.35);
            }
            .hero {
              padding: 28px 32px 26px;
              background: linear-gradient(135deg, #f6f9ff 0%, #ffffff 52%, #eef5ff 100%);
              border-bottom: 1px solid #dbe4f3;
            }
            .brand {
              display: flex;
              align-items: center;
              gap: 16px;
            }
            .mark {
              width: 58px;
              height: 58px;
              border-radius: 22px;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .mark svg, .mark img {
              width: 38px;
              height: 38px;
            }
            .eyebrow {
              margin: 0 0 6px;
              font-size: 11px;
              font-weight: 800;
              letter-spacing: 0.24em;
              text-transform: uppercase;
              color: #94a3b8;
            }
            .brand-title {
              margin: 0;
              font-size: 30px;
              font-weight: 900;
              letter-spacing: -0.03em;
            }
            .brand-title span {
              color: #255cff;
            }
            .tagline {
              margin: 4px 0 0;
              color: #64748b;
              font-size: 12px;
              letter-spacing: 0.04em;
            }
            .meta {
              display: flex;
              flex-wrap: wrap;
              gap: 10px;
              margin: 22px 0 18px;
              color: #64748b;
              font-size: 12px;
              font-weight: 700;
              letter-spacing: 0.14em;
              text-transform: uppercase;
            }
            .pill {
              display: inline-flex;
              align-items: center;
              border: 1px solid #bfdbfe;
              background: #eff6ff;
              color: #1d4ed8;
              border-radius: 999px;
              padding: 8px 14px;
              font-size: 12px;
              font-weight: 800;
              letter-spacing: 0.18em;
              text-transform: uppercase;
            }
            .title {
              margin: 0;
              font-size: 42px;
              line-height: 1.02;
              letter-spacing: -0.045em;
              font-weight: 900;
            }
            .excerpt {
              margin: 18px 0 0;
              max-width: 760px;
              color: #475569;
              font-size: 18px;
              line-height: 1.8;
            }
            .body {
              padding: 28px 32px 34px;
            }
            .author-box, .citation-box {
              border: 1px solid #dbe4f3;
              background: #f8fbff;
              border-radius: 24px;
              padding: 18px 20px;
            }
            .author-line {
              margin: 0;
              font-size: 16px;
              font-weight: 800;
            }
            .subtle {
              margin: 6px 0 0;
              color: #64748b;
              font-size: 13px;
              line-height: 1.7;
            }
            .citation-box {
              margin-top: 18px;
            }
            .section-label {
              margin: 0 0 10px;
              color: #2563eb;
              font-size: 11px;
              font-weight: 800;
              letter-spacing: 0.22em;
              text-transform: uppercase;
            }
            .citation {
              margin: 0;
              color: #0f172a;
              font-size: 14px;
              line-height: 1.8;
            }
            .doi-line {
              margin: 10px 0 0;
              color: #475569;
              font-size: 13px;
              line-height: 1.7;
            }
            .prose {
              margin-top: 28px;
              color: #1e293b;
              line-height: 1.9;
              font-size: 16px;
            }
            .prose h2, .prose h3 {
              margin-top: 28px;
              margin-bottom: 10px;
              font-weight: 800;
              color: #0f172a;
              letter-spacing: -0.03em;
            }
            .prose p, .prose li, .prose blockquote {
              color: #334155;
            }
            .footer {
              margin-top: 30px;
              border-top: 1px solid #dbe4f3;
              padding-top: 18px;
              display: flex;
              justify-content: space-between;
              gap: 20px;
              color: #64748b;
              font-size: 12px;
              line-height: 1.8;
            }
            @media print {
              body {
                background: #ffffff;
              }
              main {
                max-width: none;
                padding: 0;
              }
              .sheet {
                border: none;
                box-shadow: none;
                border-radius: 0;
              }
            }
          </style>
        </head>
        <body>
          <main>
            <article class="sheet">
              <header class="hero">
                <div class="brand">
                  <div class="mark" aria-hidden="true">
                    <img src="${escapeHtml(brandMarkUrl)}" alt="" />
                  </div>
                  <div>
                    <p class="eyebrow">Proyecta</p>
                    <p class="brand-title">DIVUL<span>GARï¿½A</span></p>
                    <p class="tagline">Divulgaciï¿½n cientï¿½fica con identidad visible, lectura abierta y formato editorial Proyecta</p>
                  </div>
                </div>

                <div class="meta">
                  <span class="pill">${escapeHtml(article.category)}</span>
                  <span>${escapeHtml(formatLongDate(article.createdAt ?? ""))}</span>
                  <span>${escapeHtml(article.readTime)}</span>
                </div>

                <h1 class="title">${escapeHtml(article.title)}</h1>
                <p class="excerpt">${escapeHtml(article.excerpt)}</p>
              </header>

              <section class="body">
                <div class="author-box">
                  <p class="author-line">${escapeHtml(article.author.name)}</p>
                  <p class="subtle">${escapeHtml(article.author.role)} · ${escapeHtml(article.author.affiliation)}</p>
                </div>

                <div class="citation-box">
                  <p class="section-label">Cita sugerida</p>
                  <p class="citation">${escapeHtml(citationLabel)}</p>
                  <p class="doi-line"><strong>${escapeHtml(doiKindLabel)}:</strong> ${escapeHtml(doiValue)}</p>
                </div>

                ${figureMarkup}

                <section class="prose">${article.contentHtml}</section>

                ${sourcesMarkup}

                <footer class="footer">
                  <div>
                    <strong>Proyecta</strong><br />
                    Formato editorial para divulgación científica y circulaciï¿½n acadmica.
                  </div>
                  <div>
                    URL publica:<br />
                    ${escapeHtml(articleCanonicalUrl)}
                  </div>
                </footer>
              </section>
            </article>
          </main>
        </body>
      </html>
    `

    printWindow.document.open()
    printWindow.document.write(printDocument)
    printWindow.document.close()
    printWindow.focus()
    printWindow.onload = () => {
      printWindow.print()
    }
  }

  const handleVote = async (nextVote: 1 | -1) => {
    if (!id || !token) {
      toast.error("Inicia sesión para votar publicaciones.")
      return
    }

    const newVote = hasVoted === nextVote ? 0 : nextVote

    try {
      const response = await fetch(`${apiBaseUrl}/api/articles/${id}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ value: newVote }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error ?? "No fue posible registrar tu voto.")
      }

      setHasVoted(newVote)
      setRemoteArticle((prev) =>
        prev
          ? {
              ...prev,
              metrics: {
                ...prev.metrics,
                votes: data.metrics.votes ?? prev.metrics.votes,
                comments: data.metrics.comments ?? prev.metrics.comments,
                peerScore: data.metrics.peerScore ?? prev.metrics.peerScore,
              },
            }
          : prev,
      )
      toast.success(
        newVote === 1
          ? "Guardamos tu voto positivo."
          : newVote === -1
            ? "Guardamos tu señal cr?tica."
            : "Se retir? tu voto.",
      )
    } catch (error) {
      const message = error instanceof Error ? error.message : "No fue posible registrar tu voto."
      toast.error(message)
    }
  }

  const handleReviewScoreChange = (key: ReviewCriterionKey, value: number) => {
    setReviewDraft((current) => ({
      ...current,
      [key]: value,
    }))
  }

  const handleReviewRatingChange = (value: number) => {
    setReviewDraft((current) => ({
      ...current,
      rating: value,
      clarity: value,
      rigor: value,
      utility: value,
      novelty: value,
      reproducibility: value,
    }))
  }

  const handleReviewSubmit = async () => {
    if (!id || !token) {
      toast.error("Inicia sesión para dejar una revisión.")
      return
    }

    if (!reviewDraft.rating) {
      toast.error("Marca de 1 a 5 estrellas antes de publicar tu valoracion.")
      return
    }

    setIsSubmittingReview(true)

    try {
      const response = await fetch(`${apiBaseUrl}/api/articles/${id}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rating: reviewDraft.rating,
          comment: reviewDraft.comment,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error ?? "No fue posible guardar la revisión.")
      }

      setArticleReviews(Array.isArray(data.reviews) ? data.reviews : [])
      setRemoteArticle((prev) =>
        prev
          ? {
              ...prev,
              metrics: {
                ...prev.metrics,
                votes: data.metrics.votes ?? prev.metrics.votes,
                comments: data.metrics.comments ?? prev.metrics.comments,
                peerScore: data.metrics.peerScore ?? prev.metrics.peerScore,
              },
            }
          : prev,
      )
      setShowReviewForm(false)
      toast.success(currentUserReview ? "Revisión actualizada." : "Revisión guardada.")
    } catch (error) {
      const message = error instanceof Error ? error.message : "No fue posible guardar la revisión."
      toast.error(message)
    } finally {
      setIsSubmittingReview(false)
    }
  }

  const handleDeleteReview = async () => {
    if (!id || !token) {
      toast.error("Inicia sesión para gestionar tu revisión.")
      return
    }

    try {
      const response = await fetch(`${apiBaseUrl}/api/articles/${id}/reviews/mine`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error ?? "No fue posible eliminar tu revisión.")
      }

      setArticleReviews((current) => current.filter((review) => review.author.id !== user.id))
      setRemoteArticle((prev) =>
        prev
          ? {
              ...prev,
              metrics: {
                ...prev.metrics,
                votes: data.metrics.votes ?? prev.metrics.votes,
                comments: data.metrics.comments ?? prev.metrics.comments,
                peerScore: data.metrics.peerScore ?? prev.metrics.peerScore,
              },
            }
          : prev,
      )
      setReviewDraft(emptyReviewDraft)
      setShowReviewForm(false)
      toast.success("Tu revisión fue eliminada.")
    } catch (error) {
      const message = error instanceof Error ? error.message : "No fue posible eliminar tu revisión."
      toast.error(message)
    }
  }

  const handleToggleFollow = async () => {
    if (!token || !article.author.id) {
      toast.error("Necesitas iniciar sesión para seguir perfiles.")
      return
    }

    if (user.id && article.author.id === user.id) {
      toast.error("Este es tu propio perfil.")
      return
    }

    try {
      const response = await fetch(`${apiBaseUrl}/api/users/${article.author.id}/follow`, {
        method: isFollowingAuthor ? "DELETE" : "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error ?? "No fue posible actualizar el seguimiento.")
      }

      setIsFollowingAuthor(Boolean(data.following))
      toast.success(data.following ? "Ahora sigues a este investigador." : "Has dejado de seguir este perfil.")
    } catch (error) {
      const message = error instanceof Error ? error.message : "No fue posible actualizar el seguimiento."
      toast.error(message)
    }
  }

  const handleCommentSubmit = async () => {
    if (!id || !token) {
      toast.error("Inicia sesión para comentar.")
      return
    }

    if (!newComment.trim()) {
      toast.error("Escribe un comentario antes de enviarlo.")
      return
    }

    try {
      const response = await fetch(`${apiBaseUrl}/api/articles/${id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          comment: newComment.trim(),
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error ?? "No fue posible guardar el comentario.")
      }

      setArticleComments(Array.isArray(data.comments) ? data.comments : [])
      setRemoteArticle((prev) =>
        prev
          ? {
              ...prev,
              metrics: {
                ...prev.metrics,
                votes: data.metrics.votes ?? prev.metrics.votes,
                comments: data.metrics.comments ?? prev.metrics.comments,
                peerScore: data.metrics.peerScore ?? prev.metrics.peerScore,
              },
            }
          : prev,
      )
      setNewComment("")
      toast.success("Comentario publicado.")
    } catch (error) {
      const message = error instanceof Error ? error.message : "No fue posible guardar el comentario."
      toast.error(message)
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[72px_minmax(0,1fr)_360px]">
      <aside className="hidden xl:flex xl:flex-col xl:items-center xl:gap-5 xl:pt-16">
        <div className="nova-card sticky top-28 flex w-[72px] flex-col items-center gap-4 px-3 py-4">
          <button
            onClick={() => void handleVote(1)}
            className={`rounded-full p-2 transition ${
              hasVoted === 1 ? "bg-fuchsia-100 text-fuchsia-600" : "text-slate-400 hover:bg-slate-100"
            }`}
          >
            <ArrowUp size={22} />
          </button>
          <span className="nova-title text-2xl font-extrabold text-slate-900">{article.metrics.votes}</span>
          <button
            onClick={() => void handleVote(-1)}
            className={`rounded-full p-2 transition ${
              hasVoted === -1 ? "bg-red-100 text-red-600" : "text-slate-400 hover:bg-slate-100"
            }`}
          >
            <ArrowDown size={22} />
          </button>
        </div>

        <button
          type="button"
          onClick={handleDownloadPdf}
          className="nova-card rounded-full p-4 text-slate-400 transition hover:text-fuchsia-600"
          aria-label="Descargar artculo en PDF"
        >
          <FileDown size={20} />
        </button>
        <button className="nova-card rounded-full p-4 text-slate-400 transition hover:text-fuchsia-600">
          <Bookmark size={20} />
        </button>
        <button className="nova-card rounded-full p-4 text-slate-400 transition hover:text-fuchsia-600">
          <Share2 size={20} />
        </button>
      </aside>

      <section className="space-y-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 transition-colors hover:text-fuchsia-600"
        >
          <ChevronLeft size={18} />
          Volver al feed
        </Link>

        <article className="nova-shell p-7 md:p-10">
          <div className="space-y-8">
            <header className="space-y-6">
              <div className="inline-flex items-center gap-3 rounded-full border border-fuchsia-100 bg-fuchsia-50/70 px-3 py-2">
                <ProyectaMark size={28} glow={false} />
                <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-fuchsia-700">
                  Publicación Proyecta
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                <span className="nova-pill">{article.category}</span>
                <span>{article.publishedLabel}</span>
                <span>-</span>
                <span>{article.readTime}</span>
              </div>

              <div className="max-w-4xl space-y-4">
                <h1 className="nova-title text-4xl font-extrabold tracking-tight text-slate-900 md:text-6xl md:leading-[1.02]">
                  {article.title}
                </h1>
                <p className="max-w-3xl text-xl leading-9 text-slate-600 md:text-[1.12rem]">{article.excerpt}</p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={handleDownloadPdf} className="nova-button-soft">
                  <FileDown size={16} />
                  Descargar PDF
                </button>
                <button type="button" onClick={() => void handleCopyCitation()} className="nova-button-soft">
                  <ClipboardList size={16} />
                  Copiar cita
                </button>
              </div>

              <div className="nova-card-soft flex flex-col gap-2 p-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">{doiKindLabel}</p>
                  <p className="mt-2 font-mono text-sm text-slate-700">{doiValue}</p>
                </div>
                <div className="text-sm text-slate-500">
                  <span className="font-semibold text-slate-600">URL p\u00fablica:</span>{" "}
                  <span className="break-all">{articleCanonicalUrl}</span>
                </div>
              </div>

              {article.figureImage ? (
                <figure className="overflow-hidden rounded-[32px] border border-slate-200 bg-slate-50/70 shadow-[0_18px_45px_-32px_rgba(15,23,42,0.35)]">
                  <img
                    src={article.figureImage}
                    alt={article.figureCaption || article.title}
                    className="h-full max-h-[560px] w-full object-cover"
                  />
                  {article.figureCaption ? (
                    <figcaption className="border-t border-slate-200 bg-white px-6 py-4 text-sm leading-7 text-slate-500">
                      {article.figureCaption}
                    </figcaption>
                  ) : null}
                </figure>
              ) : null}

              <div className="nova-card-soft flex flex-col gap-5 p-5 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                  <Link to={`/profile/${article.author.id}`}>
                    <img
                      src={article.author.image}
                      alt={article.author.name}
                      className="h-16 w-16 rounded-[24px] object-cover shadow-md"
                    />
                  </Link>
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        to={`/profile/${article.author.id}`}
                        className="font-bold text-slate-900 transition-colors hover:text-fuchsia-600"
                      >
                        {article.author.name}
                      </Link>
                      <span className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-700">
                        {article.author.orcidId ? `ORCID ${article.author.orcidId}` : "Perfil Proyecta"}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500">
                      {article.author.role} Â· {article.author.affiliation}
                    </p>
                  </div>
                </div>

                {user.id !== article.author.id ? (
                  <button onClick={() => void handleToggleFollow()} className="nova-button-soft md:min-w-[150px]">
                    {isFollowingAuthor ? <UserCheck size={16} /> : <UserPlus size={16} />}
                    {isFollowingAuthor ? "Siguiendo" : "Seguir"}
                  </button>
                ) : null}
              </div>
            </header>

            <div className="nova-prose" dangerouslySetInnerHTML={{ __html: article.contentHtml }} />

            {article.sources.length ? (
              <section className="rounded-[32px] border border-fuchsia-100 bg-fuchsia-50/45 p-6 md:p-7">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="nova-eyebrow text-fuchsia-600">Fuentes consultables</p>
                    <h2 className="mt-2 text-2xl font-extrabold text-slate-900">Referencias para seguir leyendo</h2>
                  </div>
                </div>

                <div className="mt-5 grid gap-3">
                  {article.sources.map((source) => (
                    <a
                      key={`${article.id}-${source.url}`}
                      href={source.url}
                      target="_blank"
                      rel="noreferrer"
                      className="group flex items-start justify-between gap-4 rounded-[24px] border border-fuchsia-100 bg-white/90 px-5 py-4 transition hover:-translate-y-0.5 hover:border-fuchsia-200"
                    >
                      <div>
                        <p className="font-bold text-slate-900">{source.title}</p>
                        <p className="mt-1 text-sm text-slate-500">{source.publisher}</p>
                      </div>
                      <ExternalLink size={18} className="mt-1 text-fuchsia-500 transition group-hover:text-fuchsia-700" />
                    </a>
                  ))}
                </div>
              </section>
            ) : null}

            <section className="space-y-5 border-t border-slate-100 pt-8">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="nova-eyebrow">Valoraciï¿½n comunitaria</p>
                  <h2 className="nova-title mt-2 text-3xl font-extrabold text-slate-900">
                    Una lectura simple, clara y pública de cada artículo
                  </h2>
                </div>
                {!token ? (
                  <Link to="/login" className="nova-button-dark">
                    <ShieldCheck size={16} />
                    Inicia sesión para valorar
                  </Link>
                ) : (
                  <button onClick={() => setShowReviewForm((value) => !value)} className="nova-button-dark">
                    <ShieldCheck size={16} />
                    {currentUserReview ? "Editar mi valoraci?n" : "Valorar artículo"}
                  </button>
                )}
              </div>

              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
                <div className="rounded-[32px] border border-slate-200 bg-slate-50/80 p-5 md:p-6">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Promedio de la comunidad</p>
                      <div className="mt-3 flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-1 text-amber-500">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={`summary-star-${star}`}
                              size={22}
                              fill={star <= Math.round(peerReviewSummary.overall) ? "currentColor" : "none"}
                            />
                          ))}
                        </div>
                        <div className="flex items-end gap-2">
                          <span className="nova-title text-5xl font-extrabold text-slate-900">
                            {peerReviewSummary.count ? formatScore(peerReviewSummary.overall) : "?"}
                          </span>
                          <span className="pb-2 text-sm font-semibold text-slate-500">/5</span>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-[24px] border border-slate-200 bg-white px-4 py-3 text-right">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Lecturas pï¿½blicas</p>
                      <p className="mt-2 text-2xl font-extrabold text-slate-900">{peerReviewSummary.count}</p>
                    </div>
                  </div>

                  <div className="mt-5 rounded-[24px] border border-white/80 bg-white p-5">
                    <p className="text-sm font-bold text-slate-900">{getReviewLabel(peerReviewSummary.overall)}</p>
                    <p className="mt-2 text-sm leading-7 text-slate-600">
                      {peerReviewSummary.count ? `La comunidad lo est? leyendo como un artículo de ${formatScore(peerReviewSummary.overall)}/5. Aqu? importa qu? tan bien comunica, qu? tan útil resulta y si invita a seguir la conversación.` : "Todav?a no hay valoraciones. La primera lectura de la comunidad ayudar? a decir si este artículo se entiende, aporta y merece circular m?s."}
                    </p>
                  </div>
                </div>

                <div className="rounded-[32px] border border-fuchsia-100 bg-gradient-to-br from-fuchsia-50 via-white to-rose-50 p-5">
                  <p className="nova-eyebrow text-fuchsia-600">Criterios de revisión abierta</p>
                  <div className="mt-4 space-y-4">
                    <div className="rounded-[24px] border border-white/80 bg-white/80 p-4">
                      <p className="font-bold text-slate-900">1. Claridad y contexto</p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        Revisa si el artículo se entiende, explica por qué importa y da suficiente contexto para lectores científicos y no científicos.
                      </p>
                    </div>
                    <div className="rounded-[24px] border border-white/80 bg-white/80 p-4">
                      <p className="font-bold text-slate-900">2. Sustento y honestidad</p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        Observa si el texto distingue hallazgos, interpretaciones y límites. No buscamos arbitraje técnico completo, sino lectura crítica responsable.
                      </p>
                    </div>
                    <div className="rounded-[24px] border border-white/80 bg-white/80 p-4">
                      <p className="font-bold text-slate-900">3. Utilidad para la comunidad</p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        Valora si el artículo aporta algo útil: una idea clara, una sï¿½ntesis valiosa, una pregunta pertinente o una conexiï¿½n bien explicada.
                      </p>
                    </div>
                    <div className="rounded-[24px] border border-white/80 bg-white/80 p-4">
                      <p className="font-bold text-slate-900">4. Comentario breve y respetuoso</p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        Si dejas comentario, procura decir qué comunica bien, qué podría mejorar o qué aspecto te gustaría ver ampliado. La revisión en Proyecta busca orientar, no descalificar.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {normalizedReviews.length > 0 ? (
                <div className="space-y-4">
                  {normalizedReviews.map((review) => (
                    <article key={review.id} className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-[0_18px_45px_-32px_rgba(15,23,42,0.35)]">
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div className="flex items-start gap-4">
                          <img
                            src={review.author.image ? review.author.image : "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=160&h=160&fit=crop&crop=faces"}
                            alt={review.author.name ? review.author.name : "Revisor"}
                            className="h-12 w-12 rounded-[20px] object-cover"
                          />
                          <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-bold text-slate-900">{review.author.name ? review.author.name : "Miembro de la comunidad"}</p>
                              <span className="text-xs uppercase tracking-[0.18em] text-slate-400">
                                {review.author.role ? review.author.role : "Comunidad Proyecta"}
                              </span>
                              <span className="text-xs text-slate-400">{formatCompactDate(review.createdAt)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-3">
                          <div className="flex items-center gap-1 text-amber-500">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={`${review.id}-star-${star}`}
                                size={16}
                                fill={star <= Math.round(review.rating) ? "currentColor" : "none"}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 rounded-[24px] border border-slate-200 bg-slate-50/80 p-5">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Comentario de lectura</p>
                        <p className="mt-3 text-sm leading-7 text-slate-600">
                          {review.comment || "Revisión enviada sin comentario adicional."}
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="rounded-[32px] border border-dashed border-slate-300 bg-slate-50/70 p-6">
                  <p className="font-bold text-slate-900">Aï¿½n no hay valoraciones publicadas.</p>
                  <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
                    Esta es una buena oportunidad para que la comunidad deje la primera lectura pï¿½blica y diga si este artículo comunica bien y aporta a la divulgación.
                  </p>
                </div>
              )}
            </section>

            <section className="space-y-5 border-t border-slate-100 pt-8">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="nova-eyebrow">Conversación científica</p>
                  <h2 className="nova-title mt-2 text-3xl font-extrabold text-slate-900">Comentarios, preguntas y aportes abiertos</h2>
                </div>
                <div className="rounded-full bg-fuchsia-50 px-4 py-2 text-sm font-semibold text-fuchsia-700">
                  {renderedComments.length} intervenciones visibles
                </div>
              </div>

              <div className="space-y-4">
                {renderedComments.length ? (
                  renderedComments.map((comment) => (
                    <article key={comment.id} className="nova-card-soft p-5">
                      <div className="flex items-start gap-4">
                        <img
                          src={comment.author.image ? comment.author.image : "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=160&h=160&fit=crop&crop=faces"}
                          alt={comment.author.name ? comment.author.name : "Comentario"}
                          className="h-11 w-11 rounded-2xl object-cover"
                        />
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-bold text-slate-900">{comment.author.name ? comment.author.name : "Miembro de la comunidad"}</p>
                            <span className="text-xs uppercase tracking-[0.18em] text-slate-400">
                              {comment.author.role ? comment.author.role : "Comunidad Proyecta"}
                            </span>
                            <span className="text-xs text-slate-400">
                              {comment.timeAgo ? comment.timeAgo : formatCompactDate(comment.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm leading-7 text-slate-600">{comment.comment}</p>
                        </div>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="rounded-[32px] border border-dashed border-slate-300 bg-slate-50/70 p-6">
                    <p className="font-bold text-slate-900">Aï¿½n no hay comentarios publicados.</p>
                    <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
                      La conversación aparecerá aquí cuando la comunidad deje preguntas, lecturas o aportes reales sobre este artículo.
                    </p>
                  </div>
                )}
              </div>

              <div className="nova-card-soft p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-slate-900">Sï¿½mate a la conversación</p>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      Los comentarios sirven para preguntas, lecturas complementarias y debate abierto. La revisión comunitaria queda arriba, en su propio espacio.
                    </p>
                  </div>
                  {!token ? (
                    <Link to="/login" className="nova-button-soft">
                      <MessageSquare size={16} />
                      Inicia sesión
                    </Link>
                  ) : null}
                </div>

                <textarea
                  value={newComment}
                  onChange={(event) => setNewComment(event.target.value)}
                  placeholder="Comparte una observación, pregunta o lectura crítica del artículo..."
                  className="nova-field mt-4 min-h-[120px]"
                  disabled={!token}
                />
                <button onClick={() => void handleCommentSubmit()} className="nova-button-solid mt-4" disabled={!token}>
                  Publicar comentario
                </button>
              </div>
            </section>
          </div>
        </article>

        <section className="space-y-4">
          <div>
            <p className="nova-eyebrow">Sigue explorando</p>
            <h2 className="nova-title mt-2 text-3xl font-extrabold text-slate-900">Lecturas relacionadas</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {relatedArticles.map((related) => (
              <Link key={related.id} to={`/article/${related.id}`} className="nova-card p-5 transition hover:-translate-y-1">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-fuchsia-600">{related.category}</p>
                <h3 className="nova-title mt-3 text-2xl font-extrabold text-slate-900">{related.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{related.excerpt}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-fuchsia-600">
                  Abrir lectura
                  <ArrowRight size={16} />
                </span>
              </Link>
            ))}
          </div>
        </section>
      </section>

      <aside className="space-y-6 xl:sticky xl:top-28 xl:self-start">
        <section className="nova-card overflow-hidden p-7">
          <div className="space-y-6">
            <div className="space-y-2">
              <p className="nova-eyebrow">Valoracion rapida</p>
              <h3 className="nova-title text-3xl font-extrabold text-slate-900">Estrellas y comentario breve</h3>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-slate-50/80 p-5">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Promedio actual</p>
                  <div className="mt-2 flex items-end gap-2">
                    <span className="nova-title text-5xl font-extrabold text-slate-900">
                      {peerReviewSummary.count ? formatScore(peerReviewSummary.overall) : "?"}
                    </span>
                    <span className="pb-2 text-sm text-slate-400">/5</span>
                  </div>
                  <div className="mt-3 flex items-center gap-1 text-amber-500">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={`sidebar-overall-star-${star}`}
                        size={16}
                        fill={star <= Math.round(peerReviewSummary.overall) ? "currentColor" : "none"}
                      />
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Valoraciones</p>
                  <p className="mt-2 text-2xl font-extrabold text-slate-900">{peerReviewSummary.count}</p>
                </div>
              </div>

              <div className="mt-5 rounded-[24px] border border-white/80 bg-white/80 p-4">
                <p className="text-sm font-bold text-slate-900">{getReviewLabel(peerReviewSummary.overall)}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {peerReviewSummary.count
                    ? "Esta señal sirve para saber si la publicación conecta con la comunidad y si vale la pena seguirla moviendo dentro de Divulgar??a."
                    : "Todav??a no hay valoraciones. La primera opini??n ayudar?? a darle contexto p??blico a esta lectura."}
                </p>
              </div>
            </div>

            {!token ? (
              <Link to="/login" className="nova-button-dark w-full justify-center">
                <ShieldCheck size={16} />
                Inicia sesión para valorar
              </Link>
            ) : (
              <button onClick={() => setShowReviewForm((value) => !value)} className="nova-button-dark w-full justify-center">
                <ShieldCheck size={16} />
                {currentUserReview ? "Editar mi valoraci??n" : "Valorar art??culo"}
              </button>
            )}

            {showReviewForm ? (
              <div className="rounded-[28px] border border-fuchsia-100 bg-fuchsia-50/70 p-5">
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-white p-2 text-fuchsia-600 shadow-sm">
                    <Info size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Tu lectura ayuda a decidir si este artículo comunica bien.</p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      No es un arbitraje técnico pesado. Solo marca estrellas y deja un comentario corto sobre lo que funciona o lo que podria mejorar.
                    </p>
                  </div>
                </div>

                <div className="mt-5 rounded-[24px] border border-slate-200 bg-white/90 p-5">
                  <p className="text-sm font-bold text-slate-900">¿Que tan buena te parece esta publicación</p>
                  <div className="mt-4 flex items-center justify-between gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={`quick-review-star-${star}`}
                        type="button"
                        onClick={() => handleReviewRatingChange(star)}
                        className={`rounded-2xl p-2 transition ${
                          star <= reviewDraft.rating ? "text-amber-500" : "text-slate-300 hover:text-amber-400"
                        }`}
                        aria-label={`${star} estrellas`}
                      >
                        <Star size={30} fill={star <= reviewDraft.rating ? "currentColor" : "none"} />
                      </button>
                    ))}
                  </div>
                  <div className="mt-4 rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-sm font-semibold text-slate-900">{reviewDraft.rating ? `${reviewDraft.rating}/5 estrellas` : "Sin estrellas todav?a"}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{getRatingPrompt(reviewDraft.rating)}</p>
                  </div>
                </div>

                <div className="mt-5 rounded-[24px] border border-slate-200 bg-white/90 p-4">
                  <p className="text-sm font-bold text-slate-900">Comentario</p>
                  <textarea
                    value={reviewDraft.comment}
                    onChange={(event) => setReviewDraft((current) => ({ ...current, comment: event.target.value }))}
                    placeholder="Ejemplo: este artículo explica muy bien el tema, aunque podria aterrizar mejor sus implicaciones o mostrar una fuente adicional."
                    className="nova-field mt-4 min-h-[150px]"
                  />
                  <p className="mt-3 text-xs leading-5 text-slate-400">
                    Hazlo simple: una observacion util, humana y publica para ayudar al autor y a otros lectores.
                  </p>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    onClick={() => void handleReviewSubmit()}
                    className="nova-button-solid flex-1 justify-center"
                    disabled={isSubmittingReview}
                  >
                    <ShieldCheck size={16} />
                    {currentUserReview ? "Actualizar valoraci?n" : "Publicar valoraci?n"}
                  </button>

                  {currentUserReview && (
                    <button onClick={() => void handleDeleteReview()} className="nova-button-soft justify-center">
                      <Trash2 size={16} />
                      Eliminar
                    </button>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </section>

        <section className="nova-card p-6">
          <div className="space-y-2">
            <p className="nova-eyebrow">Criterios de revisión</p>
            <h3 className="nova-title text-2xl font-extrabold text-slate-900">Que mirar al valorar</h3>
          </div>

          <div className="mt-5 space-y-4">
            {reviewInsightCards.map((item) => {
              const Icon = item.icon
              return (
                <div key={item.title} className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4">
                  <p className="inline-flex items-center gap-2 text-sm font-bold text-slate-900">
                    <span className="rounded-full bg-white p-2 text-fuchsia-600 shadow-sm">
                      <Icon size={15} />
                    </span>
                    {item.title}
                  </p>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{item.copy}</p>
                </div>
              )
            })}
          </div>
        </section>
      </aside>
    </div>
  )
}



