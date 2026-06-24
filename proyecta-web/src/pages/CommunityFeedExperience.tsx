import { startTransition, useDeferredValue, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import {
  ArrowRight,
  BookOpenText,
  Clock3,
  ExternalLink,
  FileText,
  Search,
  ShieldCheck,
  Star,
  TrendingUp,
  UserCheck,
  UserPlus,
} from "lucide-react"
import { toast } from "react-hot-toast"

import { ProyectaMark, ProyectaTokenSeal } from "../components/brand/ProyectaBrand"
import {
  categoryLabels,
  editorialPrinciples,
  type FeedArticle,
} from "../data/mockData"
import { useAuth } from "../context/AuthContext"
import { useCommunityFeedData } from "../hooks/useCommunityFeedData"

const feedTabs = [
  { id: "tendencia", label: "Tendencia" },
  { id: "recientes", label: "Recientes" },
  { id: "evaluados", label: "Mejor evaluadas" },
] as const

const statusFilterOptions = [
  { id: "all", label: "Todas" },
  { id: "reviewed", label: "Financiados" },
  { id: "open", label: "En desarrollo" },
] as const

type FeedMode = "all" | "reviewed" | "open"
type FeedTab = (typeof feedTabs)[number]["id"]
type FeedStatusFilter = (typeof statusFilterOptions)[number]["id"]

const feedModeMeta: Record<
  FeedMode,
  {
    eyebrow: string
    title: string
    description: string
    helper: string
    badge: string
    emptyTitle: string
    emptyDescription: string
  }
> = {
  all: {
    eyebrow: "Feed de proyectos",
    title: "Proyectos para apoyar dentro de Proyecta",
    description:
      "Aquí ves juntos los proyectos ya financiados y los que aún buscan apoyo comunitario. Usa los filtros si quieres concentrarte en una sola vista.",
    helper:
      "Primero ves todo el feed. Si luego quieres afinar tu búsqueda, usa los filtros de estado, categoría o búsqueda.",
    badge: "Todo el feed",
    emptyTitle: "Todavía no hay proyectos visibles en esta ruta.",
    emptyDescription:
      "Cuando entren nuevos proyectos o se completen metas de financiamiento, aparecerán aquí para que el apoyo comunitario siga vivo.",
  },
  reviewed: {
    eyebrow: "Proyectos financiados",
    title: "Proyectos ya financiados por la comunidad",
    description:
      "Aquí descubres proyectos que ya recibieron apoyo comunitario. El objetivo es explorar investigación que fue posible gracias a la colaboración colectiva, comparar logros y seguir conversaciones ya activas.",
    helper: "Explora cada proyecto por lo que ya tiene financiamiento visible y vuelve al inicio si quieres cambiar de ruta.",
    badge: "Financiados",
    emptyTitle: "Todavía no hay proyectos financiados en esta vista.",
    emptyDescription:
      "Cuando la comunidad apoye los primeros proyectos, aparecerán aquí para inspirar más colaboración.",
  },
  open: {
    eyebrow: "Proyectos en desarrollo",
    title: "Proyectos disponibles para apoyo comunitario",
    description:
      "Aquí encuentras proyectos nuevos o todavía sin apoyo. Es el espacio para explorar primero, comentar y ayudar a que cada proyecto gane el apoyo que necesita para avanzar.",
    helper: "Si un proyecto te importa, entra, explóralo y deja un comentario amable, claro y útil para el investigador.",
    badge: "En desarrollo",
    emptyTitle: "No hay proyectos sin apoyo en esta vista.",
    emptyDescription:
      "Cuando entren proyectos nuevos buscando financiamiento, se mostrarán aquí para invitar a apoyo comunitario.",
  },
}

function matchesMode(article: FeedArticle, mode: FeedMode) {
  const hasVisibleReview = Number(article.metrics.peerScore ?? 0) > 0
  if (mode === "all") {
    return true
  }

  return mode === "reviewed" ? hasVisibleReview : !hasVisibleReview
}

function getPagePath(mode: FeedMode) {
  return mode === "open" ? "/por-revisar" : "/revisadas"
}

function getAlternateMode(mode: FeedMode): FeedMode {
  return mode === "open" ? "reviewed" : "open"
}

function CommunityFeedExperience({ mode }: { mode: FeedMode }) {
  const { user, isAuthenticated } = useAuth()
  const { apiBaseUrl, articles, communityOverview, isSyncing } = useCommunityFeedData()
  const sessionToken = window.localStorage.getItem("proyecta-session-token")
  const [activeTab, setActiveTab] = useState<FeedTab>("tendencia")
  const [query, setQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("Todas")
  const [statusFilter, setStatusFilter] = useState<FeedStatusFilter>(mode)
  const [voteOverrides, setVoteOverrides] = useState<Record<string, 0 | 1>>({})
  const [voteCountOverrides, setVoteCountOverrides] = useState<Record<string, number>>({})
  const [followOverrides, setFollowOverrides] = useState<Record<string, boolean>>({})
  const [busyActionId, setBusyActionId] = useState<string | null>(null)
  const deferredQuery = useDeferredValue(query)
  const meta = feedModeMeta[mode]
  const alternateMode = getAlternateMode(mode)

  const renderedTopics = communityOverview.trendingTopics ?? []
  const renderedHighlights = communityOverview.recentReviews ?? []

  const modeArticles = useMemo(() => articles.filter((article) => matchesMode(article, statusFilter)), [articles, statusFilter])

  const categoryEntries = useMemo(() => {
    const counts = new Map<string, number>()

    modeArticles.forEach((article) => {
      const label = article.category.trim() || "General"
      counts.set(label, (counts.get(label) ?? 0) + 1)
    })

    const knownCategories = [...categoryLabels]
    const extraCategories = [...counts.keys()]
      .filter((label) => !knownCategories.includes(label))
      .sort((left, right) => left.localeCompare(right, "es"))

    return ["Todas", ...knownCategories, ...extraCategories].map((label) => ({
      label,
      count: label === "Todas" ? modeArticles.length : counts.get(label) ?? 0,
    }))
  }, [modeArticles])

  const visibleArticles = useMemo(() => {
    const normalizedQuery = deferredQuery.trim().toLowerCase()

    let filteredArticles = [...modeArticles]

    if (activeCategory !== "Todas") {
      filteredArticles = filteredArticles.filter((article) => article.category === activeCategory)
    }

    if (normalizedQuery) {
      filteredArticles = filteredArticles.filter((article) =>
        [
          article.title,
          article.excerpt,
          article.category,
          article.author.name,
          article.author.affiliation,
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery),
      )
    }

    if (activeTab === "evaluados") {
      filteredArticles.sort((left, right) => right.metrics.peerScore - left.metrics.peerScore)
    } else if (activeTab === "tendencia") {
      filteredArticles.sort((left, right) => right.metrics.votes - left.metrics.votes)
    }

    return filteredArticles
  }, [activeCategory, activeTab, deferredQuery, modeArticles])

  const handleFeedUpvote = async (articleId: string, currentVote: 0 | 1) => {
    if (!isAuthenticated || !sessionToken) {
      toast("Registrate para votar y mover tendencia.")
      window.location.href = "/login?intent=review"
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
      window.location.href = "/login?intent=review"
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

  return (
    <div className="space-y-6">
      {isSyncing ? (
        <div className="flex items-center gap-3 rounded-full border border-fuchsia-100 bg-fuchsia-50/80 px-4 py-3 text-sm font-medium text-fuchsia-700">
          <ShieldCheck size={16} />
        Sincronizando proyectos en vivo para mostrar solo proyectos reales de la comunidad.
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)_320px]">
        <aside className="space-y-6 xl:sticky xl:top-28 xl:self-start">
          <section className="nova-card p-6">
            <p className="nova-eyebrow">Categorías</p>
            <ul className="mt-5 space-y-3 text-[15px] font-medium text-slate-600">
              {categoryEntries.map((category) => (
                <li key={category.label}>
                  <button
                    type="button"
                    onClick={() => setActiveCategory(category.label)}
                    className="flex w-full items-center justify-between gap-3 rounded-2xl px-2 py-1.5 text-left transition-colors hover:bg-slate-50 hover:text-slate-900"
                    data-active={activeCategory === category.label}
                  >
                    <span className={activeCategory === category.label ? "text-slate-900" : ""}>
                      {category.label}
                    </span>
                    <span className="shrink-0 text-sm font-semibold text-slate-400">
                      ({category.count})
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section className="nova-card p-6">
            <div className="flex items-center gap-2 text-fuchsia-600">
              <TrendingUp size={18} />
              <p className="nova-eyebrow text-fuchsia-600">Radar LatAm</p>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {renderedTopics.length ? (
                renderedTopics.map((topic) => (
                  <span
                    key={topic}
                    className="rounded-full border border-fuchsia-100 bg-fuchsia-50/80 px-3 py-2 text-xs font-semibold text-slate-600"
                  >
                    {topic}
                  </span>
                ))
              ) : (
                <p className="rounded-[22px] bg-slate-50/80 px-4 py-4 text-sm leading-7 text-slate-500">
                  Los temas con movimiento real aparecerán aquí conforme entren proyectos y apoyo de la comunidad.
                </p>
              )}
            </div>
          </section>

          <section className="nova-card p-6">
            <p className="nova-eyebrow">Principios editoriales</p>
            <div className="mt-5 space-y-4">
              {editorialPrinciples.map((principle) => (
                <article key={principle.title} className="space-y-2 rounded-[22px] bg-slate-50/80 p-4">
                  <h3 className="font-bold text-slate-900">{principle.title}</h3>
                  <p className="text-sm leading-6 text-slate-500">{principle.copy}</p>
                </article>
              ))}
            </div>
          </section>
        </aside>

        <section className="space-y-6">
          <section className="nova-card p-6 md:p-8">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div className="max-w-3xl">
                <p className="nova-eyebrow text-fuchsia-600">{meta.eyebrow}</p>
                <h1 className="nova-title mt-2 text-3xl font-extrabold text-slate-900 md:text-5xl">
                  {meta.title}
                </h1>
                <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600">
                  {meta.description}
                </p>
              </div>

              <div className="rounded-[28px] border border-fuchsia-100 bg-fuchsia-50/70 px-4 py-3 text-sm font-semibold text-fuchsia-700">
                {modeArticles.length} proyectos en esta vista
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              {statusFilterOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className="nova-tab"
                  data-active={statusFilter === option.id}
                  onClick={() => startTransition(() => setStatusFilter(option.id))}
                >
                  {option.label}
                </button>
              ))}
              <Link to="/" className="nova-tab">
                Volver al inicio
              </Link>
              <div className="rounded-full border border-slate-200 bg-slate-50/80 px-4 py-2 text-sm font-semibold text-slate-500">
                {statusFilter === "all"
                    ? "Todo el feed"
                    : statusFilter === "reviewed"
                      ? "Solo financiados"
                      : "Solo en desarrollo"}
              </div>
            </div>

            <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1fr)_240px]">
              <label className="relative">
                <Search
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Buscar por tema, autor o categoría dentro de este feed..."
                  className="nova-field pl-11"
                />
              </label>

              <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm leading-7 text-slate-600">
                {meta.helper}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {feedTabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  className="nova-tab"
                  data-active={tab.id === activeTab}
                  onClick={() => startTransition(() => setActiveTab(tab.id))}
                >
                  {tab.label}
                </button>
              ))}

              {activeCategory !== "Todas" ? (
                <button
                  type="button"
                  onClick={() => setActiveCategory("Todas")}
                  className="rounded-full border border-fuchsia-100 bg-fuchsia-50 px-4 py-2 text-sm font-semibold text-fuchsia-700"
                >
                  Limpiar categoría: {activeCategory}
                </button>
              ) : null}
            </div>
          </section>

          {visibleArticles.map((article) => {
            const isReviewed = Number(article.metrics.peerScore ?? 0) > 0
            const authorProfileUrl = `/profile/${article.author.id}`
            const currentVote = voteOverrides[article.id] ?? Number(article.viewerState.vote ?? 0)
            const currentVotes = voteCountOverrides[article.id] ?? article.metrics.votes
            const isFollowingAuthor =
              followOverrides[article.author.id] ?? Boolean(article.viewerState.followingAuthor)
            const canFollowAuthor = !user || user.id !== article.author.id

            return (
              <article key={article.id} className="nova-card overflow-hidden p-6 md:p-8">
                <div className="flex flex-col gap-6">
                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="nova-pill">{article.category}</span>
                      <span
                        className={`rounded-full px-3 py-1 ${
                          isReviewed
                            ? "border border-emerald-100 bg-emerald-50 text-emerald-700"
                            : "border border-amber-100 bg-amber-50 text-amber-700"
                        }`}
                      >
                          {isReviewed ? "Financiado" : "En desarrollo"}
                      </span>
                      <span>{article.timeAgo}</span>
                      <span>-</span>
                      <span>{article.readTime}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => void handleFeedUpvote(article.id, currentVote as 0 | 1)}
                        disabled={busyActionId === `vote-${article.id}`}
                        className={`nova-button-soft min-w-[124px] justify-center ${
                          currentVote === 1 ? "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700" : ""
                        }`}
                      >
                        <TrendingUp size={16} />
                          {currentVote === 1 ? "Apoyo confirmado" : "Apoyar proyecto"}
                      </button>

                      {!isReviewed && (
                        <Link
                          to={`/article/${article.id}`}
                          className="nova-button-soft min-w-[112px] justify-center"
                        >
                          Explorar
                        </Link>
                      )}
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div
                      className={`gap-5 ${
                        article.figureImage ? "grid md:grid-cols-[minmax(0,1fr)_220px] md:items-start" : "space-y-4"
                      }`}
                    >
                      <div className="space-y-4">
                        <Link to={`/article/${article.id}`} className="group block">
                          <h2 className="nova-title text-3xl font-extrabold tracking-tight text-slate-900 transition-colors group-hover:text-fuchsia-600 md:text-[2.4rem]">
                            {article.title}
                          </h2>
                        </Link>
                        <p className="max-w-3xl text-lg leading-9 text-slate-600 md:text-[1.08rem]">
                          {article.excerpt}
                        </p>
                      </div>

                      {article.figureImage ? (
                        <Link
                          to={`/article/${article.id}`}
                          className="group overflow-hidden rounded-[24px] border border-slate-200 bg-slate-50/80 shadow-[0_12px_30px_-24px_rgba(15,23,42,0.45)]"
                        >
                          <img
                            src={article.figureImage}
                            alt={article.figureCaption || article.title}
                            className="h-44 w-full object-cover transition duration-300 group-hover:scale-[1.03]"
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
                                <ExternalLink size={16} className="mt-0.5 text-fuchsia-500 transition group-hover:text-fuchsia-700" />
                              </div>
                            </a>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    <div className="rounded-[26px] border border-white/70 bg-slate-50/90 p-5">
                      <div className="flex flex-col gap-4">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <Link
                          to={authorProfileUrl}
                          className="flex min-w-0 items-center gap-4 rounded-[22px] transition hover:bg-white/70 hover:px-2 hover:py-1"
                        >
                          <img
                            src={article.author.image}
                            alt={article.author.name}
                            className="h-14 w-14 rounded-2xl object-cover"
                          />
                          <div className="min-w-0">
                            <p className="truncate font-bold text-slate-900">{article.author.name}</p>
                            <p className="text-sm text-slate-500">
                              {article.author.role} Â· {article.author.affiliation}
                            </p>
                          </div>
                        </Link>

                        <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                          {canFollowAuthor ? (
                            <button
                              type="button"
                              onClick={() =>
                                void handleToggleFollow(article.author.id, isFollowingAuthor)
                              }
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

                        <div className="flex flex-wrap gap-2">
                          {article.tags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-500"
                            >
                              {tag}
                            </span>
                          ))}
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
                      {mode === "reviewed" ? "Leer y conversar" : "Leer y revisar"}
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              </article>
            )
          })}

          {visibleArticles.length === 0 ? (
            <div className="nova-card p-10 text-center">
              <p className="nova-eyebrow">Sin resultados</p>
              <h2 className="nova-title mt-3 text-3xl font-extrabold text-slate-900">
                {meta.emptyTitle}
              </h2>
              <p className="mt-3 text-base leading-7 text-slate-500">{meta.emptyDescription}</p>
            </div>
          ) : null}
        </section>

        <aside className="space-y-6 xl:sticky xl:top-28 xl:self-start">
          <section className="overflow-hidden rounded-[30px] bg-[linear-gradient(135deg,#0f172a,#17306c_55%,#255cff)] p-6 text-white shadow-2xl shadow-slate-900/20">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <p className="nova-eyebrow text-white/70">CRÉDITOS</p>
                <ProyectaTokenSeal size={68} tone="light" showLabel={false} />
              </div>
              <h3 className="nova-title text-3xl font-extrabold">
                Incentivos internos listos para evolucionar a Base.
              </h3>
              <p className="text-sm leading-7 text-white/80">
                {communityOverview.novas.summary ?? "CRÉDITOS recompensa publicación, revisión y comentarios dentro de la plataforma. En Fase 1 funciona como saldo interno verificable."}
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[22px] bg-white/10 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/60">Publicar</p>
                  <p className="mt-2 text-2xl font-extrabold">
                    +{communityOverview.novas.policy.publicationReward ?? 25}
                  </p>
                </div>
                <div className="rounded-[22px] bg-white/10 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/60">Revisar</p>
                  <p className="mt-2 text-2xl font-extrabold">
                    +{communityOverview.novas.policy.reviewReward ?? 15}
                  </p>
                </div>
                <div className="rounded-[22px] bg-white/10 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/60">Comentar</p>
                  <p className="mt-2 text-2xl font-extrabold">
                    +{communityOverview.novas.policy.commentReward ?? 5}
                  </p>
                </div>
                <div className="rounded-[22px] bg-white/10 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/60">Bonus calidad</p>
                  <p className="mt-2 text-2xl font-extrabold">
                    +{communityOverview.novas.policy.positiveVoteBonus ?? 2}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-[30px] bg-[linear-gradient(135deg,#255cff,#5a63ff)] p-6 text-white shadow-2xl shadow-fuchsia-600/20">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <p className="nova-eyebrow text-white/70">Cambio rapido</p>
                <ProyectaMark size={48} />
              </div>
              <h3 className="nova-title text-3xl font-extrabold">
                {mode === "open"
                  ? "Quieres volver a una vista más amplia para leer todo el feed"
                  : "Quieres entrar directo a los artículos que aún esperan primera lectura?"}
              </h3>
              <p className="text-sm leading-7 text-white/80">
                {mode === "open"
                  ? "Vuelve al feed de lectura si quieres combinar artículos revisados y abiertos en una sola vista."
                  : "Pasa al espacio por revisar para ayudar a que nuevos artículos ganen estrellas, comentarios y visibilidad."}
              </p>
              <Link
                to={getPagePath(alternateMode)}
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-fuchsia-700 transition hover:-translate-y-px"
              >
                {mode === "open" ? "Ir a lectura general" : "Ir a por revisar"}
                <ArrowRight size={16} />
              </Link>
            </div>
          </section>

          <section className="nova-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="nova-eyebrow">Últimas revisiones</p>
                <h3 className="mt-2 nova-title text-2xl font-extrabold text-slate-900">
                  Lecturas que ayudan
                </h3>
              </div>
              <Star size={20} className="text-amber-500" />
            </div>

              <div className="mt-5 space-y-4">
                {renderedHighlights.length ? (
                  renderedHighlights.map((highlight) => (
                    <article
                      key={"id" in highlight && highlight.id ? highlight.id : highlight.reviewer}
                      className="rounded-[22px] bg-slate-50/90 p-4"
                    >
                      <p className="text-sm font-bold text-slate-900">{highlight.reviewer}</p>
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                        {highlight.specialty}
                      </p>
                      <p className="mt-3 text-sm leading-6 text-slate-600">"{highlight.quote}"</p>
                      <p className="mt-3 text-xs font-medium text-fuchsia-600">{highlight.about}</p>
                    </article>
                  ))
              ) : (
                  <div className="rounded-[22px] bg-slate-50/90 p-4 text-sm leading-6 text-slate-600">
                    Las revisiones reales aparecerán aquí cuando la comunidad publique sus primeras lecturas.
                  </div>
                )}
              </div>
          </section>

          <section className="nova-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="nova-eyebrow">Conversacion viva</p>
                <h3 className="mt-2 nova-title text-2xl font-extrabold text-slate-900">
                  Comentarios recientes
                </h3>
              </div>
              <BookOpenText size={20} className="text-fuchsia-500" />
            </div>

            <div className="mt-5 space-y-4">
              {(communityOverview.recentComments.length ? communityOverview.recentComments : []).map((comment) => (
                <article key={comment.id} className="rounded-[22px] bg-slate-50/90 p-4">
                  <p className="text-sm font-bold text-slate-900">{comment.author}</p>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{comment.comment}</p>
                  <p className="mt-3 text-xs font-medium text-fuchsia-600">{comment.articleTitle}</p>
                </article>
              ))}
              {!communityOverview.recentComments.length ? (
                <div className="rounded-[22px] bg-slate-50/90 p-4 text-sm leading-6 text-slate-600">
                  Cuando comiencen los primeros debates científicos, aparecerán aquí en tiempo real.
                </div>
              ) : null}
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}

export function ReviewedFeedExperience() {
  return <CommunityFeedExperience mode="all" />
}

export function OpenReviewFeedExperience() {
  return <CommunityFeedExperience mode="open" />
}

export default CommunityFeedExperience

