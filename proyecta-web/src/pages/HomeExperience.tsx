import { useMemo, useState, useEffect } from "react"
import { Link } from "react-router-dom"
import {
  ArrowRight,
  BookOpenText,
  Clock3,
  ExternalLink,
  FileText,
  MessageSquare,
  PenSquare,
  ShieldCheck,
  Star,
  TrendingUp,
  UserCheck,
  UserPlus,
  Users,
} from "lucide-react"
import { toast } from "react-hot-toast"

import { ProyectaBrandLockup, ProyectaMark } from "../components/brand/ProyectaBrand"
import { ComputeDonationPopup } from "../components/ComputeDonationPopup"
import { useAuth } from "../context/AuthContext"
import { useComputeDonation } from "../hooks/useComputeDonation"
import type { CommunityOverview } from "../hooks/useCommunityFeedData"
import { useCommunityFeedData } from "../hooks/useCommunityFeedData"
import type { FeedArticle } from "../data/mockData"

const purposeStatements = [
  {
    title: "Hacer legible la ciencia",
    copy: "Convertir hallazgos, preguntas y avances en artículos que puedan leerse con claridad sin perder seriedad académica.",
  },
  {
    title: "Construir confianza pública",
    copy: "Dar identidad visible, valoración abierta y trazabilidad para que la conversación científica sea más clara y más confiable.",
  },
  {
    title: "Mover comunidad en LatAm",
    copy: "Conectar divulgadores, investigadores y lectores en un espacio donde compartir ciencia se sienta estimulante y profesional.",
  },
]

const communityJourney = [
  {
    title: "1. Crea tu identidad",
    copy: "Registra tu cuenta, personaliza tu perfil y, si quieres, sincroniza ORCID para enriquecer tu trayectoria.",
    icon: Users,
  },
  {
    title: "2. Publica con claridad",
    copy: "Comparte artículos, hallazgos o preguntas con una escritura seria, legible y bien situada.",
    icon: PenSquare,
  },
  {
    title: "3. Lee y valora",
    copy: "Deja estrellas y comentarios que ayuden a otras personas a reconocer qué artículo comunica mejor su aporte.",
    icon: BookOpenText,
  },
  {
    title: "4. Conversa en comunidad",
    copy: "Sigue perfiles, responde ideas y ayuda a que la ciencia circule con criterio, cercanía y trazabilidad.",
    icon: MessageSquare,
  },
]

const publicationScope = [
  "Artículos de divulgación científica con lectura clara y fundamento verificable.",
  "Preguntas abiertas, síntesis de avances y cruces entre ciencia, sociedad y tecnología.",
  "Textos que aporten conversación pública sin perder rigor ni atribución de fuentes.",
]

