import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react"
import {
  AlertCircle,
  BadgeCheck,
  BarChart2,
  Camera,
  Coins,
  ExternalLink,
  FileText,
  Link2,
  MessageSquare,
  PencilLine,
  RefreshCw,
  Save,
  ShieldCheck,
  SquarePen,
  ThumbsUp,
  Trash2,
  UserCheck,
  UserPlus,
  UserRound,
  Users,
} from "lucide-react"
import { toast } from "react-hot-toast"
import { Link, useNavigate, useParams } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { ProyectaMark, ProyectaTokenSeal } from "../components/brand/ProyectaBrand"

type ProfileUser = {
  id: string
  name: string
  email: string
  image: string
  role: string
  affiliation: string
  orcidId: string
  reputation: number
  novasBalance: number
  bio: string
  location: string
}

type UserStats = {
  posts: number
  comments: number
  votes: number
}

type Productivity = {
  totalWorks: number
  recentWorks: number
  primaryAffiliation: string
  keywords: string[]
}

type Bibliometrics = {
  source: string
  displayName: string
  worksCount: number
  citedByCount: number
  hIndex: number
  i10Index: number
  primaryInstitution: string
  openAlexId: string
  orcid: string
}

type SocialState = {
  followersCount: number
  followingCount: number
  isFollowing: boolean
}

type ReputationState = {
  total: number
  publications: number
  reviews: number
  comments: number
  policy: {
    publicationBase: number
    voteBonus: number
    reviewBase: number
    commentBase: number
  }
}

type ProyectasState = {
  total: number
  publications: number
  reviews: number
  comments: number
  qualityBonus: number
  phase: string
  storage: string
  targetNetwork: string
  status: string
  policy: {
    publicationReward: number
    reviewReward: number
    commentReward: number
    positiveVoteBonus: number
  }
}

type OrcidWork = {
  title: string
  year: number | null
  type: string
  journal: string
  url: string
}

type UserArticle = {
  id: string
  title: string
  excerpt: string
  category: string
  readTime: string
  createdAt: string
}

type DiscoveryArticle = {
  id: string
  title: string
  excerpt: string
  category: string
  readTime: string
  createdAt: string
  figureImage: string
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
  }
}

type ActivityReview = {
  id: string
  rating: number
  comment: string
  createdAt: string
  article: UserArticle | null
}

type ActivityVote = {
  id: string
  value: number
  createdAt: string
  article: UserArticle | null
}

type ActivityComment = {
  id: string
  comment: string
  createdAt: string
  article: UserArticle | null
}

type ProfileForm = {
  name: string
  role: string
  affiliation: string
  location: string
  bio: string
  image: string
}

function formatPublishedLabel(value: string) {
  if (!value) return "Reciente"

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return "Reciente"
  }

  const formatter = new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  return formatter.format(date)
}

function normalizeText(value: string) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
}

function formatTimeAgo(value: string) {
  if (!value) return "Reciente"

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Reciente"

  const diffMs = Date.now() - date.getTime()
  const diffMinutes = Math.max(1, Math.round(diffMs / 60000))

  if (diffMinutes < 60) {
    return `Hace ${diffMinutes} min`
  }

  const diffHours = Math.round(diffMinutes / 60)
  if (diffHours < 24) {
    return `Hace ${diffHours} h`
  }

  const diffDays = Math.round(diffHours / 24)
  return `Hace ${diffDays} d`
}

function resolveDisplayRole(profile: Pick<ProfileUser, "orcidId" | "role"> | null) {
  if (!profile) return "Divulgador/a"
  return profile.orcidId ? "Divulgador/a cientï¿½fico/a" : "Divulgador/a"
}

function getArticleInterestScore(article: DiscoveryArticle, interests: string[]) {
  if (!interests.length) return 0

  const articleCategory = normalizeText(article.category)
  const articleText = normalizeText(
    `${article.category} ${article.title} ${article.excerpt} ${article.author.affiliation}`,
  )

  return interests.reduce((score, rawInterest) => {
    const interest = normalizeText(rawInterest)
    if (!interest) return score

    if (articleCategory === interest) return score + 8
    if (articleCategory.includes(interest) || interest.includes(articleCategory)) return score + 5
    if (articleText.includes(interest)) return score + 2
    return score
  }, 0)
}

export default function ProfileExperience() {
  const { id: routeProfileId } = useParams()
  const navigate = useNavigate()
  const { user: sessionUser, refreshUser } = useAuth()
  const profileId = routeProfileId ?? sessionUser.id
  const apiBaseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:3000"
  const [profile, setProfile] = useState<ProfileUser | null>(null)
  const [stats, setStats] = useState<UserStats>({ posts: 0, comments: 0, votes: 0 })
  const [articles, setArticles] = useState<UserArticle[]>([])
  const [productivity, setProductivity] = useState<Productivity | null>(null)
  const [bibliometrics, setBibliometrics] = useState<Bibliometrics | null>(null)
  const [reputation, setReputation] = useState<ReputationState | null>(null)
  const [novas, setProyectas] = useState<ProyectasState | null>(null)
  const [social, setSocial] = useState<SocialState>({ followersCount: 0, followingCount: 0, isFollowing: false })
  const [activityReviews, setActivityReviews] = useState<ActivityReview[]>([])
  const [activityVotes, setActivityVotes] = useState<ActivityVote[]>([])
  const [activityComments, setActivityComments] = useState<ActivityComment[]>([])
  const [communityArticles, setCommunityArticles] = useState<DiscoveryArticle[]>([])
  const [followers, setFollowers] = useState<ProfileUser[]>([])
  const [following, setFollowing] = useState<ProfileUser[]>([])
  const [orcidWorks, setOrcidWorks] = useState<OrcidWork[]>([])
  const [loading, setLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [isDeletingPostId, setIsDeletingPostId] = useState<string | null>(null)
  const [isTogglingFollow, setIsTogglingFollow] = useState(false)
  const [reloadSeed, setReloadSeed] = useState(0)
  const [form, setForm] = useState<ProfileForm>({
    name: "",
    role: "",
    affiliation: "",
    location: "",
    bio: "",
    image: "",
  })
  const [isReadingImage, setIsReadingImage] = useState(false)
  const photoInputRef = useRef<HTMLInputElement>(null)

  const token = window.localStorage.getItem("proyecta-session-token")

  const isOwner = useMemo(() => {
    return !!sessionUser.id && sessionUser.id === profile.id
  }, [profile.id, sessionUser.id])

  const resolvedAffiliation =
    bibliometrics.primaryInstitution || productivity.primaryAffiliation || profile.affiliation || "No definida"

  const resolvedWorksCount = bibliometrics.worksCount ?? productivity.totalWorks ?? 0
  const visibleProfileImage = form.image || profile.image || ""
  const resolvedRole = resolveDisplayRole(profile)

  const profileInterests = useMemo(() => {
    const interestPool = [
      ...articles.map((article) => article.category),
      ...(productivity.keywords ?? []),
    ]

    const uniqueInterests = Array.from(
      new Map(
        interestPool
          .map((interest) => String(interest ?? "").trim())
          .filter(Boolean)
          .map((interest) => [normalizeText(interest), interest]),
      ).values(),
    )

    return uniqueInterests.slice(0, 8)
  }, [articles, productivity.keywords])

  const relatedArticles = useMemo(() => {
    if (!profile) {
      return { reviewed: [] as DiscoveryArticle[], open: [] as DiscoveryArticle[] }
    }

    const sortedByInterest = communityArticles
      .filter((article) => article.author.id !== profile.id)
      .map((article) => ({
        article,
        score: getArticleInterestScore(article, profileInterests),
      }))
      .sort((left, right) => {
        if (right.score !== left.score) return right.score - left.score
        return new Date(right.article.createdAt).getTime() - new Date(left.article.createdAt).getTime()
      })
      .map(({ article }) => article)

    return {
      reviewed: sortedByInterest.filter((article) => Number(article.metrics.peerScore ?? 0) > 0).slice(0, 4),
      open: sortedByInterest.filter((article) => Number(article.metrics.peerScore ?? 0) <= 0).slice(0, 4),
    }
  }, [communityArticles, profile, profileInterests])

  useEffect(() => {
    if (!profileId) {
      setLoading(false)
      return
    }

    const controller = new AbortController()

    async function loadProfile() {
      setLoading(true)
      try {
        const requestHeaders = token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : undefined

        const [profileResponse, postsResponse, activityResponse, communityResponse] = await Promise.all([
          fetch(`${apiBaseUrl}/api/users/${profileId}`, {
            signal: controller.signal,
            headers: requestHeaders,
          }),
          fetch(`${apiBaseUrl}/api/users/${profileId}/articles`, {
            signal: controller.signal,
            headers: requestHeaders,
          }),
          fetch(`${apiBaseUrl}/api/users/${profileId}/activity`, {
            signal: controller.signal,
            headers: requestHeaders,
          }),
          fetch(`${apiBaseUrl}/api/articles`, {
            signal: controller.signal,
            headers: requestHeaders,
          }),
        ])

        if (!profileResponse.ok) {
          throw new Error("No encontramos el perfil del investigador.")
        }

        const profileData = await profileResponse.json()
        const postsData = postsResponse.ok ? await postsResponse.json() : []
        const activityData = activityResponse.ok ? await activityResponse.json() : {}
        const communityData = communityResponse.ok ? await communityResponse.json() : []

        setProfile(profileData.user)
        setStats(profileData.stats ?? { posts: 0, comments: 0, votes: 0 })
        setProductivity(profileData.productivity ?? null)
        setBibliometrics(profileData.bibliometrics ?? null)
        setReputation(profileData.reputation ?? null)
        setProyectas(profileData.novas ?? null)
        setSocial(profileData.social ?? { followersCount: 0, followingCount: 0, isFollowing: false })
        setOrcidWorks(Array.isArray(profileData.orcidWorks) ? profileData.orcidWorks : [])
        setArticles(Array.isArray(postsData) ? postsData : [])
        setActivityReviews(Array.isArray(activityData.reviews) ? activityData.reviews : [])
        setActivityVotes(Array.isArray(activityData.votes) ? activityData.votes : [])
        setActivityComments(Array.isArray(activityData.comments) ? activityData.comments : [])
        setCommunityArticles(Array.isArray(communityData) ? communityData : [])
        setFollowers(Array.isArray(activityData.followers) ? activityData.followers : [])
        setFollowing(Array.isArray(activityData.following) ? activityData.following : [])
        setForm({
          name: profileData.user.name ?? "",
          role: profileData.user.role ?? "",
          affiliation: profileData.user.affiliation ?? "",
          location: profileData.user.location ?? "",
          bio: profileData.user.bio ?? "",
          image: profileData.user.image ?? "",
        })
      } catch (error) {
        if (!controller.signal.aborted) {
          const message = error instanceof Error ? error.message : "Error cargando perfil."
          toast.error(message)
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    void loadProfile()
    return () => controller.abort()
  }, [apiBaseUrl, profileId, reloadSeed, token])

  const handleLinkOrcid = async () => {
    if (!token) {
      toast.error("Necesitas iniciar sesión para vincular ORCID.")
      return
    }

    setIsSyncing(true)
    const toastId = toast.loading("Abriendo flujo ORCID...")

    try {
      const response = await fetch(`${apiBaseUrl}/api/oauth/orcid/link`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok || !data.url) {
        throw new Error(data.error ?? "No fue posible iniciar ORCID.")
      }

      toast.success("Redirigiendo a ORCID...", { id: toastId })
      window.location.href = data.url
    } catch (error) {
      const message = error instanceof Error ? error.message : "No fue posible iniciar ORCID."
      toast.error(message, { id: toastId })
      setIsSyncing(false)
    }
  }

  const handleSaveProfile = async () => {
    if (!token) {
      toast.error("Necesitas iniciar sesión para guardar cambios.")
      return
    }

    if (!form.name.trim()) {
      toast.error("El nombre del investigador es obligatorio.")
      return
    }

    setIsSaving(true)
    const toastId = toast.loading("Guardando perfil...")

    try {
      const response = await fetch(`${apiBaseUrl}/api/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error ?? "No fue posible guardar el perfil.")
      }

      setProfile(data.user)
      setForm({
        name: data.user.name ?? "",
        role: data.user.role ?? "",
        affiliation: data.user.affiliation ?? "",
        location: data.user.location ?? "",
        bio: data.user.bio ?? "",
        image: data.user.image ?? "",
      })
      await refreshUser()
      setIsEditing(false)
      toast.success("Perfil actualizado.", { id: toastId })
    } catch (error) {
      const message = error instanceof Error ? error.message : "No fue posible guardar el perfil."
      toast.error(message, { id: toastId })
    } finally {
      setIsSaving(false)
    }
  }

  const persistProfileImage = async (imageDataUrl: string) => {
    if (!token) {
      toast.error("Necesitas iniciar sesión para actualizar tu foto.")
      return
    }

    setIsUploadingAvatar(true)
    const toastId = toast.loading("Actualizando foto de perfil...")

    try {
      const response = await fetch(`${apiBaseUrl}/api/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name || profile.name || "",
          role: form.role || profile.role || "",
          affiliation: form.affiliation || profile.affiliation || "",
          location: form.location || profile.location || "",
          bio: form.bio || profile.bio || "",
          image: imageDataUrl,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error ?? "No fue posible actualizar la foto.")
      }

      setProfile(data.user)
      setForm((prev) => ({
        ...prev,
        name: data.user.name ?? prev.name,
        role: data.user.role ?? prev.role,
        affiliation: data.user.affiliation ?? prev.affiliation,
        location: data.user.location ?? prev.location,
        bio: data.user.bio ?? prev.bio,
        image: data.user.image ?? imageDataUrl,
      }))
      await refreshUser()
      toast.success("Foto de perfil actualizada.", { id: toastId })
    } catch (error) {
      const message = error instanceof Error ? error.message : "No fue posible actualizar la foto."
      toast.error(message, { id: toastId })
      setForm((prev) => ({
        ...prev,
        image: profile.image ?? prev.image,
      }))
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  const handleProfileImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Selecciona una imagen válida para tu perfil.")
      return
    }

    if (file.size > 1_500_000) {
      toast.error("La foto debe pesar menos de 1.5 MB.")
      return
    }

    setIsReadingImage(true)

    try {
      const imageDataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(String(reader.result ?? ""))
        reader.onerror = () => reject(new Error("No fue posible leer la imagen seleccionada."))
        reader.readAsDataURL(file)
      })

      setForm((prev) => ({
        ...prev,
        image: imageDataUrl,
      }))
      await persistProfileImage(imageDataUrl)
    } catch (error) {
      const message = error instanceof Error ? error.message : "No fue posible cargar la imagen."
      toast.error(message)
    } finally {
      setIsReadingImage(false)
      if (photoInputRef.current) {
        photoInputRef.current.value = ""
      }
    }
  }

  const handleDeletePost = async (articleId: string) => {
    if (!token) {
      toast.error("Necesitas iniciar sesión para eliminar publicaciones.")
      return
    }

    const confirmed = window.confirm("¿Seguro que quieres eliminar esta publicación de Proyecta")
    if (!confirmed) {
      return
    }

    setIsDeletingPostId(articleId)
    const toastId = toast.loading("Eliminando publicación...")

    try {
      const response = await fetch(`${apiBaseUrl}/api/posts/${articleId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error ?? "No fue posible eliminar la publicación.")
      }

      toast.success("Publicación eliminada.", { id: toastId })
      setReloadSeed((value) => value + 1)
    } catch (error) {
      const message = error instanceof Error ? error.message : "No fue posible eliminar la publicación."
      toast.error(message, { id: toastId })
    } finally {
      setIsDeletingPostId(null)
    }
  }

  const handleToggleFollow = async () => {
    if (!token || !profile) {
      toast.error("Necesitas iniciar sesión para seguir perfiles.")
      return
    }

    setIsTogglingFollow(true)
    const toastId = toast.loading(social.isFollowing ? "Dejando de seguir..." : "Siguiendo perfil...")

    try {
      const response = await fetch(`${apiBaseUrl}/api/users/${profile.id}/follow`, {
        method: social.isFollowing ? "DELETE" : "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error ?? "No fue posible actualizar el seguimiento.")
      }

      setSocial((prev) => ({
        ...prev,
        isFollowing: Boolean(data.following),
        followersCount: Number(data.followersCount ?? prev.followersCount),
        followingCount: Number(data.followingCount ?? prev.followingCount),
      }))
      toast.success(social.isFollowing ? "Ya no sigues este perfil." : "Ahora sigues este perfil.", { id: toastId })
      setReloadSeed((value) => value + 1)
    } catch (error) {
      const message = error instanceof Error ? error.message : "No fue posible actualizar el seguimiento."
      toast.error(message, { id: toastId })
    } finally {
      setIsTogglingFollow(false)
    }
  }

  if (loading) {
    return (
      <div className="nova-card mx-auto mt-8 max-w-2xl p-8 text-center">
        <p className="nova-eyebrow">Perfil</p>
        <h1 className="nova-title mt-3 text-3xl font-extrabold text-slate-900">Cargando perfil...</h1>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="nova-card mx-auto mt-8 max-w-2xl p-8 text-center">
        <p className="nova-eyebrow">Perfil</p>
        <h1 className="nova-title mt-3 text-3xl font-extrabold text-slate-900">Perfil no disponible</h1>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <input
        ref={photoInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleProfileImageChange}
      />

      <section className="nova-shell overflow-hidden">
        <div className="h-52 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.22),transparent_28%),linear-gradient(135deg,#17306c,#255cff_55%,#6d7cff)] p-6 md:p-8">
          <div className="flex flex-wrap justify-end gap-3">
            {isOwner ? (
              <>
                <button
                  onClick={() => setIsEditing((value) => !value)}
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15"
                >
                  <PencilLine size={16} />
                  {isEditing ? "Cerrar edición" : "Personalizar perfil"}
                </button>
                <button
                  onClick={handleLinkOrcid}
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15 disabled:opacity-60"
                  disabled={isSyncing}
                >
                  <RefreshCw size={16} className={isSyncing ? "animate-spin" : ""} />
                  {profile.orcidId ? "Sincronizar datos desde ORCID" : "Sincronizar ORCID opcional"}
                </button>
              </>
            ) : profile ? (
              <button
                onClick={handleToggleFollow}
                disabled={isTogglingFollow}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15 disabled:opacity-60"
              >
                {social.isFollowing ? <UserCheck size={16} /> : <UserPlus size={16} />}
                {social.isFollowing ? "Siguiendo" : "Seguir perfil"}
              </button>
            ) : null}
          </div>
        </div>

        <div className="px-6 pb-8 md:px-8">
          <div className="relative -mt-20 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex flex-col gap-6 md:flex-row md:items-end">
              <div className="relative">
                <img
                  src={visibleProfileImage}
                  alt={profile.name}
                  className="h-36 w-36 rounded-[32px] border-[10px] border-white object-cover shadow-2xl"
                />
                {isOwner ? (
                  <button
                    type="button"
                    onClick={() => photoInputRef.current.click()}
                    disabled={isReadingImage || isUploadingAvatar}
                    className="absolute bottom-2 right-2 inline-flex items-center gap-2 rounded-full bg-slate-950/82 px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] text-white shadow-lg transition hover:bg-slate-900 disabled:opacity-60"
                  >
                    <Camera size={14} />
                    {isReadingImage || isUploadingAvatar ? "Subiendo..." : "Cambiar foto"}
                  </button>
                ) : null}
              </div>
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="nova-title text-4xl font-extrabold text-slate-900">{profile.name}</h1>
                  {profile.orcidId ? (
                    <span className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
                      <BadgeCheck size={14} />
                      ORCID {profile.orcidId}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2 rounded-full border border-amber-100 bg-amber-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-amber-700">
                      <AlertCircle size={14} />
                      Perfil editable sin ORCID
                    </span>
                  )}
                  <span className="inline-flex items-center gap-2 rounded-full border border-fuchsia-100 bg-fuchsia-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-fuchsia-700">
                    <Coins size={14} />
                    CRÉDITOS {novas.total ?? profile.novasBalance ?? 0}
                  </span>
                  {isOwner ? (
                    <button
                      onClick={handleLinkOrcid}
                      disabled={isSyncing}
                      className="inline-flex items-center gap-2 rounded-full bg-fuchsia-600 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white shadow-lg shadow-fuchsia-600/20 transition hover:-translate-y-px hover:bg-fuchsia-700 disabled:opacity-60"
                    >
                      {isSyncing ? <RefreshCw size={14} className="animate-spin" /> : <Link2 size={14} />}
                      {profile.orcidId ? "Sincronizar ORCID" : "Vincular con ORCID"}
                    </button>
                  ) : null}
                </div>

                <p className="text-slate-600">{resolvedRole} · {profile.affiliation}</p>
                <p className="max-w-3xl text-base leading-8 text-slate-600">
                  {profile.bio || "Aquí puedes describir al investigador con tus propios datos."}
                </p>
                {isOwner ? (
                  <p className="text-sm font-medium text-slate-500">
                    Tu foto se actualiza desde el avatar. Haz clic en <span className="font-semibold text-slate-700">Cambiar foto</span>.
                  </p>
                ) : null}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[28px] bg-slate-900 px-7 py-5 text-white shadow-2xl shadow-slate-900/15">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/60">Reputacion</p>
                <p className="nova-title mt-2 text-4xl font-extrabold">{profile.reputation}</p>
              </div>
              <div className="rounded-[28px] bg-[linear-gradient(135deg,#17306c,#255cff)] px-7 py-5 text-white shadow-2xl shadow-fuchsia-600/20">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/70">CRÉDITOS Fase 1</p>
                    <p className="nova-title mt-2 text-4xl font-extrabold">{novas.total ?? profile.novasBalance ?? 0}</p>
                    <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/70">Base-ready</p>
                  </div>
                  <ProyectaTokenSeal size={64} tone="light" showLabel={false} />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
            <section className="space-y-6">
              {isEditing && isOwner ? (
                <div className="nova-card p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="nova-eyebrow">Edicion</p>
                      <h2 className="nova-title mt-2 text-2xl font-extrabold text-slate-900">
                        Personaliza tu perfil de investigador
                      </h2>
                    </div>
                    <button
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                      className="nova-button-solid px-4 py-2.5 disabled:opacity-60"
                    >
                      <Save size={16} />
                      Guardar
                    </button>
                  </div>

                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-5 md:col-span-2">
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-4">
                          <img
                            src={form.image || profile.image}
                            alt={form.name || profile.name}
                            className="h-20 w-20 rounded-[24px] object-cover shadow-md"
                          />
                          <div>
                            <p className="text-sm font-bold text-slate-900">Foto de perfil</p>
                            <p className="mt-1 text-sm leading-6 text-slate-500">
                              Una imagen clara ayuda a que tu identidad se sienta más cercana y reconocible en la comunidad.
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-3">
                          <button
                            type="button"
                            onClick={() => photoInputRef.current.click()}
                            disabled={isReadingImage || isUploadingAvatar}
                            className="nova-button-soft px-4 py-2.5 disabled:opacity-60"
                          >
                            <Camera size={16} />
                            {isReadingImage || isUploadingAvatar ? "Subiendo foto..." : "Subir foto"}
                          </button>
                        </div>
                      </div>
                    </div>
                    <label className="block">
                      <span className="mb-2 block text-sm font-semibold text-slate-600">Nombre</span>
                      <input
                        value={form.name}
                        onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                        className="nova-field"
                      />
                    </label>
                    <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4">
                      <span className="mb-2 block text-sm font-semibold text-slate-600">Título visible</span>
                      <p className="font-semibold text-slate-900">{resolvedRole}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        Este título se ajusta automáticamente. Con perfil local aparece como divulgador/a y, al vincular ORCID, como divulgador/a científico/a.
                      </p>
                    </div>
                    <label className="block">
                      <span className="mb-2 block text-sm font-semibold text-slate-600">Afiliacion</span>
                      <input
                        value={form.affiliation}
                        onChange={(event) => setForm((prev) => ({ ...prev, affiliation: event.target.value }))}
                        className="nova-field"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-sm font-semibold text-slate-600">Ubicacion</span>
                      <input
                        value={form.location}
                        onChange={(event) => setForm((prev) => ({ ...prev, location: event.target.value }))}
                        className="nova-field"
                      />
                    </label>
                    <label className="block md:col-span-2">
                      <span className="mb-2 block text-sm font-semibold text-slate-600">Bio</span>
                      <textarea
                        value={form.bio}
                        onChange={(event) => setForm((prev) => ({ ...prev, bio: event.target.value }))}
                        className="nova-field min-h-[140px]"
                      />
                    </label>
                  </div>
                </div>
              ) : null}

              <div className="grid gap-4 md:grid-cols-3">
                <div className="nova-card-soft p-5 text-center">
                  <p className="nova-title text-3xl font-extrabold text-slate-900">{stats.posts}</p>
                  <p className="mt-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Posts Proyecta</p>
                </div>
                <div className="nova-card-soft p-5 text-center">
                  <p className="nova-title text-3xl font-extrabold text-slate-900">{resolvedWorksCount}</p>
                  <p className="mt-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Artículos / obras</p>
                </div>
                <div className="nova-card-soft p-5 text-center">
                  <p className="nova-title text-3xl font-extrabold text-slate-900">
                    {bibliometrics ? bibliometrics.citedByCount : (productivity.recentWorks ?? 0)}
                  </p>
                  <p className="mt-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                    {bibliometrics ? "Citas totales" : "Ultimos 5 anos"}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <a href="#followers-list" className="nova-card-soft block p-5 text-center transition hover:-translate-y-0.5">
                  <p className="nova-title text-3xl font-extrabold text-slate-900">{social.followersCount}</p>
                  <p className="mt-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Seguidores</p>
                </a>
                <a href="#following-list" className="nova-card-soft block p-5 text-center transition hover:-translate-y-0.5">
                  <p className="nova-title text-3xl font-extrabold text-slate-900">{social.followingCount}</p>
                  <p className="mt-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Seguidos</p>
                </a>
              </div>

              {profile.orcidId ? (
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="nova-card-soft p-5 text-center">
                    <p className="nova-title text-3xl font-extrabold text-slate-900">{bibliometrics.hIndex ?? 0}</p>
                    <p className="mt-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">H-index</p>
                  </div>
                  <div className="nova-card-soft p-5 text-center">
                    <p className="nova-title text-3xl font-extrabold text-slate-900">{bibliometrics.i10Index ?? 0}</p>
                    <p className="mt-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">i10-index</p>
                  </div>
                  <div className="nova-card-soft p-5 text-center">
                    <p className="nova-title text-3xl font-extrabold text-slate-900">{productivity.recentWorks ?? 0}</p>
                    <p className="mt-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Ultimos 5 anos</p>
                  </div>
                </div>
              ) : null}

              <div className="nova-card p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-2">
                    <p className="nova-eyebrow">Lecturas afines a tu perfil</p>
                    <h2 className="nova-title text-2xl font-extrabold text-slate-900">
                      Artículos para leer con contexto o revisar primero
                    </h2>
                    <p className="max-w-3xl text-sm leading-7 text-slate-600">
                      Proyecta cruza las áreas que ya publicas y, si existe, la productividad sincronizada desde ORCID para sugerirte artículos cercanos a tus intereses.
                    </p>
                  </div>
                  <div className="flex max-w-xl flex-wrap gap-2">
                    {profileInterests.length > 0 ? (
                      profileInterests.map((interest) => (
                        <span
                          key={interest}
                          className="rounded-full border border-fuchsia-100 bg-fuchsia-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-fuchsia-700"
                        >
                          {interest}
                        </span>
                      ))
                    ) : (
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                        Tus intereses crecerï¿½n con tus publicaciones y sincronizaciones
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-6 grid gap-5 xl:grid-cols-2">
                  <section className="rounded-[28px] border border-emerald-100 bg-emerald-50/55 p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
                          Ya revisadas
                        </p>
                        <h3 className="mt-2 text-xl font-extrabold text-slate-900">
                          Para leer con más contexto
                        </h3>
                      </div>
                      <span className="rounded-full border border-emerald-200 bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
                        {relatedArticles.reviewed.length} artículos
                      </span>
                    </div>

                    <div className="mt-5 space-y-4">
                      {relatedArticles.reviewed.length > 0 ? (
                        relatedArticles.reviewed.map((article) => (
                          <article key={article.id} className="rounded-[24px] bg-white/90 p-4 shadow-sm">
                            <div className="flex gap-4">
                              {article.figureImage ? (
                                <img
                                  src={article.figureImage}
                                  alt={article.title}
                                  className="h-24 w-24 rounded-[20px] object-cover"
                                />
                              ) : null}
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700">
                                    {article.category}
                                  </span>
                                  <span>{formatTimeAgo(article.createdAt)}</span>
                                  <span>{article.readTime}</span>
                                </div>
                                <Link
                                  to={`/article/${article.id}`}
                                  className="mt-3 block text-lg font-bold leading-7 text-slate-900 transition hover:text-fuchsia-600"
                                >
                                  {article.title}
                                </Link>
                                <p className="mt-2 text-sm leading-7 text-slate-600">{article.excerpt}</p>
                                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                                  <Link
                                    to={`/profile/${article.author.id}`}
                                    className="font-semibold text-slate-700 transition hover:text-fuchsia-600"
                                  >
                                    {article.author.name}
                                  </Link>
                                  <span>{article.metrics.peerScore.toFixed(1)}/5</span>
                                  <span>{article.metrics.comments} comentarios</span>
                                </div>
                              </div>
                            </div>
                          </article>
                        ))
                      ) : (
                        <div className="rounded-[24px] bg-white/90 p-5 text-sm leading-7 text-slate-600">
                          Aï¿½n no encontramos lecturas revisadas claramente alineadas con tu perfil. Esto se irï¿½ afinando conforme publiques y sigas ampliando tu trayectoria.
                        </div>
                      )}
                    </div>
                  </section>

                  <section className="rounded-[28px] border border-amber-100 bg-amber-50/55 p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-700">
                          Por revisar
                        </p>
                        <h3 className="mt-2 text-xl font-extrabold text-slate-900">
                          Para aportar una primera lectura
                        </h3>
                      </div>
                      <span className="rounded-full border border-amber-200 bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-amber-700">
                        {relatedArticles.open.length} artículos
                      </span>
                    </div>

                    <div className="mt-5 space-y-4">
                      {relatedArticles.open.length > 0 ? (
                        relatedArticles.open.map((article) => (
                          <article key={article.id} className="rounded-[24px] bg-white/90 p-4 shadow-sm">
                            <div className="flex gap-4">
                              {article.figureImage ? (
                                <img
                                  src={article.figureImage}
                                  alt={article.title}
                                  className="h-24 w-24 rounded-[20px] object-cover"
                                />
                              ) : null}
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                                  <span className="rounded-full bg-amber-50 px-2.5 py-1 text-amber-700">
                                    {article.category}
                                  </span>
                                  <span>{formatTimeAgo(article.createdAt)}</span>
                                  <span>{article.readTime}</span>
                                </div>
                                <Link
                                  to={`/article/${article.id}`}
                                  className="mt-3 block text-lg font-bold leading-7 text-slate-900 transition hover:text-fuchsia-600"
                                >
                                  {article.title}
                                </Link>
                                <p className="mt-2 text-sm leading-7 text-slate-600">{article.excerpt}</p>
                                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                                  <Link
                                    to={`/profile/${article.author.id}`}
                                    className="font-semibold text-slate-700 transition hover:text-fuchsia-600"
                                  >
                                    {article.author.name}
                                  </Link>
                                  <span>{article.metrics.votes} votos</span>
                                  <span>{article.metrics.comments} comentarios</span>
                                </div>
                              </div>
                            </div>
                          </article>
                        ))
                      ) : (
                        <div className="rounded-[24px] bg-white/90 p-5 text-sm leading-7 text-slate-600">
                          En este momento no hay artículos abiertos a revisión especialmente relacionados con tus intereses.
                        </div>
                      )}
                    </div>
                  </section>
                </div>
              </div>

              <div className="nova-card p-6">
                <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                  Publicaciones de Proyecta
                </h2>
                <div className="mt-6 space-y-4">
                  {articles.length > 0 ? (
                    articles.map((article) => (
                      <article key={article.id} className="rounded-[24px] bg-slate-50/80 p-5 transition hover:bg-slate-100/80">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <p className="text-xs font-bold uppercase tracking-[0.18em] text-fuchsia-600">{article.category}</p>
                          {isOwner ? (
                            <div className="flex flex-wrap gap-2">
                              <button
                                onClick={() => navigate(`/editor/${article.id}`)}
                                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-slate-600 transition hover:border-fuchsia-200 hover:text-fuchsia-600"
                              >
                                <SquarePen size={14} />
                                Editar
                              </button>
                              <button
                                onClick={() => handleDeletePost(article.id)}
                                disabled={isDeletingPostId === article.id}
                                className="inline-flex items-center gap-2 rounded-full border border-rose-100 bg-rose-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-rose-700 transition hover:bg-rose-100 disabled:opacity-60"
                              >
                                <Trash2 size={14} />
                                Eliminar
                              </button>
                            </div>
                          ) : null}
                        </div>
                        <Link to={`/article/${article.id}`}>
                          <h3 className="nova-title mt-3 text-2xl font-extrabold text-slate-900 hover:text-fuchsia-700 transition-colors">{article.title}</h3>
                        </Link>
                        <p className="mt-3 text-sm leading-7 text-slate-600">{article.excerpt}</p>
                        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                          <span>{formatPublishedLabel(article.createdAt)}</span>
                          <span>·</span>
                          <span>{article.readTime}</span>
                          <Link
                            to={`/article/${article.id}`}
                            className="ml-auto text-fuchsia-600 hover:text-fuchsia-700 normal-case tracking-normal font-semibold"
                          >
                            Leer artículo â†’
                          </Link>
                        </div>
                      </article>
                    ))
                  ) : (
                    <div className="rounded-[24px] bg-slate-50/80 p-5">
                      <p className="text-sm leading-7 text-slate-600">
                        Todavía no hay publicaciones. Cuando publiques tu primera entrada, aparecer aqu.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {profile.orcidId ? (
                <div className="nova-card p-6">
                  <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                    Productividad sincronizada desde ORCID
                  </h2>
                  <div className="mt-6 space-y-4">
                    {orcidWorks.length > 0 ? (
                      orcidWorks.slice(0, 8).map((work) => (
                        <article key={`${work.title}-${work.year ?? "na"}`} className="rounded-[24px] bg-slate-50/80 p-5">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="space-y-2">
                              <h3 className="font-bold text-slate-900">{work.title}</h3>
                              <p className="text-sm text-slate-500">
                                {work.journal}{work.year ? ` ? ${work.year}` : ""}
                              </p>
                              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                                {work.type}
                              </p>
                            </div>
                            {work.url ? (
                              <a
                                href={work.url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 text-sm font-semibold text-fuchsia-600"
                              >
                                <ExternalLink size={14} />
                                Abrir
                              </a>
                            ) : null}
                          </div>
                        </article>
                      ))
                    ) : (
                      <div className="rounded-[24px] bg-slate-50/80 p-5">
                        <p className="text-sm leading-7 text-slate-600">
                          ORCID esta vinculado, pero no encontramos obras publicas visibles por ahora.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : null}

              <div className="grid gap-6 xl:grid-cols-2">
                <div className="nova-card p-6">
                  <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                    <MessageSquare size={16} className="text-fuchsia-500" />
                    Revisiones realizadas
                  </h2>
                  <div className="mt-6 space-y-4">
                    {activityReviews.length > 0 ? (
                      activityReviews.map((review) => (
                        <article key={review.id} className="rounded-[24px] bg-slate-50/80 p-5">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                              {formatPublishedLabel(review.createdAt)}
                            </p>
                            <p className="text-sm font-bold text-fuchsia-600">{review.rating}/5</p>
                          </div>
                          <h3 className="mt-3 font-bold text-slate-900">
                            {review.article.title ? review.article.title : "Publicación no disponible"}
                          </h3>
                          <p className="mt-2 text-sm leading-7 text-slate-600">
                            {review.comment || "Revisión sin comentario adicional."}
                          </p>
                        </article>
                      ))
                    ) : (
                      <div className="rounded-[24px] bg-slate-50/80 p-5 text-sm leading-7 text-slate-600">
                        Aún no has dejado revisiónes. Cuando evalúes artículos, aparecerán aquí.
                      </div>
                    )}
                  </div>
                </div>

                <div className="nova-card p-6">
                  <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                    <ThumbsUp size={16} className="text-fuchsia-500" />
                    Votos y apoyos realizados
                  </h2>
                  <div className="mt-6 space-y-4">
                    {activityVotes.length > 0 ? (
                      activityVotes.map((vote) => (
                        <article key={vote.id} className="rounded-[24px] bg-slate-50/80 p-5">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                              {formatPublishedLabel(vote.createdAt)}
                            </p>
                            <p className={`text-sm font-bold ${vote.value > 0 ? "text-emerald-600" : "text-rose-600"}`}>
                              {vote.value > 0 ? "Upvote" : "Voto critico"}
                            </p>
                          </div>
                          <h3 className="mt-3 font-bold text-slate-900">
                            {vote.article.title ? vote.article.title : "Publicación no disponible"}
                          </h3>
                          <p className="mt-2 text-sm leading-7 text-slate-600">
                            {vote.article.excerpt ? vote.article.excerpt : "La publicación asociada ya no esta disponible."}
                          </p>
                        </article>
                      ))
                    ) : (
                      <div className="rounded-[24px] bg-slate-50/80 p-5 text-sm leading-7 text-slate-600">
                        Aï¿½n no has votado publicaciones. Tus apoyos y votos aparecerï¿½n aquï¿½.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="nova-card p-6">
                <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                  <MessageSquare size={16} className="text-fuchsia-500" />
                  Comentarios científicos realizados
                </h2>
                <div className="mt-6 space-y-4">
                  {activityComments.length > 0 ? (
                    activityComments.map((comment) => (
                      <article key={comment.id} className="rounded-[24px] bg-slate-50/80 p-5">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                          {formatPublishedLabel(comment.createdAt)}
                        </p>
                        <h3 className="mt-3 font-bold text-slate-900">
                          {comment.article.title ? comment.article.title : "Publicación no disponible"}
                        </h3>
                        <p className="mt-2 text-sm leading-7 text-slate-600">{comment.comment}</p>
                      </article>
                    ))
                  ) : (
                    <div className="rounded-[24px] bg-slate-50/80 p-5 text-sm leading-7 text-slate-600">
                      Aï¿½n no has comentado publicaciones. Tus aportes a la conversación aparecerán aquí.
                    </div>
                  )}
                </div>
              </div>
            </section>

            <aside className="space-y-6">
              <section className="nova-card p-6">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                    <ProyectaMark size={22} glow={false} />
                    CRÉDITOS
                  </h2>
                  <ProyectaTokenSeal size={60} showLabel={false} />
                </div>
                <div className="mt-5 space-y-3">
                  <div className="rounded-[20px] bg-slate-50/80 p-4 text-sm leading-7 text-slate-600">
                    CRÉDITOS funciona hoy como incentivo interno verificable. La ruta futura elegida para migración on-chain es Base.
                  </div>
                  <div className="flex items-center justify-between rounded-[20px] bg-slate-50/80 p-4 text-sm">
                    <span className="text-slate-600">Saldo actual</span>
                    <span className="font-semibold text-slate-900">{novas.total ?? profile.novasBalance ?? 0}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-[20px] bg-slate-50/80 p-4 text-sm">
                    <span className="text-slate-600">Publicaciones</span>
                    <span className="font-semibold text-slate-900">{novas.publications ?? 0}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-[20px] bg-slate-50/80 p-4 text-sm">
                    <span className="text-slate-600">Revisiones</span>
                    <span className="font-semibold text-slate-900">{novas.reviews ?? 0}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-[20px] bg-slate-50/80 p-4 text-sm">
                    <span className="text-slate-600">Comentarios</span>
                    <span className="font-semibold text-slate-900">{novas.comments ?? 0}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-[20px] bg-slate-50/80 p-4 text-sm">
                    <span className="text-slate-600">Bonus por calidad</span>
                    <span className="font-semibold text-slate-900">{novas.qualityBonus ?? 0}</span>
                  </div>
                  <div className="rounded-[20px] border border-fuchsia-100 bg-fuchsia-50/80 p-4 text-sm leading-7 text-fuchsia-800">
                    Regla actual: +{novas.policy.publicationReward ?? 25} por publicar, +{novas.policy.reviewReward ?? 15} por revisar, +{novas.policy.commentReward ?? 5} por comentar y +{novas.policy.positiveVoteBonus ?? 2} por cada voto positivo recibido.
                  </div>
                </div>
              </section>

              <section className="nova-card p-6">
                <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                  <BarChart2 size={16} className="text-fuchsia-500" />
                  Resumen del investigador
                </h2>
                <div className="mt-5 space-y-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">ID de usuario</span>
                    <span className="font-semibold text-slate-900">{profile.id}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Ubicacion</span>
                    <span className="font-semibold text-slate-900">{profile.location || "No definida"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Afiliacion</span>
                    <span className="font-semibold text-slate-900">{resolvedAffiliation}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Email</span>
                    <span className="font-semibold text-slate-900">{profile.email || "Oculto"}</span>
                  </div>
                  {profile.orcidId ? (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Obras sincronizadas</span>
                        <span className="font-semibold text-slate-900">{resolvedWorksCount}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Citas totales</span>
                        <span className="font-semibold text-slate-900">{bibliometrics.citedByCount ?? 0}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">H-index</span>
                        <span className="font-semibold text-slate-900">{bibliometrics.hIndex ?? 0}</span>
                      </div>
                    </>
                  ) : null}
                </div>
              </section>

              <section className="nova-card p-6">
                <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Como se construye la reputaciï¿½n</h2>
                <div className="mt-5 space-y-3">
                  <div className="rounded-[20px] bg-slate-50/80 p-4 text-sm leading-7 text-slate-600">
                    La reputaciï¿½n busca equilibrio entre publicar, revisar y comentar. No depende de una sola acciï¿½n.
                  </div>
                  <div className="flex items-center justify-between rounded-[20px] bg-slate-50/80 p-4 text-sm">
                    <span className="text-slate-600">Publicaciones y votos recibidos</span>
                    <span className="font-semibold text-slate-900">{reputation.publications ?? 0}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-[20px] bg-slate-50/80 p-4 text-sm">
                    <span className="text-slate-600">Revisiones realizadas</span>
                    <span className="font-semibold text-slate-900">{reputation.reviews ?? 0}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-[20px] bg-slate-50/80 p-4 text-sm">
                    <span className="text-slate-600">Comentarios científicos</span>
                    <span className="font-semibold text-slate-900">{reputation.comments ?? 0}</span>
                  </div>
                  <div className="rounded-[20px] border border-fuchsia-100 bg-fuchsia-50/80 p-4 text-sm leading-7 text-fuchsia-800">
                    Regla actual: +{reputation.policy.publicationBase ?? 10} por publicación, +{reputation.policy.voteBonus ?? 1} por voto positivo recibido, +{reputation.policy.reviewBase ?? 7} por revisión y +{reputation.policy.commentBase ?? 3} por comentario.
                  </div>
                </div>
              </section>

              <section className="nova-card p-6">
                <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Sincronizacion ORCID</h2>
                <div className="mt-4 space-y-3">
                  {profile.orcidId ? (
                    <>
                      <div className="flex gap-3 rounded-[22px] bg-emerald-50/80 p-4">
                        <ShieldCheck size={18} className="mt-1 shrink-0 text-emerald-600" />
                        <p className="text-sm leading-7 text-emerald-800">
                          Tu cuenta local sigue siendo la principal. ORCID solo complementa tu perfil con productividad científica.
                        </p>
                      </div>
                      <a
                        href={`https://orcid.org/${profile.orcidId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-fuchsia-600"
                      >
                        <ExternalLink size={16} />
                        Abrir ORCID pï¿½blico
                      </a>
                      {bibliometrics.openAlexId ? (
                        <a
                          href={bibliometrics.openAlexId}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 text-sm font-semibold text-fuchsia-600"
                        >
                          <ExternalLink size={16} />
                          Abrir perfil OpenAlex
                        </a>
                      ) : null}
                    </>
                  ) : (
                    <div className="flex gap-3 rounded-[22px] bg-slate-50/80 p-4">
                      <UserRound size={18} className="mt-1 shrink-0 text-slate-500" />
                      <p className="text-sm leading-7 text-slate-600">
                        Puedes usar este perfil sin ORCID. Si quieres, luego sincronizas datos científicos desde ORCID.
                      </p>
                    </div>
                  )}
                </div>
              </section>

              <section className="nova-card p-6">
                <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                  <Users size={16} className="text-fuchsia-500" />
                  Red científica
                </h2>
                <div className="mt-5 space-y-5">
                  <div id="followers-list">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Seguidores</p>
                    <div className="mt-3 space-y-3">
                      {followers.length > 0 ? (
                        followers.slice(0, 4).map((person) => (
                          <Link
                            key={person.id}
                            to={`/profile/${person.id}`}
                            className="flex items-center gap-3 rounded-[20px] bg-slate-50/80 p-3 transition hover:bg-slate-100"
                          >
                            <img src={person.image} alt={person.name} className="h-11 w-11 rounded-2xl object-cover" />
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-slate-900">{person.name}</p>
                              <p className="truncate text-sm text-slate-500">{person.affiliation}</p>
                            </div>
                          </Link>
                        ))
                      ) : (
                        <p className="rounded-[20px] bg-slate-50/80 p-3 text-sm leading-7 text-slate-600">
                          Aï¿½n no hay seguidores visibles en este perfil.
                        </p>
                      )}
                    </div>
                  </div>

                  <div id="following-list">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Seguidos</p>
                    <div className="mt-3 space-y-3">
                      {following.length > 0 ? (
                        following.slice(0, 4).map((person) => (
                          <Link
                            key={person.id}
                            to={`/profile/${person.id}`}
                            className="flex items-center gap-3 rounded-[20px] bg-slate-50/80 p-3 transition hover:bg-slate-100"
                          >
                            <img src={person.image} alt={person.name} className="h-11 w-11 rounded-2xl object-cover" />
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-slate-900">{person.name}</p>
                              <p className="truncate text-sm text-slate-500">{person.affiliation}</p>
                            </div>
                          </Link>
                        ))
                      ) : (
                        <p className="rounded-[20px] bg-slate-50/80 p-3 text-sm leading-7 text-slate-600">
                          Este perfil todav?a no sigue a otros investigadores.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </section>

              <section className="nova-card p-6">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Especialidad</p>
                <div className="mt-4 space-y-3">
                  <div className="flex gap-3 rounded-[22px] bg-slate-50/80 p-4">
                    <FileText size={18} className="mt-1 shrink-0 text-fuchsia-500" />
                    <p className="text-sm leading-7 text-slate-600">
                      Tu identidad de investigador se define primero por tu perfil editable y luego, si quieres, por los datos sincronizados desde ORCID.
                    </p>
                  </div>
                </div>
              </section>
            </aside>
          </div>
        </div>
      </section>
    </div>
  )
}