function getIsoWeekSeed() {
  const now = new Date()
  const utcDate = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()))
  const day = utcDate.getUTCDay() || 7
  utcDate.setUTCDate(utcDate.getUTCDate() + 4 - day)
  const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1))
  return Math.ceil(((utcDate.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}

function rotateWeeklyTopArticles(
  articles: FeedArticle[],
  voteOverrides: Record<string, number>,
) {
  const sorted = [...articles].sort((left, right) => {
    const rightVotes = voteOverrides[right.id] ?? right.metrics.votes
    const leftVotes = voteOverrides[left.id] ?? left.metrics.votes

    if (rightVotes !== leftVotes) {
      return rightVotes - leftVotes
    }

    return right.timeAgo.localeCompare(left.timeAgo, "es")
  })

  if (sorted.length <= 1) {
    return sorted
  }

  const offset = getIsoWeekSeed() % sorted.length
  return [...sorted.slice(offset), ...sorted.slice(0, offset)]
}

function normalizeStatLabel(label: string) {
  const normalized = label
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()

  if (normalized.includes("usuario") || normalized.includes("perfil")) {
    return "Investigadores"
  }

  if (normalized.includes("revisión")) {
    return "Validaciones"
  }

  if (normalized.includes("coment")) {
    return "Comentarios"
  }

  return label
}

function getCommunityStats(communityOverview: CommunityOverview, articles: FeedArticle[]) {
  const fallbackAuthors = new Set(articles.map((article) => article.author.id)).size
  const fallbackReviews = communityOverview.recentReviews.length ?? 0
  const fallbackComments = communityOverview.recentComments.length ?? 0
  const rawStats = Array.isArray(communityOverview.stats) ? communityOverview.stats : []

  if (rawStats.length >= 3) {
    return rawStats.slice(0, 3).map((stat) => ({
      value: String(stat.value ?? "0"),
      label: normalizeStatLabel(String(stat.label ?? "")),
    }))
  }

  return [
    { value: String(fallbackAuthors), label: "Investigadores" },
    { value: String(fallbackReviews), label: "Validaciones" },
    { value: String(fallbackComments), label: "Comentarios" },
  ]
}

export default function HomeExperience() {
  const { user, isAuthenticated } = useAuth()
  const { apiBaseUrl, articles, communityOverview, isSyncing } = useCommunityFeedData()
  const { shouldShowPopup, getDonationStatus } = useComputeDonation()
  const sessionToken =
    typeof window !== "undefined" ? window.localStorage.getItem("proyecta-session-token") : null

  const [voteOverrides, setVoteOverrides] = useState<Record<string, 0 | 1>>({})
  const [voteCountOverrides, setVoteCountOverrides] = useState<Record<string, number>>({})
  const [followOverrides, setFollowOverrides] = useState<Record<string, boolean>>({})
  const [busyActionId, setBusyActionId] = useState<string | null>(null)
  const [showComputeDonationPopup, setShowComputeDonationPopup] = useState(false)

  // Mostrar popup de donación en la homepage (más directo)
  useEffect(() => {
    const donationStatus = getDonationStatus()
    const isAlreadyDonating = donationStatus.enabled && donationStatus.percentage > 0

    // Solo mostrar si: usuario está autenticado, no está donando, y no fue descartado
    if (isAuthenticated && !isAlreadyDonating && shouldShowPopup('interactions')) {
      // Mostrar popup más directo (sin esperar)
      setShowComputeDonationPopup(true)
    }
  }, [isAuthenticated, shouldShowPopup, getDonationStatus])

  const reviewedArticles = useMemo(
    () => articles.filter((article) => Number(article.metrics.peerScore ?? 0) > 0),
    [articles],
  )
  const openArticles = useMemo(
    () => articles.filter((article) => Number(article.metrics.peerScore ?? 0) <= 0),
    [articles],
  )

  const reviewedPreview = useMemo(
    () => rotateWeeklyTopArticles(reviewedArticles, voteCountOverrides).slice(0, 3),
    [reviewedArticles, voteCountOverrides],
  )
  const openPreview = useMemo(
    () => rotateWeeklyTopArticles(openArticles, voteCountOverrides).slice(0, 3),
    [openArticles, voteCountOverrides],
  )

  const publicationStats = useMemo(
    () => [
      { value: String(articles.length), label: "Total de proyectos" },
      { value: String(reviewedArticles.length), label: "Financiados" },
      { value: String(openArticles.length), label: "En desarrollo" },
    ],
    [articles.length, reviewedArticles.length, openArticles.length],
  )

  const communityStats = useMemo(
    () => getCommunityStats(communityOverview, articles),
    [articles, communityOverview],
  )

  const userGuide = [
    {
      title: "Explorar",
      copy: "Descubre proyectos de investigación financiados y apoyados por la comunidad.",
      icon: BookOpenText,
    },
    {
      title: "Apoyar",
      copy: "Comenta, valida y aporta tu apoyo a proyectos en desarrollo.",
      icon: MessageSquare,
    },
    {
      title: "Publicar Proyecto",
      copy: "Comparte tu investigación con una meta de financiamiento y busca apoyo comunitario.",
      icon: PenSquare,
    },
  ]

  const heroRoutes = [
    {
      title: "Explorar",
      copy: "Descubre proyectos de investigación que necesitan tu apoyo.",
      to: "/revisadas",
      icon: BookOpenText,
    },
    {
      title: "Apoyar",
      copy: "Comenta, valida y financia proyectos que te importan.",
      to: isAuthenticated ? "/por-revisar" : "/login?intent=review",
      icon: MessageSquare,
    },
    {
      title: "Publicar Proyecto",
      copy: "Comparte tu investigación, fija una meta y recibe apoyo directo de la comunidad.",
      to: isAuthenticated ? "/editor" : "/login?intent=publish",
      icon: PenSquare,
    },
  ]

  const handleFeedUpvote = async (articleId: string, currentVote: 0 | 1) => {
    if (!isAuthenticated || !sessionToken) {
      toast("Regístrate para votar y ayudar a mover el feed.")
      window.location.href = "/loginintent=review"
      return
    }

    const nextVote = currentVote === 1 ? 0 : 1
    const actionId = `vote-${articleId}`
    setBusyActionId(actionId)

    try {
      const response = await fetch(`${apiBaseUrl}/api/articles/${articleId}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({ value: nextVote }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error ?? "No fue posible registrar tu voto.")
      }

      setVoteOverrides((prev) => ({
        ...prev,
        [articleId]: nextVote as 0 | 1,
      }))
      setVoteCountOverrides((prev) => ({
        ...prev,
        [articleId]: Number(data.metrics.votes ?? prev[articleId] ?? 0),
      }))
    } catch (error) {
      const message = error instanceof Error ? error.message : "No fue posible registrar tu voto."
      toast.error(message)
    } finally {
      setBusyActionId((prev) => (prev === actionId ? null : prev))
    }
  }

  const handleToggleFollow = async (authorId: string, isFollowing: boolean) => {
    if (!isAuthenticated || !sessionToken) {
      toast("Crea tu cuenta para seguir perfiles.")
      window.location.href = "/loginintent=review"
      return
    }

    const actionId = `follow-${authorId}`
    setBusyActionId(actionId)

    try {
      const response = await fetch(`${apiBaseUrl}/api/users/${authorId}/follow`, {
        method: isFollowing ? "DELETE" : "POST",
        headers: {
          Authorization: `Bearer ${sessionToken}`,
        },
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error ?? "No fue posible actualizar este seguimiento.")
      }

      setFollowOverrides((prev) => ({
        ...prev,
        [authorId]: Boolean(data.following),
      }))
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No fue posible actualizar este seguimiento."
      toast.error(message)
    } finally {
      setBusyActionId((prev) => (prev === actionId ? null : prev))
    }
  }

  const renderHomeFeedCard = (article: FeedArticle, status: "reviewed" | "open") => {
    const isReviewed = status === "reviewed"
    const currentVote = voteOverrides[article.id] ?? Number(article.viewerState.vote ?? 0)
    const currentVotes = voteCountOverrides[article.id] ?? article.metrics.votes
    const authorProfileUrl = `/profile/${article.author.id}`
    const isFollowingAuthor =
      followOverrides[article.author.id] ?? Boolean(article.viewerState.followingAuthor)
    const canFollowAuthor = !user || user.id !== article.author.id

    return (
      <article
        key={article.id}
        className="rounded-[30px] border border-slate-200 bg-white/85 p-5 shadow-[0_18px_48px_-30px_rgba(15,23,42,0.35)]"
      >
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
            <div className="flex flex-wrap items-center gap-3">
              <span className="nova-pill">{article.category}</span>
              <span
                className={`rounded-full px-3 py-1 ${
                  isReviewed
                    ? "border border-emerald-100 bg-emerald-50 text-emerald-700"
                    : "border border-amber-100 bg-amber-50 text-amber-700"
                }`}
              >
                {isReviewed ? "Revisado" : "Por revisar"}
              </span>
              <span>{article.timeAgo}</span>
              <span>-</span>
              <span>{article.readTime}</span>
            </div>

            <button
              type="button"
              onClick={() => void handleFeedUpvote(article.id, currentVote as 0 | 1)}
              disabled={busyActionId === `vote-${article.id}`}
              className={`nova-button-soft min-w-[120px] justify-center ${
                currentVote === 1 ? "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700" : ""
              }`}
            >
              <TrendingUp size={16} />
              {currentVote === 1 ? "Upvotado" : "Upvote"}
            </button>
          </div>

          <div
            className={`gap-5 ${
              article.figureImage
                ? "grid md:grid-cols-[minmax(0,1fr)_240px] md:items-start"
                : "space-y-4"
            }`}
          >
            <div className="space-y-4">
              <Link to={`/article/${article.id}`} className="group block">
                <h3 className="nova-title text-3xl font-extrabold tracking-tight text-slate-900 transition-colors group-hover:text-fuchsia-600 md:text-[2.15rem]">
                  {article.title}
                </h3>
              </Link>
              <p className="max-w-3xl text-lg leading-9 text-slate-600 md:text-[1.08rem]">
                {article.excerpt}
              </p>
            </div>

            {article.figureImage ? (
              <Link
                to={`/article/${article.id}`}
                className="group overflow-hidden rounded-[26px] border border-slate-200 bg-slate-50/80 shadow-[0_12px_30px_-24px_rgba(15,23,42,0.45)]"
              >
                <img
                  src={article.figureImage}
                  alt={article.figureCaption || article.title}
                  className="h-52 w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                />
              </Link>
            ) : null}
          </div>

          {article.sources.length > 0 ? (
            <div className="rounded-[26px] border border-fuchsia-100 bg-fuchsia-50/45 p-5">
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-fuchsia-700">
                <FileText size={15} />
                Fuentes consultables
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {article.sources.slice(0, 2).map((source) => (
                  <a
                    key={source.url}
                    href={source.url}
                    target="_blank"
                    rel="noreferrer"
                    className="group rounded-[22px] border border-fuchsia-100 bg-white/90 p-4 transition hover:-translate-y-0.5 hover:border-fuchsia-200"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-slate-900">{source.title}</p>
                        <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                          {source.publisher}
                        </p>
                      </div>
                      <ExternalLink
                        size={16}
                        className="mt-0.5 text-fuchsia-500 transition group-hover:text-fuchsia-700"
                      />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          ) : null}

          <div className="rounded-[26px] border border-slate-200 bg-slate-50/90 p-5">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <Link
                  to={authorProfileUrl}
                  className="flex min-w-0 items-center gap-4 rounded-[22px] transition hover:bg-white/80 hover:px-2 hover:py-1"
                >
                  <img
                    src={article.author.image}
                    alt={article.author.name}
                    className="h-14 w-14 rounded-2xl object-cover"
                  />
                  <div className="min-w-0">
                    <p className="truncate font-bold text-slate-900">{article.author.name}</p>
                    <p className="text-sm text-slate-500">
                      {article.author.role} · {article.author.affiliation}
                    </p>
                  </div>
                </Link>

                <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                  {article.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-500"
                    >
                      {tag}
                    </span>
                  ))}

                  {canFollowAuthor ? (
                    <button
                      type="button"
                      onClick={() => void handleToggleFollow(article.author.id, isFollowingAuthor)}
                      disabled={busyActionId === `follow-${article.author.id}`}
                      className={`nova-button-soft min-w-[132px] justify-center ${
                        isFollowingAuthor
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : ""
                      }`}
                    >
                      {isFollowingAuthor ? <UserCheck size={16} /> : <UserPlus size={16} />}
                      {isFollowingAuthor ? "Siguiendo" : "Seguir"}
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-5">
            <div className="flex flex-wrap items-center gap-5 text-sm font-semibold text-slate-500">
              <span className="inline-flex items-center gap-2">
                <TrendingUp size={16} className="text-fuchsia-500" />
                {currentVotes} votos
              </span>
              <span className="inline-flex items-center gap-2">
                <Star size={16} className="text-amber-500" />
                {isReviewed
                  ? `${article.metrics.peerScore.toFixed(1)} score comunitario`
                  : "Sin valoraciones aún"}
              </span>
              <span className="inline-flex items-center gap-2">
                <Clock3 size={16} className="text-purple-500" />
                {article.metrics.comments} comentarios
              </span>
            </div>

            <Link to={`/article/${article.id}`} className="nova-button-soft">
              {isReviewed ? "Leer y conversar" : "Leer y revisar"}
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </article>
    )
  }

  return (
    <div className="space-y-6">
      {/* Popup de donación en homepage */}
      <ComputeDonationPopup
        visible={showComputeDonationPopup}
        triggerSource="interactions"
        onClose={() => setShowComputeDonationPopup(false)}
      />

      {isSyncing ? (
        <div className="flex items-center gap-3 rounded-full border border-fuchsia-100 bg-fuchsia-50/80 px-4 py-3 text-sm font-medium text-fuchsia-700">
          <ShieldCheck size={16} />
          Sincronizando artículos reales de la comunidad para mantener el feed al día.
        </div>
      ) : null}

      {/* Banner de apoyo comunitario */}
      <div className="relative overflow-hidden rounded-[28px] border border-fuchsia-100 bg-gradient-to-r from-slate-900 via-fuchsia-950 to-purple-950 px-6 py-5 md:px-8 md:py-6">
        {/* Glow decorativo */}
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-fuchsia-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-8 left-1/3 h-32 w-32 rounded-full bg-purple-500/15 blur-2xl" />

        <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-fuchsia-500/20 text-base">⛏️</span>
              <p className="nova-eyebrow text-fuchsia-400">Apoyo voluntario</p>
            </div>
            <h3 className="nova-title text-lg font-extrabold text-white mb-2">
              La ciencia se sostiene mejor cuando muchos la financiamos
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed max-w-lg">
              Dona el poder de cómputo de tu equipo. Tu CPU genera XMR real que financia investigación directamente.
              Cada aporte crea una base de financiamiento <strong className="text-white">descentralizada, transparente e independiente</strong>
              para los proyectos científicos de la comunidad.
            </p>
            <Link
              to="/proyectos"
              className="mt-2 inline-block text-xs font-semibold text-fuchsia-400 hover:text-fuchsia-300 transition-colors"
            >
              Ver cómo funciona →
            </Link>
          </div>
          <Link
            to="/proyectos"
            className="nova-button-solid whitespace-nowrap self-start md:self-center px-6 py-2.5 text-sm font-bold"
          >
            Cómo apoyar
          </Link>
        </div>
      </div>

      <section className="relative min-h-[320px] overflow-hidden rounded-[34px] border border-fuchsia-100 bg-slate-950 shadow-[0_30px_85px_-45px_rgba(15,23,42,0.65)] md:min-h-[430px]">
        <video
              className="absolute inset-0 h-full w-full scale-105 object-cover opacity-25 blur-sm"
          src="/nova-hero-loop.mp4"
          poster="/nova-hero-poster.jpg"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-label="Video de bienvenida de Proyecta"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-slate-950/10" />
        <div className="relative flex min-h-[320px] flex-col justify-end p-6 text-white md:min-h-[430px] md:p-8">
          <div className="mb-auto flex justify-end">
            <ProyectaMark size={48} />
          </div>

          <div className="space-y-4">
            <h2 className="nova-title max-w-3xl text-base font-extrabold leading-tight md:text-[1.625rem]">
              Una comunidad que financia la ciencia que importa
            </h2>

            <div className="grid gap-3 md:grid-cols-3">
              {heroRoutes.map((route) => {
                const Icon = route.icon

                return (
                  <Link
                    key={route.title}
                    to={route.to}
                    className="rounded-[24px] border border-white/15 bg-white/10 px-4 py-4 text-left backdrop-blur transition hover:bg-white/18"
                  >
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-white/75">
                      <Icon size={16} />
                      {route.title}
                    </div>
                    <p className="mt-3 text-sm leading-6 text-white/90">{route.copy}</p>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      <div className="nova-shell p-6 md:p-8">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-4">
            <div className="inline-flex rounded-[28px] border border-white/80 bg-white/82 p-3 shadow-sm backdrop-blur">
              <ProyectaBrandLockup compact markSize={46} />
            </div>

            <div className="max-w-4xl space-y-4">
              <h1 className="nova-title text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl xl:text-6xl">
                Sostengamos la ciencia entre todos, de forma libre y comunitaria.
              </h1>
              <p className="max-w-3xl text-base leading-8 text-slate-600 md:text-lg">
                Proyecta es un espacio de <strong>apoyo mutuo y comunitario</strong> para la ciencia: una vía <strong>alternativa y descentralizada</strong> para sostener proyectos de investigación entre todas y todos. No buscamos sustituir la responsabilidad del Estado en financiar la ciencia, sino abrir caminos complementarios que protejan la <strong>vitalidad creativa y la libertad</strong> de quienes investigan. Apoyas con dinero o donando poder de cómputo —siempre voluntario, siempre con tu consentimiento.
              </p>

              <div className="inline-flex items-center gap-3 rounded-full border border-fuchsia-100 bg-fuchsia-50/80 px-4 py-3 text-sm font-semibold text-fuchsia-700">
                <ProyectaMark size={26} glow={false} />
                Apoyo mutuo, voluntario y descentralizado
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <Link to="/computacion-donada" className="nova-button-solid">
                  Apoyar la ciencia
                  <ArrowRight size={16} />
                </Link>
                <Link to="/revisadas" className="nova-button-soft">
                  Explorar proyectos
                </Link>
              </div>
            </div>
          </div>

          <aside className="nova-card flex h-full flex-col justify-between p-6">
            <div className="space-y-4">
              <p className="nova-eyebrow text-fuchsia-600">Guía rápida</p>
              <h2 className="nova-title text-3xl font-extrabold text-slate-900">
                Lo esencial para moverte en Proyecta.
              </h2>
              <p className="text-sm leading-7 text-slate-600">
                La portada muestra lo que puedes hacer desde el primer momento: leer, revisar y publicar sin perder el rigor editorial.
              </p>
            </div>

            <div className="mt-6 space-y-3">
              {userGuide.map((item) => {
                const Icon = item.icon

                return (
                  <article key={item.title} className="rounded-[24px] bg-slate-50/90 p-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-fuchsia-50 text-fuchsia-600">
                        <Icon size={18} />
                      </span>
                      <p className="text-sm font-bold text-slate-900">{item.title}</p>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-500">{item.copy}</p>
                  </article>
                )
              })}
            </div>
          </aside>
        </div>
      </div>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="nova-card overflow-hidden p-6 md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <p className="nova-eyebrow text-emerald-700">Proyectos Financiados</p>
              <h2 className="nova-title text-3xl font-extrabold text-slate-900">
                Investigación apoyada por la comunidad
              </h2>
              <p className="max-w-2xl text-base leading-8 text-slate-600">
                Aquí aparecen primero los proyectos que han alcanzado o superado su meta de financiamiento. El orden se mueve por apoyo comunitario y rota cada semana entre los proyectos más respaldados para repartir mejor la visibilidad.
              </p>
            </div>
            <div className="rounded-[24px] border border-emerald-100 bg-emerald-50/80 px-4 py-3 text-sm font-semibold text-emerald-700">
              {reviewedArticles.length} proyectos financiados
            </div>
          </div>

          <div className="mt-6 space-y-5">
            {reviewedPreview.length ? (
              reviewedPreview.map((article) => renderHomeFeedCard(article, "reviewed"))
            ) : (
              <div className="rounded-[28px] border border-emerald-100 bg-emerald-50/70 px-6 py-8 text-sm leading-7 text-slate-600">
                No hay proyectos financiados en este momento. Cuando proyectos alcancen su meta, aparecerán aquí.
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end">
            <Link to="/revisadas" className="nova-button-soft">
              Ver proyectos financiados
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        <div className="nova-card overflow-hidden p-6 md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <p className="nova-eyebrow text-amber-700">Proyectos en Desarrollo</p>
              <h2 className="nova-title text-3xl font-extrabold text-slate-900">
                Investigación que necesita tu apoyo
              </h2>
              <p className="max-w-2xl text-base leading-8 text-slate-600">
                Este bloque muestra proyectos nuevos o que aún no alcanzan su meta de financiamiento. Se ordena por progreso hacia la meta, pero la rotación semanal evita que siempre permanezcan los mismos proyectos al inicio.
              </p>
            </div>
            <div className="rounded-[24px] border border-amber-100 bg-amber-50/80 px-4 py-3 text-sm font-semibold text-amber-700">
              {openArticles.length} proyectos en desarrollo
            </div>
          </div>

          <div className="mt-6 space-y-5">
            {openPreview.length ? (
              openPreview.map((article) => renderHomeFeedCard(article, "open"))
            ) : (
              <div className="rounded-[28px] border border-amber-100 bg-amber-50/70 px-6 py-8 text-sm leading-7 text-slate-600">
                No hay proyectos en desarrollo en este momento. Cuando nuevos proyectos busquen financiamiento, aparecerán aquí.
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end">
            <Link
              to={isAuthenticated ? "/por-revisar" : "/login?intent=review"}
              className="nova-button-soft"
            >
              Ver proyectos en desarrollo
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <aside className="nova-card flex h-full flex-col p-6">
          <div className="flex items-center justify-between gap-3">
            <p className="nova-eyebrow text-slate-500">Publicaciones en Proyecta</p>
            <FileText size={20} className="text-fuchsia-600" />
          </div>

          <div className="mt-4 grid flex-1 gap-4">
            {publicationStats.map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col rounded-[26px] border border-slate-200 bg-white/85 px-6 py-5"
              >
                <p className="nova-title text-4xl font-extrabold text-slate-900">{stat.value}</p>
                <p className="mt-2 text-sm text-slate-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </aside>

        <aside className="nova-card flex h-full flex-col p-6">
          <div className="flex items-center justify-between gap-3">
            <p className="nova-eyebrow text-fuchsia-700">Comunidad Proyecta</p>
            <Users size={20} className="text-fuchsia-600" />
          </div>

          <div className="mt-4 grid flex-1 gap-4">
            {communityStats.map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col rounded-[26px] border border-slate-200 bg-white/85 px-6 py-5"
              >
                <p className="nova-title text-4xl font-extrabold text-slate-900">{stat.value}</p>
                <p className="mt-2 text-sm text-slate-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </aside>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_0.9fr]">
        <div className="nova-card p-6 md:p-8">
          <p className="nova-eyebrow text-fuchsia-600">Entrada al ecosistema</p>
          <h2 className="nova-title mt-2 text-3xl font-extrabold text-slate-900 md:text-4xl">
            Elige la ruta que mejor encaja con lo que quieres hacer hoy.
          </h2>
          <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600">
            Si vienes a leer con más señales, entra al espacio de publicaciones revisadas. Si vienes a ayudar a que nuevos artículos ganen claridad, entra al espacio por revisar. Así cada experiencia tiene su propio ritmo y el inicio se mantiene vivo.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <article className="rounded-[28px] border border-emerald-100 bg-emerald-50/70 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
                Publicaciones revisadas
              </p>
              <p className="mt-4 nova-title text-4xl font-extrabold text-slate-900">
                {reviewedArticles.length}
              </p>
              <p className="mt-3 text-base leading-7 text-slate-600">
                Artículos que ya recibieron una primera lectura visible y orientan mejor a quien llega al feed.
              </p>
            </article>

            <article className="rounded-[28px] border border-amber-100 bg-amber-50/70 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-700">
                Por revisar
              </p>
              <p className="mt-4 nova-title text-4xl font-extrabold text-slate-900">
                {openArticles.length}
              </p>
              <p className="mt-3 text-base leading-7 text-slate-600">
                Artículos que ya pueden circular, pero todavía esperan estrellas y comentarios de la comunidad.
              </p>
            </article>
          </div>
        </div>

        <aside className="overflow-hidden rounded-[30px] bg-[linear-gradient(135deg,#0f172a,#17306c_55%,#255cff)] p-6 text-white shadow-2xl shadow-slate-900/20">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <p className="nova-eyebrow text-white/70">Proyecta</p>
              <ProyectaMark size={48} />
            </div>
            <h3 className="nova-title text-3xl font-extrabold">
              La divulgación aquí nace desde la comunidad científica y se abre a toda la sociedad.
            </h3>
            <p className="text-sm leading-7 text-white/80">
              A diferencia de las plataformas tradicionales, Proyecta no depende solo de un circuito cerrado de editores y revisores. Aquí la divulgación se fortalece con revisión abierta, lectura pública, perfiles verificables y una conversación pensada tanto para comunidades científicas como no científicas.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[22px] bg-white/10 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/60">
                  Revisión abierta
                </p>
                <p className="mt-2 text-lg font-extrabold">Lectura visible</p>
                <p className="mt-3 text-sm leading-6 text-white/75">
                  Cada artículo puede ganar orientación pública y trazabilidad comunitaria.
                </p>
              </div>
              <div className="rounded-[22px] bg-white/10 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/60">
                  CRÉDITOS
                </p>
                <p className="mt-2 text-lg font-extrabold">Incentivo verificable</p>
                <p className="mt-3 text-sm leading-6 text-white/75">
                  Publicar, revisar y comentar con calidad suma valor dentro del ecosistema Proyecta.
                </p>
              </div>
            </div>
          </div>
        </aside>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_0.9fr]">
        <div className="space-y-6">
          <section className="nova-card p-6">
            <p className="nova-eyebrow">Propósito</p>
            <h2 className="nova-title mt-2 text-3xl font-extrabold text-slate-900 md:text-4xl">
              Proyecta existe para que divulgar ciencia se sienta serio, legible y estimulante.
            </h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {purposeStatements.map((statement) => (
                <article key={statement.title} className="rounded-[24px] bg-slate-50/80 p-5">
                  <h3 className="font-bold text-slate-900">{statement.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-500">{statement.copy}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="nova-card p-6">
            <p className="nova-eyebrow">Cómo funciona</p>
            <h2 className="nova-title mt-2 text-3xl font-extrabold text-slate-900">
              Cuatro pasos para entrar a la comunidad.
            </h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {communityJourney.map((step) => {
                const Icon = step.icon

                return (
                  <article key={step.title} className="rounded-[24px] bg-slate-50/85 p-5">
                    <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-fuchsia-600 shadow-sm">
                      <Icon size={20} />
                    </div>
                    <h3 className="mt-4 font-bold text-slate-900">{step.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-500">{step.copy}</p>
                  </article>
                )
              })}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="nova-card p-6">
            <p className="nova-eyebrow">Qué tiene sentido publicar aquí</p>
            <div className="mt-5 space-y-3">
              {publicationScope.map((item) => (
                <div key={item} className="rounded-[22px] bg-slate-50/80 px-4 py-4 text-sm leading-7 text-slate-600">
                  {item}
                </div>
              ))}
            </div>
          </section>

          <section className="nova-card p-6">
            <p className="nova-eyebrow">Mapa rápido</p>
            <div className="mt-5 space-y-4">
              {heroRoutes.map((route) => {
                const Icon = route.icon

                return (
                  <Link
                    key={route.title}
                    to={route.to}
                    className="flex items-start gap-4 rounded-[24px] bg-slate-50/85 p-4 transition hover:bg-slate-100/90"
                  >
                    <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-fuchsia-600 shadow-sm">
                      <Icon size={20} />
                    </span>
                    <span>
                      <span className="block font-bold text-slate-900">{route.title}</span>
                      <span className="mt-1 block text-sm leading-6 text-slate-500">
                        {route.copy}
                      </span>
                    </span>
                  </Link>
                )
              })}
            </div>
          </section>
        </aside>
      </section>
    </div>
  )
}


