import cors from "cors"
import dotenv from "dotenv"
import express from "express"
import fetch from "node-fetch"
import nodemailer from "nodemailer"
import fs from "fs/promises"
import path from "path"
import { fileURLToPath } from "url"
import { createHash, randomBytes, randomUUID, scryptSync, timingSafeEqual } from "crypto"

dotenv.config()

const app = express()
const PORT = Number(process.env.PORT  3000)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const dataDir = path.join(__dirname, "data")
const storePath = path.join(dataDir, "store.json")
const FRONTEND_URL = process.env.FRONTEND_URL  "http://localhost:5173"
const PASSWORD_RESET_BASE_URL =
  process.env.PASSWORD_RESET_BASE_URL  process.env.PUBLIC_APP_URL  FRONTEND_URL
const PASSWORD_RESET_TTL_MINUTES = Number(process.env.PASSWORD_RESET_TTL_MINUTES  60)
const ORCID_BASE_URL = process.env.ORCID_BASE_URL  "https://orcid.org"
const ORCID_API_BASE_URL = process.env.ORCID_API_BASE_URL  "https://pub.orcid.org"
const OPENALEX_API_BASE_URL = process.env.OPENALEX_API_BASE_URL  "https://api.openalex.org"
const oauthStates = new Map()
const SMTP_HOST = process.env.SMTP_HOST  ""
const SMTP_PORT = Number(process.env.SMTP_PORT  587)
const SMTP_SECURE = String(process.env.SMTP_SECURE  "").toLowerCase() === "true" || SMTP_PORT === 465
const SMTP_USER = process.env.SMTP_USER  ""
const SMTP_PASS = process.env.SMTP_PASS  ""
const SMTP_FROM = process.env.SMTP_FROM  ""
const SCIENCE_CATEGORIES = [
  "Biotecnologia",
  "Fisica Cuantica",
  "Ecologia",
  "Ciencias Sociales",
  "Inteligencia Artificial",
  "Medicina",
  "Ciencia Abierta",
  "Astronomia",
  "Quimica",
  "Matematicas",
  "Ingenieria",
  "Neurociencias",
  "Salud Publica",
  "Ciencias del Mar",
  "Educacion Cientifica",
  "Biologia",
  "Gentica",
  "Bioinformatica",
  "Farmacologia",
  "Nanociencia",
  "Ciencia de Materiales",
  "Geologia",
  "Geografia",
  "Ciencias Ambientales",
  "Agrociencias",
  "Veterinaria",
  "Epidemiologia",
  "Psicologia",
  "Antropologia",
  "Sociologia",
  "Economia",
  "Ciencia Politica",
  "Historia",
  "Filosofia",
  "Linguistica",
  "Arqueologia",
  "Humanidades Digitales",
  "Estudios de Genero",
  "Derecho y Sociedad",
]
const CATEGORY_FAMILIES = [
  "Ciencias de la Vida",
  "Ciencias Fisicas",
  "Ingenierias y Tecnologia",
  "Ciencias Sociales",
  "Humanidades",
  "Interdisciplina",
]
const PRIVACY_NOTICE_VERSION = "2026-04-21"
const EDITORIAL_TERMS_VERSION = "2026-04-21"
const allowedOrigins = new Set([
  "http://localhost:5173",
  "http://localhost:5174",
  FRONTEND_URL,
  "https://divulgaria.pages.dev",
])
const passwordResetMailer =
  SMTP_HOST && SMTP_FROM
     nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: SMTP_SECURE,
        auth: SMTP_USER  { user: SMTP_USER, pass: SMTP_PASS } : undefined,
      })
    : null

function isAllowedOrigin(origin) {
  if (!origin) return true
  if (allowedOrigins.has(origin)) return true
  return /^https:\/\/([a-z0-9-]+\.)(divulgaria|nova-scientia|nova-scietia|nova-scientia-3un)\.pages\.dev$/i.test(
    origin,
  )
}

app.use(
  cors({
    origin(origin, callback) {
      if (isAllowedOrigin(origin)) {
        return callback(null, true)
      }
      return callback(new Error("Origen no permitido por CORS"))
    },
    credentials: true,
  }),
)
app.use(express.json({ limit: "25mb" }))

const defaultStore = {
  users: [],
  sessions: [],
  passwordResets: [],
  posts: [],
  votes: [],
  reviews: [],
  comments: [],
  follows: [],
  categories: SCIENCE_CATEGORIES,
}

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex")
  const derived = scryptSync(password, salt, 64).toString("hex")
  return `scrypt$${salt}$${derived}`
}

function parseStoredPassword(password) {
  if (typeof password !== "string") {
    return null
  }

  if (password.startsWith("scrypt$")) {
    const [, salt, hash] = password.split("$")
    return salt && hash  { salt, hash } : null
  }

  if (password.startsWith("scrypt:")) {
    const [, salt, hash] = password.split(":")
    return salt && hash  { salt, hash } : null
  }

  return null
}

function isHashedPassword(password) {
  return !!parseStoredPassword(password)
}

function verifyPassword(storedPassword, candidatePassword) {
  if (!storedPassword || !candidatePassword) {
    return false
  }

  const parsed = parseStoredPassword(storedPassword)

  if (!parsed) {
    return storedPassword === candidatePassword
  }

  const candidateHash = scryptSync(candidatePassword, parsed.salt, 64).toString("hex")
  return timingSafeEqual(Buffer.from(parsed.hash, "hex"), Buffer.from(candidateHash, "hex"))
}

async function ensureStoreFile() {
  await fs.mkdir(dataDir, { recursive: true })

  try {
    await fs.access(storePath)
  } catch {
    await fs.writeFile(storePath, JSON.stringify(defaultStore, null, 2), "utf8")
  }
}

function parseStoreFileContent(file) {
  const raw = String(file  "").replace(/^\uFEFF/, "")

  try {
    return JSON.parse(raw)
  } catch (error) {
    const start = raw.search(/\S/)
    if (start < 0 || raw[start] !== "{") {
      throw error
    }

    let depth = 0
    let inString = false
    let escaped = false
    let end = -1

    for (let index = start; index < raw.length; index += 1) {
      const char = raw[index]

      if (inString) {
        if (escaped) {
          escaped = false
        } else if (char === "\\") {
          escaped = true
        } else if (char === '"') {
          inString = false
        }
        continue
      }

      if (char === '"') {
        inString = true
        continue
      }

      if (char === "{") {
        depth += 1
        continue
      }

      if (char === "}") {
        depth -= 1
        if (depth === 0) {
          end = index + 1
          break
        }
      }
    }

    if (end <= 0) {
      throw error
    }

    const candidate = raw.slice(start, end)
    const repaired = JSON.parse(candidate)
    const trailing = raw.slice(end).trim()
    if (trailing) {
      console.warn(
        `[store] Se detectaron ${trailing.length} caracteres extra al final de store.json; se ignoraran.`,
      )
    }
    return repaired
  }
}

async function readStore() {
  await ensureStoreFile()
  const file = await fs.readFile(storePath, "utf8")
  const parsed = parseStoreFileContent(file)
  const categories = safeArray(parsed.categories)
    .map((category) => String(category  "").replace(/Ling.*istica/i, "Linguistica"))
    .filter(Boolean)

  return {
    users: safeArray(parsed.users),
    sessions: safeArray(parsed.sessions),
    passwordResets: safeArray(parsed.passwordResets),
    posts: safeArray(parsed.posts),
    votes: safeArray(parsed.votes),
    reviews: safeArray(parsed.reviews),
    comments: safeArray(parsed.comments),
    follows: safeArray(parsed.follows),
    categories: categories.length  categories : SCIENCE_CATEGORIES,
  }
}

async function writeStore(data) {
  await fs.writeFile(storePath, JSON.stringify(data, null, 2), "utf8")
}

function normalizeSources(rawSources) {
  if (!Array.isArray(rawSources)) {
    return []
  }

  return rawSources
    .map((source) => ({
      title: String(source.title  "").trim(),
      publisher: String(source.publisher  "").trim(),
      url: String(source.url  "").trim(),
    }))
    .filter((source) => source.title && /^https:\/\//i.test(source.url))
    .slice(0, 6)
}

function createUserProfile(base = {}) {
  const name = base.name.trim() || "Investigador DivulgarÃ­a"
  return {
    id: base.id  `usr_${randomUUID().slice(0, 8)}`,
    name,
    email: base.email.trim().toLowerCase()  "",
    password: base.password  "",
    image:
      base.image 
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43ew=240&h=240&fit=crop&crop=faces",
    role: base.role  resolvePublicRole(base),
    affiliation: base.affiliation  "Comunidad DivulgarÃ­a",
    orcidId: base.orcidId  "",
    reputation: Number(base.reputation  0),
    bio: base.bio  "Perfil cientÃ­fico en crecimiento dentro de DivulgarÃ­a.",
    location: base.location  "LatAm",
    legalAcceptance: base.legalAcceptance  null,
    createdAt: base.createdAt  new Date().toISOString(),
  }
}

function resolvePublicRole(user) {
  return user.orcidId  "Divulgador/a cientÃ­fico/a" : "Divulgador/a"
}

function hashPasswordResetToken(token) {
  return createHash("sha256").update(token).digest("hex")
}

function isPasswordResetExpired(resetRequest) {
  const expiresAt = Number(new Date(resetRequest.expiresAt  0))
  if (!Number.isFinite(expiresAt)) {
    return true
  }

  return Date.now() > expiresAt
}

function purgePasswordResets(store) {
  store.passwordResets = safeArray(store.passwordResets).filter(
    (resetRequest) => !resetRequest.usedAt && !isPasswordResetExpired(resetRequest),
  )
}

function buildPasswordResetLink(token) {
  const base = PASSWORD_RESET_BASE_URL.replace(/\/+$/, "")
  return `${base}/restablecer-contraseñatoken=${encodeURIComponent(token)}`
}

function allowPasswordResetPreview(req) {
  const origin = String(req.headers.origin  "")

  if (String(process.env.ENABLE_PASSWORD_RESET_PREVIEW  "").toLowerCase() === "true") {
    return true
  }

  return /localhost:517[34]/i.test(origin)
}

async function sendPasswordResetEmail({ user, resetLink }) {
  if (!passwordResetMailer) {
    console.log(`[nova] Recuperacion solicitada para ${user.email}. Link temporal: ${resetLink}`)
    return {
      delivered: false,
      mode: "preview",
    }
  }

  const subject = "Recupera tu contraseña de DivulgarÃ­a"
  const text = [
    `Hola, ${user.name}.`,
    "",
    "Recibimos una solicitud para restablecer tu contraseña en DivulgarÃ­a.",
    "Si fuiste tu, abre el siguiente enlace:",
    resetLink,
    "",
    `Este enlace vence en ${PASSWORD_RESET_TTL_MINUTES} minutos.`,
    "Si no solicitaste este cambio, puedes ignorar este mensaje.",
  ].join("\n")

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#14213d;max-width:640px;margin:0 auto;padding:24px">
      <p style="font-size:14px;letter-spacing:0.18em;text-transform:uppercase;color:#3b82f6;font-weight:700;margin:0 0 16px">
        DivulgarÃ­a
      </p>
      <h1 style="font-size:28px;line-height:1.2;margin:0 0 16px">Recupera tu contraseña</h1>
      <p style="font-size:16px;margin:0 0 12px">Hola, ${user.name}.</p>
      <p style="font-size:16px;margin:0 0 18px">
        Recibimos una solicitud para restablecer tu contraseña en DivulgarÃ­a.
        Si fuiste tu, usa el siguiente boton.
      </p>
      <p style="margin:0 0 24px">
        <a href="${resetLink}" style="display:inline-block;background:#255cff;color:#ffffff;text-decoration:none;padding:14px 22px;border-radius:999px;font-weight:700">
          Restablecer contraseña
        </a>
      </p>
      <p style="font-size:14px;color:#52607a;margin:0 0 8px">
        Este enlace vence en ${PASSWORD_RESET_TTL_MINUTES} minutos.
      </p>
      <p style="font-size:14px;color:#52607a;margin:0">
        Si no solicitaste este cambio, puedes ignorar este mensaje.
      </p>
    </div>
  `

  await passwordResetMailer.sendMail({
    from: SMTP_FROM,
    to: user.email,
    subject,
    text,
    html,
  })

  return {
    delivered: true,
    mode: "smtp",
  }
}

function toPublicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
    role: resolvePublicRole(user),
    affiliation: user.affiliation,
    orcidId: user.orcidId,
    reputation: user.reputation,
    bio: user.bio,
    location: user.location,
  }
}

function getReputationBreakdown(store, userId) {
  const authoredPosts = store.posts.filter((post) => post.authorId === userId)
  const authoredReviews = store.reviews.filter((review) => review.userId === userId)
  const authoredComments = store.comments.filter((comment) => comment.userId === userId)
  const positiveVotesReceived = authoredPosts.reduce((sum, post) => sum + Math.max(0, Number(post.votes  0)), 0)

  const publications = authoredPosts.length * 10 + positiveVotesReceived
  const reviews = authoredReviews.length * 7
  const comments = authoredComments.length * 3
  const total = publications + reviews + comments

  return {
    total,
    publications,
    reviews,
    comments,
    policy: {
      publicationBase: 10,
      voteBonus: 1,
      reviewBase: 7,
      commentBase: 3,
    },
  }
}

function getDivulgarasBreakdown(store, userId) {
  const authoredPosts = store.posts.filter((post) => post.authorId === userId)
  const authoredReviews = store.reviews.filter((review) => review.userId === userId)
  const authoredComments = store.comments.filter((comment) => comment.userId === userId)
  const positiveVotesReceived = authoredPosts.reduce((sum, post) => sum + Math.max(0, Number(post.votes  0)), 0)

  const publications = authoredPosts.length * 25
  const reviews = authoredReviews.length * 15
  const comments = authoredComments.length * 5
  const qualityBonus = positiveVotesReceived * 2
  const total = publications + reviews + comments + qualityBonus

  return {
    total,
    publications,
    reviews,
    comments,
    qualityBonus,
    phase: "Fase 1",
    storage: "offchain",
    targetNetwork: "Base",
    status: "activo-interno",
    policy: {
      publicationReward: 25,
      reviewReward: 15,
      commentReward: 5,
      positiveVoteBonus: 2,
    },
  }
}

function toPublicUserWithStore(user, store) {
  const breakdown = getReputationBreakdown(store, user.id)
  const novas = getDivulgarasBreakdown(store, user.id)
  return {
    ...toPublicUser(user),
    reputation: breakdown.total,
    novasBalance: novas.total,
  }
}

function getTokenFromRequest(req) {
  const authorization = req.headers.authorization
  if (authorization.startsWith("Bearer ")) {
    return authorization.slice("Bearer ".length).trim()
  }

  const fromHeader = req.headers["x-session-token"]
  if (typeof fromHeader === "string") {
    return fromHeader.trim()
  }

  return null
}

function createSession(store, userId) {
  const token = randomUUID()
  store.sessions.push({
    token,
    userId,
    createdAt: new Date().toISOString(),
  })
  return token
}

async function getCurrentUser(req) {
  const token = getTokenFromRequest(req)
  if (!token) {
    return null
  }

  const store = await readStore()
  const session = store.sessions.find((item) => item.token === token)

  if (!session) {
    return null
  }

  const user = store.users.find((item) => item.id === session.userId)
  if (!user) {
    return null
  }

  return { token, user, store }
}

function mapPostToArticle(post, author, options = {}) {
  const {
    includeContentHtml = true,
    includeFigureImage = true,
    compactAuthor = false,
  } = options

  const article = {
    id: post.id,
    title: post.title,
    excerpt: post.excerpt,
    category: post.category || "General",
    createdAt: post.createdAt,
    figureCaption: post.figureCaption  "",
    sources: normalizeSources(post.sources),
    metrics: {
      votes: post.votes  0,
      comments: post.comments  0,
      peerScore: post.peerScore  0,
    },
    readTime: post.readTime  "3 min de lectura",
    author: {
      id: author.id  "usr_unknown",
      name: author.name  "Autor/a DivulgarÃ­a",
      image:
        author.image 
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330w=240&h=240&fit=crop",
      role: author  resolvePublicRole(author) : "Divulgador/a",
      affiliation: author.affiliation  "Comunidad DivulgarÃ­a",
      orcidId: author.orcidId  "",
      reputation: author.reputation  0,
    },
  }

  if (includeContentHtml) {
    article.contentHtml = post.contentHtml
  }

  if (includeFigureImage) {
    article.figureImage = post.figureImage  ""
  }

  if (!compactAuthor) {
    article.author = {
      ...article.author,
      bio: author.bio  "",
      location: author.location  "",
    }
  }

  return article
}

function mapPostToArticleWithStore(store, post, author, options = {}) {
  const article = mapPostToArticle(post, author, options)
  if (author) {
    article.author = {
      ...article.author,
      reputation: getReputationBreakdown(store, author.id).total,
    }
  }
  return article
}

function refreshPostMetrics(store, postId) {
  const post = store.posts.find((item) => item.id === postId)
  if (!post) {
    return null
  }

  const votes = store.votes.filter((item) => item.articleId === postId)
  const reviews = store.reviews.filter((item) => item.articleId === postId)
  const comments = store.comments.filter((item) => item.articleId === postId)
  const voteScore = votes.reduce((sum, item) => sum + Number(item.value  0), 0)
  const ratingTotal = reviews.reduce((sum, item) => sum + Number(item.rating  0), 0)

  post.votes = voteScore
  post.comments = reviews.length + comments.length
  post.peerScore = reviews.length  Number((ratingTotal / reviews.length).toFixed(1)) : 0

  return post
}

function normalizeReviewScore(value, fallback = 0) {
  const numeric = Number(value  fallback  0)
  if (!Number.isFinite(numeric)) {
    return 0
  }

  return Math.min(5, Math.max(0, numeric))
}

function inferRecommendationFromScore(score) {
  if (score >= 4.4) {
    return "Aprobar"
  }

  if (score >= 3.2) {
    return "Solicitar mejoras"
  }

  return "Abrir discusion"
}

function mapStoredReview(review, reviewer, store) {
  const clarity = normalizeReviewScore(review.clarity, review.rating)
  const rigor = normalizeReviewScore(review.rigor, review.rating)
  const utility = normalizeReviewScore(review.utility, review.rating)
  const novelty = normalizeReviewScore(review.novelty, review.rating)
  const reproducibility = normalizeReviewScore(review.reproducibility, review.rating)
  const rating = normalizeReviewScore(review.rating, (clarity + rigor + utility + novelty + reproducibility) / 5)

  return {
    id: review.id,
    rating: Number(rating.toFixed(1)),
    clarity: Number(clarity.toFixed(1)),
    rigor: Number(rigor.toFixed(1)),
    utility: Number(utility.toFixed(1)),
    novelty: Number(novelty.toFixed(1)),
    reproducibility: Number(reproducibility.toFixed(1)),
    recommendation: review.recommendation || inferRecommendationFromScore(rating),
    comment: review.comment,
    strengths: review.strengths  "",
    improvements: review.improvements  "",
    openQuestions: review.openQuestions  "",
    createdAt: review.createdAt,
    author: reviewer  toPublicUserWithStore(reviewer, store) : null,
  }
}

function mapReviewToActivity(review, post, author, store) {
  return {
    id: review.id,
    rating: review.rating,
    comment: review.comment,
    createdAt: review.createdAt,
    article: post  mapPostToArticleWithStore(store, post, author) : null,
  }
}

function mapVoteToActivity(vote, post, author, store) {
  return {
    id: vote.id,
    value: vote.value,
    createdAt: vote.createdAt,
    article: post  mapPostToArticleWithStore(store, post, author) : null,
  }
}

function mapCommentToThread(comment, author, store) {
  return {
    id: comment.id,
    comment: comment.comment,
    createdAt: comment.createdAt,
    author: author  toPublicUserWithStore(author, store) : null,
  }
}

function safeArray(value) {
  return Array.isArray(value)  value : []
}

function getCommunityCategories(store) {
  return safeArray(store.categories).length  safeArray(store.categories) : SCIENCE_CATEGORIES
}

function inferCategoryFamily(category) {
  const normalized = String(category  "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()

  if (
    /(biologia|biotecnologia|gentica|bioinformatica|farmacologia|medicina|neurociencias|salud publica|veterinaria|epidemiologia|agrociencias|ecologia|ciencias del mar)/.test(
      normalized,
    )
  ) {
    return "Ciencias de la Vida"
  }

  if (
    /(fisica|astronomia|quimica|matematicas|geologia|geografia|nanociencia|ciencia de materiales|ciencias ambientales)/.test(
      normalized,
    )
  ) {
    return "Ciencias Fisicas"
  }

  if (/(ingenieria|inteligencia artificial|tecnologia)/.test(normalized)) {
    return "Ingenierias y Tecnologia"
  }

  if (
    /(ciencias sociales|psicologia|antropologia|sociologia|economia|ciencia politica|derecho y sociedad|estudios de genero)/.test(
      normalized,
    )
  ) {
    return "Ciencias Sociales"
  }

  if (/(historia|filosofia|linguistica|arqueologia|humanidades digitales)/.test(normalized)) {
    return "Humanidades"
  }

  return "Interdisciplina"
}

function buildCategoryGroups(categories) {
  const groups = CATEGORY_FAMILIES.map((family) => ({
    family,
    categories: [],
  }))

  for (const category of categories) {
    const family = inferCategoryFamily(category)
    const targetGroup = groups.find((item) => item.family === family)
    if (targetGroup) {
      targetGroup.categories.push(category)
    }
  }

  return groups
    .map((group) => ({
      ...group,
      categories: group.categories.sort((left, right) => left.localeCompare(right)),
    }))
    .filter((group) => group.categories.length > 0)
}

function cleanupOAuthStates() {
  const now = Date.now()
  for (const [state, payload] of oauthStates.entries()) {
    if (now - payload.createdAt > 15 * 60 * 1000) {
      oauthStates.delete(state)
    }
  }
}

function createOAuthState(payload = {}) {
  cleanupOAuthStates()
  const state = randomUUID()
  oauthStates.set(state, {
    ...payload,
    createdAt: Date.now(),
  })
  return state
}

function consumeOAuthState(state) {
  if (!state) {
    return null
  }

  const value = oauthStates.get(state)
  oauthStates.delete(state)
  return value  null
}

function buildOrcidAuthorizeUrl(state) {
  const clientId = process.env.ORCID_CLIENT_ID
  const redirectUri = process.env.ORCID_REDIRECT_URI

  if (!clientId || !redirectUri) {
    throw new Error("Falta configuracion ORCID_CLIENT_ID u ORCID_REDIRECT_URI")
  }

  return (
    `${ORCID_BASE_URL}/oauth/authorizeclient_id=${clientId}` +
    `&response_type=code` +
    `&scope=/authenticate` +
    `&state=${encodeURIComponent(state)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}`
  )
}

async function resolveOrcidDisplayName(accessToken, orcid) {
  if (!accessToken || !orcid) {
    return ""
  }

  try {
    const personResponse = await fetch(`${ORCID_API_BASE_URL}/v3.0/${orcid}/person`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    })

    if (!personResponse.ok) {
      return ""
    }

    const personData = await personResponse.json()
    const givenNames = personData.name.["given-names"].value  ""
    const familyName = personData.name.["family-name"].value  ""
    return `${givenNames} ${familyName}`.trim()
  } catch (error) {
    console.error("ORCID profile fetch warning:", error)
    return ""
  }
}

async function fetchOrcidResearchData(orcid) {
  if (!orcid) {
    return {
      works: [],
      productivity: {
        totalWorks: 0,
        recentWorks: 0,
        primaryAffiliation: "",
        keywords: [],
      },
    }
  }

  try {
    const [worksResponse, activitiesResponse] = await Promise.all([
      fetch(`${ORCID_API_BASE_URL}/v3.0/${orcid}/works`, {
        headers: {
          Accept: "application/json",
        },
      }),
      fetch(`${ORCID_API_BASE_URL}/v3.0/${orcid}/activities`, {
        headers: {
          Accept: "application/json",
        },
      }),
    ])

    const worksData = worksResponse.ok  await worksResponse.json() : {}
    const activitiesData = activitiesResponse.ok  await activitiesResponse.json() : {}
    const workGroups = safeArray(worksData.group)

    const works = workGroups
      .map((group) => {
        const summary = safeArray(group["work-summary"])[0]
        if (!summary) {
          return null
        }

        const externalIds = safeArray(summary["external-ids"].["external-id"])
        const doiId = externalIds.find((item) => item["external-id-type"].toLowerCase() === "doi")
        const publicationYear = summary["publication-date"].year.value  ""
        const title = summary.title.title.value  "Trabajo ORCID"
        const journal =
          summary["journal-title"].value 
          summary["source"].["source-name"].value 
          "Fuente no específicada"

        return {
          title,
          year: publicationYear  Number(publicationYear) : null,
          type: summary.type  "work",
          journal,
          url:
            doiId.["external-id-value"]
               `https://doi.org/${doiId["external-id-value"]}`
              : summary.url.value  "",
        }
      })
      .filter(Boolean)
      .sort((left, right) => {
        const leftYear = left.year  0
        const rightYear = right.year  0
        return rightYear - leftYear
      })

    const employmentSummaries = safeArray(
      activitiesData.employments.["affiliation-group"].flatMap((group) =>
        safeArray(group.summaries).map((entry) => entry["employment-summary"]),
      ),
    ).filter(Boolean)

    const keywordEntries = safeArray(activitiesData.keywords.keyword)
      .map((item) => item.content)
      .filter(Boolean)

    const currentYear = new Date().getFullYear()
    const recentWorks = works.filter((work) => work.year && work.year >= currentYear - 5).length
    const primaryAffiliation =
      employmentSummaries[0].organization.name 
      employmentSummaries[0].department-name 
      ""

    return {
      works,
      productivity: {
        totalWorks: works.length,
        recentWorks,
        primaryAffiliation,
        keywords: keywordEntries.slice(0, 6),
      },
    }
  } catch (error) {
    console.error("ORCID research fetch warning:", error)
    return {
      works: [],
      productivity: {
        totalWorks: 0,
        recentWorks: 0,
        primaryAffiliation: "",
        keywords: [],
      },
    }
  }
}

async function fetchOpenAlexAuthorMetrics(orcid) {
  if (!orcid) {
    return null
  }

  try {
    const response = await fetch(
      `${OPENALEX_API_BASE_URL}/authors/orcid:${encodeURIComponent(orcid)}select=id,display_name,works_count,cited_by_count,summary_stats,last_known_institutions,orcid`,
    )

    if (!response.ok) {
      return null
    }

    const author = await response.json()
    const primaryInstitution =
      safeArray(author.last_known_institutions)[0].display_name 
      safeArray(author.last_known_institutions)[0].institution.display_name 
      ""

    return {
      source: "openalex",
      displayName: author.display_name  "",
      worksCount: Number(author.works_count  0),
      citedByCount: Number(author.cited_by_count  0),
      hIndex: Number(author.summary_stats.h_index  0),
      i10Index: Number(author.summary_stats.i10_index  0),
      primaryInstitution,
      openAlexId: author.id  "",
      orcid: author.orcid  `https://orcid.org/${orcid}`,
    }
  } catch (error) {
    console.error("OpenAlex metrics fetch warning:", error)
    return null
  }
}

app.get("/", (_req, res) => {
  res.send("Backend activo")
})

app.get("/api/health", (_req, res) => {
  res.json({ ok: true })
})

app.get("/api/meta/community", async (_req, res) => {
  const store = await readStore()
  const categories = getCommunityCategories(store)
  res.json({
    categories,
    categoryGroups: buildCategoryGroups(categories),
    reputationPolicy: {
      summary:
        "La reputacion se equilibra entre publicacines, revisiones y comentarios para premiar aportes cientificos consistentes.",
      publicationBase: 10,
      voteBonus: 1,
      reviewBase: 7,
      commentBase: 3,
    },
    novas: {
      name: "DIVULS",
      phase: "Fase 1",
      storage: "offchain",
      targetNetwork: "Base",
      summary:
        "DIVULS incentiva publicacin, revisin y divulgaciÃ³n dentro de DivulgarÃ­a. En esta fase funciona como saldo interno, listo para una futura migración a Base.",
      policy: {
        publicationReward: 25,
        reviewReward: 15,
        commentReward: 5,
        positiveVoteBonus: 2,
      },
    },
  })
})

app.post("/api/meta/community/categories", async (req, res) => {
  const auth = await getCurrentUser(req)
  if (!auth) {
    return res.status(401).json({ error: "No autenticado." })
  }

  const rawLabel = String(req.body.label  "").trim()
  if (!rawLabel) {
    return res.status(400).json({ error: "Escribe un nombre para el area." })
  }

  const normalizedLabel = rawLabel
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()

  const categories = getCommunityCategories(auth.store)
  const exists = categories.some((item) => item.toLowerCase() === normalizedLabel.toLowerCase())

  if (!exists) {
    auth.store.categories = [...categories, normalizedLabel].sort((left, right) => left.localeCompare(right))
    await writeStore(auth.store)
  }

  return res.status(201).json({
    categories: getCommunityCategories(auth.store),
    categoryGroups: buildCategoryGroups(getCommunityCategories(auth.store)),
    added: !exists,
    label: normalizedLabel,
    family: inferCategoryFamily(normalizedLabel),
  })
})

app.post("/api/register", async (req, res) => {
  const { name, email, password, acceptedPrivacyNotice, acceptedPublishingTerms } = req.body  {}

  if (!name.trim() || !email.trim() || !password.trim()) {
    return res.status(400).json({ error: "name, email y password son obligatorios." })
  }

  if (!acceptedPrivacyNotice || !acceptedPublishingTerms) {
    return res.status(400).json({
      error: "Debes aceptar el aviso de privacidad y las condiciones editoriales para crear tu cuenta.",
    })
  }

  if (String(password).length < 6) {
    return res.status(400).json({ error: "La contraseña debe tener mínimo 6 caracteres." })
  }

  const normalizedEmail = String(email).trim().toLowerCase()
  const store = await readStore()
  const alreadyExists = store.users.some((user) => user.email === normalizedEmail)

  if (alreadyExists) {
    return res.status(409).json({ error: "Ese correo ya esta registrado." })
  }

  const acceptedAt = new Date().toISOString()
  const user = createUserProfile({
    name,
    email: normalizedEmail,
    password: hashPassword(String(password)),
    legalAcceptance: {
      acceptedAt,
      acceptedPrivacyNotice: true,
      acceptedPublishingTerms: true,
      privacyNoticeVersion: PRIVACY_NOTICE_VERSION,
      editorialTermsVersion: EDITORIAL_TERMS_VERSION,
    },
  })

  store.users.push(user)
  const token = createSession(store, user.id)
  await writeStore(store)

  return res.status(201).json({
    token,
    user: toPublicUserWithStore(user, store),
  })
})

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body  {}

  if (!email.trim() || !password.trim()) {
    return res.status(400).json({ error: "email y password son obligatorios." })
  }

  const normalizedEmail = String(email).trim().toLowerCase()
  const store = await readStore()
  const user = store.users.find((item) => item.email === normalizedEmail)

  if (!user || !verifyPassword(user.password, String(password))) {
    return res.status(401).json({ error: "Credenciales invalidas." })
  }

  if (!isHashedPassword(user.password) || String(user.password).startsWith("scrypt:")) {
    user.password = hashPassword(String(password))
  }

  const token = createSession(store, user.id)
  await writeStore(store)

  return res.json({
    token,
    user: toPublicUserWithStore(user, store),
  })
})

app.post("/api/password/forgot", async (req, res) => {
  const email = String(req.body.email  "").trim().toLowerCase()

  if (!email) {
    return res.status(400).json({ error: "El correo es obligatorio." })
  }

  if (!passwordResetMailer && !allowPasswordResetPreview(req)) {
    return res.status(503).json({
      error:
        "La recuperación por correo a?n no esta configurada en este entorno público. Podemos dejarla activa en cuanto conectemos un servicio SMTP.",
    })
  }

  const store = await readStore()
  purgePasswordResets(store)

  const user = store.users.find((item) => item.email === email)
  let previewResetLink = null

  if (user) {
    const rawToken = randomBytes(32).toString("hex")
    const resetLink = buildPasswordResetLink(rawToken)

    store.passwordResets = store.passwordResets.filter((item) => item.userId !== user.id)
    store.passwordResets.push({
      id: `rst_${randomUUID().slice(0, 8)}`,
      userId: user.id,
      tokenHash: hashPasswordResetToken(rawToken),
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + PASSWORD_RESET_TTL_MINUTES * 60 * 1000).toISOString(),
    })

    const delivery = await sendPasswordResetEmail({ user, resetLink })

    if (!delivery.delivered && allowPasswordResetPreview(req)) {
      previewResetLink = resetLink
    }
  }

  await writeStore(store)

  return res.json({
    ok: true,
    message:
      "Si el correo existe en DivulgarÃ­a, enviaremos un enlace temporal para restablecer la contraseña.",
    previewResetLink,
  })
})

app.get("/api/password/reset/validate", async (req, res) => {
  const token = String(req.query.token  "").trim()

  if (!token) {
    return res.status(400).json({ error: "El token de recuperación es obligatorio." })
  }

  const store = await readStore()
  purgePasswordResets(store)

  const resetRequest = store.passwordResets.find(
    (item) => item.tokenHash === hashPasswordResetToken(token),
  )

  if (!resetRequest) {
    await writeStore(store)
    return res.status(400).json({ error: "El enlace de recuperación ya no es valido o ha expirado." })
  }

  return res.json({ ok: true, valid: true })
})

app.post("/api/password/reset", async (req, res) => {
  const token = String(req.body.token  "").trim()
  const password = String(req.body.password  "")

  if (!token || !password.trim()) {
    return res.status(400).json({ error: "El token y la nueva contraseña son obligatorios." })
  }

  if (password.length < 6) {
    return res.status(400).json({ error: "La contraseña debe tener mínimo 6 caracteres." })
  }

  const store = await readStore()
  purgePasswordResets(store)

  const tokenHash = hashPasswordResetToken(token)
  const resetRequest = store.passwordResets.find((item) => item.tokenHash === tokenHash)

  if (!resetRequest) {
    await writeStore(store)
    return res.status(400).json({ error: "El enlace de recuperación ya no es valido o ha expirado." })
  }

  const user = store.users.find((item) => item.id === resetRequest.userId)

  if (!user) {
    store.passwordResets = store.passwordResets.filter((item) => item.id !== resetRequest.id)
    await writeStore(store)
    return res.status(404).json({ error: "No encontramos la cuenta asociada a este enlace." })
  }

  user.password = hashPassword(password)
  store.passwordResets = store.passwordResets.filter((item) => item.userId !== user.id)
  store.sessions = store.sessions.filter((item) => item.userId !== user.id)
  await writeStore(store)

  return res.json({
    ok: true,
    message: "Tu contraseña ya fue actualizada. Ahora puedes iniciar sesion con la nueva clave.",
  })
})

app.post("/api/logout", async (req, res) => {
  const token = getTokenFromRequest(req)
  if (!token) {
    return res.json({ ok: true })
  }

  const store = await readStore()
  store.sessions = store.sessions.filter((session) => session.token !== token)
  await writeStore(store)
  return res.json({ ok: true })
})

app.get("/api/me", async (req, res) => {
  const auth = await getCurrentUser(req)
  if (!auth) {
    return res.status(401).json({ user: null })
  }

  return res.json({ user: toPublicUserWithStore(auth.user, auth.store) })
})

app.patch("/api/me", async (req, res) => {
  const auth = await getCurrentUser(req)
  if (!auth) {
    return res.status(401).json({ error: "No autenticado." })
  }

  const name = String(req.body.name  auth.user.name).trim()
  const affiliation = String(req.body.affiliation  auth.user.affiliation).trim()
  const bio = String(req.body.bio  auth.user.bio).trim()
  const location = String(req.body.location  auth.user.location).trim()
  const image = String(req.body.image  auth.user.image).trim()

  if (!name) {
    return res.status(400).json({ error: "El nombre es obligatorio." })
  }

  auth.user.name = name
  auth.user.affiliation = affiliation || "Comunidad DivulgarÃ­a"
  auth.user.bio = bio || "Perfil cientÃ­fico en crecimiento dentro de DivulgarÃ­a."
  auth.user.location = location || "LatAm"
  auth.user.role = resolvePublicRole(auth.user)
  auth.user.image =
    image ||
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43ew=240&h=240&fit=crop&crop=faces"

  await writeStore(auth.store)

  return res.json({ user: toPublicUserWithStore(auth.user, auth.store) })
})

app.get("/api/users/:id", async (req, res) => {
  const store = await readStore()
  const user = store.users.find((item) => item.id === req.params.id)

  if (!user) {
    return res.status(404).json({ error: "Usuario no encontrado." })
  }

  const userPosts = store.posts.filter((post) => post.authorId === user.id)
  const totalVotes = userPosts.reduce((sum, post) => sum + (post.votes  0), 0)
  const orcidResearch = user.orcidId  await fetchOrcidResearchData(user.orcidId) : null
  const bibliometrics = user.orcidId  await fetchOpenAlexAuthorMetrics(user.orcidId) : null
  const followers = store.follows.filter((item) => item.followingUserId === user.id)
  const following = store.follows.filter((item) => item.followerUserId === user.id)
  const reputation = getReputationBreakdown(store, user.id)
  const novas = getDivulgarasBreakdown(store, user.id)
  const token = getTokenFromRequest(req)
  const viewerSession = token  store.sessions.find((item) => item.token === token) : null
  const isFollowing = viewerSession
     store.follows.some(
        (item) => item.followerUserId === viewerSession.userId && item.followingUserId === user.id,
      )
    : false

  return res.json({
    user: toPublicUserWithStore(user, store),
    stats: {
      posts: userPosts.length,
      comments: userPosts.reduce((sum, post) => sum + (post.comments  0), 0),
      votes: totalVotes,
    },
    productivity: orcidResearch.productivity  null,
    orcidWorks: orcidResearch.works  [],
    bibliometrics,
    reputation,
    novas,
    social: {
      followersCount: followers.length,
      followingCount: following.length,
      isFollowing,
    },
  })
})

app.get("/api/users/:id/activity", async (req, res) => {
  const store = await readStore()
  const user = store.users.find((item) => item.id === req.params.id)

  if (!user) {
    return res.status(404).json({ error: "Usuario no encontrado." })
  }

  const reviews = store.reviews
    .filter((item) => item.userId === user.id)
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
    .map((review) => {
      const post = store.posts.find((item) => item.id === review.articleId)
      const author = post  store.users.find((item) => item.id === post.authorId) : null
      return mapReviewToActivity(review, post, author, store)
    })

  const votes = store.votes
    .filter((item) => item.userId === user.id)
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
    .map((vote) => {
      const post = store.posts.find((item) => item.id === vote.articleId)
      const author = post  store.users.find((item) => item.id === post.authorId) : null
      return mapVoteToActivity(vote, post, author, store)
    })
  const comments = store.comments
    .filter((item) => item.userId === user.id)
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
    .map((comment) => {
      const post = store.posts.find((item) => item.id === comment.articleId)
      const author = post  store.users.find((item) => item.id === post.authorId) : null
      return {
        id: comment.id,
        comment: comment.comment,
        createdAt: comment.createdAt,
        article: post  mapPostToArticleWithStore(store, post, author) : null,
      }
    })

  const followers = store.follows
    .filter((item) => item.followingUserId === user.id)
    .map((item) => store.users.find((candidate) => candidate.id === item.followerUserId))
    .filter(Boolean)
    .map((item) => toPublicUserWithStore(item, store))

  const following = store.follows
    .filter((item) => item.followerUserId === user.id)
    .map((item) => store.users.find((candidate) => candidate.id === item.followingUserId))
    .filter(Boolean)
    .map((item) => toPublicUserWithStore(item, store))

  return res.json({
    reviews,
    votes,
    comments,
    followers,
    following,
  })
})

app.get("/api/users/:id/articles", async (req, res) => {
  const store = await readStore()
  const user = store.users.find((item) => item.id === req.params.id)

  if (!user) {
    return res.status(404).json({ error: "Usuario no encontrado." })
  }

  const articles = store.posts
    .filter((post) => post.authorId === user.id)
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
    .map((post) => mapPostToArticleWithStore(store, post, user))

  return res.json(articles)
})

app.get("/api/articles", async (req, res) => {
  const store = await readStore()
  const token = getTokenFromRequest(req)
  const viewerSession = token  store.sessions.find((item) => item.token === token) : null
  const viewerUserId = viewerSession.userId  null

  const articles = store.posts
    .slice()
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
    .map((post) => {
      const author = store.users.find((user) => user.id === post.authorId)
      const article = mapPostToArticleWithStore(store, post, author, {
        includeContentHtml: false,
        includeFigureImage: true,
        compactAuthor: true,
      })
      article.viewerState = {
        vote: viewerUserId
           Number(
              store.votes.find(
                (item) => item.articleId === post.id && item.userId === viewerUserId,
              ).value  0,
            )
          : 0,
        followingAuthor:
          !!viewerUserId &&
          !!author &&
          store.follows.some(
            (item) =>
              item.followerUserId === viewerUserId && item.followingUserId === author.id,
          ),
      }
      return article
    })

  return res.json(articles)
})

app.get("/api/community/overview", async (_req, res) => {
  const store = await readStore()

  const topCategories = [...store.posts]
    .reduce((accumulator, post) => {
      const key = post.category || "General"
      accumulator.set(key, (accumulator.get(key)  0) + 1)
      return accumulator
    }, new Map())
  const trendingCategories = [...topCategories.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, 6)
    .map(([label]) => `#${String(label).replace(/\s+/g, "")}`)

  const recentReviews = store.reviews
    .slice()
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
    .slice(0, 4)
    .map((review) => {
      const reviewer = store.users.find((item) => item.id === review.userId)
      const article = store.posts.find((item) => item.id === review.articleId)
      return {
        id: review.id,
        reviewer: reviewer.name  "Miembro DivulgarÃ­a",
        specialty: reviewer.role  "Comunidad cientifica",
        quote: review.comment || "Revisin enviada sin comentario adicional.",
        about: article.title  "Revisin reciente",
      }
    })

  const recentComments = store.comments
    .slice()
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
    .slice(0, 5)
    .map((comment) => {
      const commenter = store.users.find((item) => item.id === comment.userId)
      const article = store.posts.find((item) => item.id === comment.articleId)
      return {
        id: comment.id,
        author: commenter.name  "Miembro DivulgarÃ­a",
        comment: comment.comment,
        articleTitle: article.title  "Conversacion cientifica",
      }
    })

  return res.json({
    stats: [
      { value: String(store.users.length), label: "perfiles activos" },
      { value: String(store.reviews.length), label: "revisiones abiertas" },
      { value: String(store.comments.length), label: "comentarios cientificos" },
    ],
    trendingTopics: trendingCategories,
    recentReviews,
    recentComments,
  })
})

app.get("/api/articles/:id", async (req, res) => {
  const store = await readStore()
  const post = store.posts.find((item) => item.id === req.params.id)

  if (!post) {
      return res.status(404).json({ error: "ArtÃ­culo no encontrado." })
  }

  const author = store.users.find((item) => item.id === post.authorId)
  const token = getTokenFromRequest(req)
  const session = token  store.sessions.find((item) => item.token === token) : null
  const viewerVote = session
     store.votes.find((item) => item.articleId === post.id && item.userId === session.userId)
    : null
  const viewerReview = session
     store.reviews.find((item) => item.articleId === post.id && item.userId === session.userId)
    : null
  const reviews = store.reviews
    .filter((item) => item.articleId === post.id)
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
    .map((review) => {
      const reviewer = store.users.find((item) => item.id === review.userId)
      return mapStoredReview(review, reviewer, store)
    })
  const comments = store.comments
    .filter((item) => item.articleId === post.id)
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
    .map((comment) => {
      const commenter = store.users.find((item) => item.id === comment.userId)
      return mapCommentToThread(comment, commenter, store)
    })

  return res.json({
    ...mapPostToArticleWithStore(store, post, author),
    viewerState: {
      vote: Number(viewerVote.value  0),
      review: viewerReview
         {
            rating: viewerReview.rating,
            clarity: viewerReview.clarity  viewerReview.rating,
            rigor: viewerReview.rigor  viewerReview.rating,
            utility: viewerReview.utility  viewerReview.rating,
            novelty: viewerReview.novelty  viewerReview.rating,
            reproducibility: viewerReview.reproducibility  viewerReview.rating,
            recommendation: viewerReview.recommendation || inferRecommendationFromScore(viewerReview.rating),
            comment: viewerReview.comment,
            strengths: viewerReview.strengths  "",
            improvements: viewerReview.improvements  "",
            openQuestions: viewerReview.openQuestions  "",
          }
        : null,
    },
    reviews,
    comments,
  })
})

app.post("/api/posts", async (req, res) => {
  const auth = await getCurrentUser(req)
  if (!auth) {
    return res.status(401).json({ error: "No autenticado." })
  }

  const title = String(req.body.title  "").trim()
  const contentHtml = String(req.body.contentHtml  "").trim()
  const excerpt = String(req.body.excerpt  "").trim()
  const category = String(req.body.category  "").trim()
  const figureImage = String(req.body.figureImage  "").trim()
  const figureCaption = String(req.body.figureCaption  "").trim()
  const sources = Array.isArray(req.body.sources)
     normalizeSources(req.body.sources)
    : []

  if (!title || !contentHtml || !category) {
    return res.status(400).json({ error: "title, contentHtml y category son obligatorios." })
  }

  if (!figureImage) {
    return res.status(400).json({ error: "figureImage es obligatoria para publicar." })
  }

  if (!getCommunityCategories(auth.store).includes(category)) {
    return res.status(400).json({ error: "Selecciona un area cientifica valida." })
  }

  const plainText = contentHtml.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
  const finalExcerpt = excerpt || `${plainText.slice(0, 170)}${plainText.length > 170  "..." : ""}`
  const wordCount = plainText  plainText.split(" ").length : 0
  const readTime = `${Math.max(1, Math.ceil(wordCount / 210))} min de lectura`
  const createdAt = new Date().toISOString()

  const post = {
    id: `art_${randomUUID().slice(0, 10)}`,
    title,
    contentHtml,
    excerpt: finalExcerpt,
    category,
    figureImage,
    figureCaption,
    sources,
    authorId: auth.user.id,
    createdAt,
    votes: 0,
    comments: 0,
    peerScore: 0,
    readTime,
  }

  auth.store.posts.push(post)
  await writeStore(auth.store)

  return res.status(201).json(mapPostToArticleWithStore(auth.store, post, auth.user))
})

app.patch("/api/posts/:id", async (req, res) => {
  const auth = await getCurrentUser(req)
  if (!auth) {
    return res.status(401).json({ error: "No autenticado." })
  }

  const post = auth.store.posts.find((item) => item.id === req.params.id)
  if (!post) {
      return res.status(404).json({ error: "ArtÃ­culo no encontrado." })
  }

  if (post.authorId !== auth.user.id) {
    return res.status(403).json({ error: "No puedes editar esta publicacin." })
  }

  const title = String(req.body.title  post.title).trim()
  const contentHtml = String(req.body.contentHtml  post.contentHtml).trim()
  const excerpt = String(req.body.excerpt  post.excerpt).trim()
  const category = String(req.body.category  post.category).trim()
  const figureImage = String(req.body.figureImage  post.figureImage  "").trim()
  const figureCaption = String(req.body.figureCaption  post.figureCaption  "").trim()
  const sources = Array.isArray(req.body.sources)
     normalizeSources(req.body.sources)
    : normalizeSources(post.sources)

  if (!title || !contentHtml || !category) {
    return res.status(400).json({ error: "title, contentHtml y category son obligatorios." })
  }

  if (!figureImage) {
    return res.status(400).json({ error: "figureImage es obligatoria para publicar." })
  }

  if (!getCommunityCategories(auth.store).includes(category)) {
    return res.status(400).json({ error: "Selecciona un area cientifica valida." })
  }

  const plainText = contentHtml.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
  post.title = title
  post.contentHtml = contentHtml
  post.category = category
  post.figureImage = figureImage
  post.figureCaption = figureCaption
  post.sources = sources
  post.excerpt = excerpt || `${plainText.slice(0, 170)}${plainText.length > 170  "..." : ""}`
  post.readTime = `${Math.max(1, Math.ceil((plainText  plainText.split(" ").length : 0) / 210))} min de lectura`
  post.updatedAt = new Date().toISOString()

  await writeStore(auth.store)
  return res.json(mapPostToArticleWithStore(auth.store, post, auth.user))
})

app.delete("/api/posts/:id", async (req, res) => {
  const auth = await getCurrentUser(req)
  if (!auth) {
    return res.status(401).json({ error: "No autenticado." })
  }

  const post = auth.store.posts.find((item) => item.id === req.params.id)
  if (!post) {
      return res.status(404).json({ error: "ArtÃ­culo no encontrado." })
  }

  if (post.authorId !== auth.user.id) {
    return res.status(403).json({ error: "No puedes eliminar esta publicacin." })
  }

  auth.store.posts = auth.store.posts.filter((item) => item.id !== req.params.id)
  auth.store.votes = auth.store.votes.filter((item) => item.articleId !== req.params.id)
  auth.store.reviews = auth.store.reviews.filter((item) => item.articleId !== req.params.id)
  await writeStore(auth.store)

  return res.json({ ok: true })
})

app.post("/api/articles/:id/vote", async (req, res) => {
  const auth = await getCurrentUser(req)
  if (!auth) {
    return res.status(401).json({ error: "No autenticado." })
  }

  const post = auth.store.posts.find((item) => item.id === req.params.id)
  if (!post) {
      return res.status(404).json({ error: "ArtÃ­culo no encontrado." })
  }

  const value = Number(req.body.value  0)
  if (![1, 0, -1].includes(value)) {
    return res.status(400).json({ error: "El voto debe ser 1, 0 o -1." })
  }

  const existingVote = auth.store.votes.find(
    (item) => item.articleId === post.id && item.userId === auth.user.id,
  )

  if (value === 0) {
    auth.store.votes = auth.store.votes.filter(
      (item) => !(item.articleId === post.id && item.userId === auth.user.id),
    )
  } else if (existingVote) {
    existingVote.value = value
    existingVote.updatedAt = new Date().toISOString()
  } else {
    auth.store.votes.push({
      id: `vote_${randomUUID().slice(0, 10)}`,
      articleId: post.id,
      userId: auth.user.id,
      value,
      createdAt: new Date().toISOString(),
    })
  }

  const refreshedPost = refreshPostMetrics(auth.store, post.id)
  await writeStore(auth.store)

  return res.json({
    ok: true,
    metrics: {
      votes: refreshedPost.votes  0,
      comments: refreshedPost.comments  0,
      peerScore: refreshedPost.peerScore  0,
    },
    currentVote: value,
  })
})

app.post("/api/articles/:id/reviews", async (req, res) => {
  const auth = await getCurrentUser(req)
  if (!auth) {
    return res.status(401).json({ error: "No autenticado." })
  }

  const post = auth.store.posts.find((item) => item.id === req.params.id)
  if (!post) {
      return res.status(404).json({ error: "ArtÃ­culo no encontrado." })
  }

  const rating = Number(req.body.rating  0)
  const clarity = normalizeReviewScore(req.body.clarity, rating)
  const rigor = normalizeReviewScore(req.body.rigor, rating)
  const utility = normalizeReviewScore(req.body.utility, rating)
  const novelty = normalizeReviewScore(req.body.novelty, rating)
  const reproducibility = normalizeReviewScore(req.body.reproducibility, rating)
  const averageRating = Number(((clarity + rigor + utility + novelty + reproducibility) / 5).toFixed(1))
  const recommendation =
    typeof req.body.recommendation === "string" && req.body.recommendation.trim()
       req.body.recommendation.trim()
      : inferRecommendationFromScore(averageRating)
  const comment = String(req.body.comment  "").trim()
  const strengths = String(req.body.strengths  "").trim()
  const improvements = String(req.body.improvements  "").trim()
  const openQuestions = String(req.body.openQuestions  "").trim()

  if (clarity < 1 || rigor < 1 || utility < 1 || novelty < 1 || reproducibility < 1) {
    return res.status(400).json({ error: "La revisin necesita claridad, rigor, utilidad, novedad y reproducibilidad entre 1 y 5." })
  }

  const existingReview = auth.store.reviews.find(
    (item) => item.articleId === post.id && item.userId === auth.user.id,
  )

  if (existingReview) {
    existingReview.rating = averageRating
    existingReview.clarity = clarity
    existingReview.rigor = rigor
    existingReview.utility = utility
    existingReview.novelty = novelty
    existingReview.reproducibility = reproducibility
    existingReview.recommendation = recommendation
    existingReview.comment = comment
    existingReview.strengths = strengths
    existingReview.improvements = improvements
    existingReview.openQuestions = openQuestions
    existingReview.updatedAt = new Date().toISOString()
  } else {
    auth.store.reviews.push({
      id: `rev_${randomUUID().slice(0, 10)}`,
      articleId: post.id,
      userId: auth.user.id,
      rating: averageRating,
      clarity,
      rigor,
      utility,
      novelty,
      reproducibility,
      recommendation,
      comment,
      strengths,
      improvements,
      openQuestions,
      createdAt: new Date().toISOString(),
    })
  }

  const refreshedPost = refreshPostMetrics(auth.store, post.id)
  await writeStore(auth.store)

  const reviews = auth.store.reviews
    .filter((item) => item.articleId === post.id)
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
    .map((review) => {
      const reviewer = auth.store.users.find((item) => item.id === review.userId)
      return mapStoredReview(review, reviewer, auth.store)
    })

  return res.json({
    ok: true,
    metrics: {
      votes: refreshedPost.votes  0,
      comments: refreshedPost.comments  0,
      peerScore: refreshedPost.peerScore  0,
    },
    reviews,
    currentReview: {
      rating: averageRating,
      clarity,
      rigor,
      utility,
      novelty,
      reproducibility,
      recommendation,
      comment,
      strengths,
      improvements,
      openQuestions,
    },
  })
})

app.post("/api/articles/:id/comments", async (req, res) => {
  const auth = await getCurrentUser(req)
  if (!auth) {
    return res.status(401).json({ error: "No autenticado." })
  }

  const post = auth.store.posts.find((item) => item.id === req.params.id)
  if (!post) {
      return res.status(404).json({ error: "ArtÃ­culo no encontrado." })
  }

  const comment = String(req.body.comment  "").trim()
  if (!comment) {
    return res.status(400).json({ error: "El comentario no puede ir vacio." })
  }

  auth.store.comments.push({
    id: `com_${randomUUID().slice(0, 10)}`,
    articleId: post.id,
    userId: auth.user.id,
    comment,
    createdAt: new Date().toISOString(),
  })

  const refreshedPost = refreshPostMetrics(auth.store, post.id)
  await writeStore(auth.store)

  const comments = auth.store.comments
    .filter((item) => item.articleId === post.id)
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
    .map((entry) => {
      const commenter = auth.store.users.find((item) => item.id === entry.userId)
      return mapCommentToThread(entry, commenter, auth.store)
    })

  return res.status(201).json({
    ok: true,
    metrics: {
      votes: refreshedPost.votes  0,
      comments: refreshedPost.comments  0,
      peerScore: refreshedPost.peerScore  0,
    },
    comments,
  })
})

app.delete("/api/articles/:id/reviews/mine", async (req, res) => {
  const auth = await getCurrentUser(req)
  if (!auth) {
    return res.status(401).json({ error: "No autenticado." })
  }

  const post = auth.store.posts.find((item) => item.id === req.params.id)
  if (!post) {
      return res.status(404).json({ error: "ArtÃ­culo no encontrado." })
  }

  auth.store.reviews = auth.store.reviews.filter(
    (item) => !(item.articleId === post.id && item.userId === auth.user.id),
  )

  const refreshedPost = refreshPostMetrics(auth.store, post.id)
  await writeStore(auth.store)

  return res.json({
    ok: true,
    metrics: {
      votes: refreshedPost.votes  0,
      comments: refreshedPost.comments  0,
      peerScore: refreshedPost.peerScore  0,
    },
  })
})

app.post("/api/users/:id/follow", async (req, res) => {
  const auth = await getCurrentUser(req)
  if (!auth) {
    return res.status(401).json({ error: "No autenticado." })
  }

  if (auth.user.id === req.params.id) {
    return res.status(400).json({ error: "No puedes seguir tu propio perfil." })
  }

  const targetUser = auth.store.users.find((item) => item.id === req.params.id)
  if (!targetUser) {
    return res.status(404).json({ error: "Usuario no encontrado." })
  }

  const existingFollow = auth.store.follows.find(
    (item) => item.followerUserId === auth.user.id && item.followingUserId === targetUser.id,
  )

  if (!existingFollow) {
    auth.store.follows.push({
      id: `fol_${randomUUID().slice(0, 10)}`,
      followerUserId: auth.user.id,
      followingUserId: targetUser.id,
      createdAt: new Date().toISOString(),
    })
    await writeStore(auth.store)
  }

  return res.json({
    ok: true,
    following: true,
    followersCount: auth.store.follows.filter((item) => item.followingUserId === targetUser.id).length,
    followingCount: auth.store.follows.filter((item) => item.followerUserId === targetUser.id).length,
  })
})

app.delete("/api/users/:id/follow", async (req, res) => {
  const auth = await getCurrentUser(req)
  if (!auth) {
    return res.status(401).json({ error: "No autenticado." })
  }

  const targetUser = auth.store.users.find((item) => item.id === req.params.id)
  if (!targetUser) {
    return res.status(404).json({ error: "Usuario no encontrado." })
  }

  auth.store.follows = auth.store.follows.filter(
    (item) => !(item.followerUserId === auth.user.id && item.followingUserId === targetUser.id),
  )
  await writeStore(auth.store)

  return res.json({
    ok: true,
    following: false,
    followersCount: auth.store.follows.filter((item) => item.followingUserId === targetUser.id).length,
    followingCount: auth.store.follows.filter((item) => item.followerUserId === targetUser.id).length,
  })
})

app.get("/api/oauth/orcid", (_req, res) => {
  try {
    const state = createOAuthState({ mode: "login" })
    const url = buildOrcidAuthorizeUrl(state)
    return res.redirect(url)
  } catch (error) {
    console.error(error)
    return res.status(500).send("No fue posible iniciar ORCID")
  }
})

app.post("/api/oauth/orcid/link", async (req, res) => {
  const auth = await getCurrentUser(req)
  if (!auth) {
    return res.status(401).json({ error: "No autenticado." })
  }

  try {
    const state = createOAuthState({
      mode: "link",
      userId: auth.user.id,
    })
    const url = buildOrcidAuthorizeUrl(state)
    return res.json({ url })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: "No fue posible iniciar la vinculacion ORCID." })
  }
})

async function handleOrcidCallback(req, res) {
  const code = String(req.query.code  "")
  const state = String(req.query.state  "")

  if (!code) {
    return res.redirect(`${FRONTEND_URL}/loginoauth_error=missing_code`)
  }

  try {
    const tokenResponse = await fetch(`${ORCID_BASE_URL}/oauth/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: process.env.ORCID_CLIENT_ID  "",
        client_secret: process.env.ORCID_CLIENT_SECRET  "",
        grant_type: "authorization_code",
        code,
        redirect_uri: process.env.ORCID_REDIRECT_URI  "",
      }),
    })

    const tokenData = await tokenResponse.json()
    if (!tokenResponse.ok) {
      console.error("ORCID token exchange failed:", tokenData)
      return res.redirect(`${FRONTEND_URL}/loginoauth_error=token_exchange`)
    }

    const orcid = tokenData.orcid
    const accessToken = tokenData.access_token
    if (!orcid) {
      return res.redirect(`${FRONTEND_URL}/loginoauth_error=no_orcid`)
    }

    const displayName = await resolveOrcidDisplayName(accessToken, orcid)
    const oauthState = consumeOAuthState(state)
    const store = await readStore()
    const existingByOrcid = store.users.find((item) => item.orcidId === orcid)

    let user = null
    let linked = false

    if (oauthState.mode === "link" && oauthState.userId) {
      const linkedUser = store.users.find((item) => item.id === oauthState.userId)
      if (!linkedUser) {
        return res.redirect(`${FRONTEND_URL}/loginoauth_error=link_user_missing`)
      }

      if (existingByOrcid && existingByOrcid.id !== linkedUser.id) {
        return res.redirect(`${FRONTEND_URL}/profile/${linkedUser.id}orcid_error=already_linked`)
      }

      linkedUser.orcidId = orcid
      linkedUser.role = resolvePublicRole(linkedUser)
      if (displayName && (!linkedUser.name || linkedUser.name.startsWith("Investigador ORCID"))) {
        linkedUser.name = displayName
      }

      user = linkedUser
      linked = true
    } else if (existingByOrcid) {
      user = existingByOrcid
      if (displayName && (!user.name || user.name.startsWith("Investigador ORCID"))) {
        user.name = displayName
      }
    } else {
      user = createUserProfile({
        name: displayName || `Investigador ORCID ${orcid.slice(-4)}`,
        email: "",
        password: "",
        orcidId: orcid,
        role: resolvePublicRole({ orcidId: orcid }),
        affiliation: "Perfil importado desde ORCID",
      })
      store.users.push(user)
    }

    const sessionToken = createSession(store, user.id)
    await writeStore(store)

    const redirectUrl = new URL(`${FRONTEND_URL.replace(/\/$/, "")}/orcid/callback`)
    redirectUrl.searchParams.set("token", sessionToken)
    redirectUrl.searchParams.set("orcid", orcid)
    redirectUrl.searchParams.set("linked", linked  "1" : "0")

    return res.redirect(redirectUrl.toString())
  } catch (error) {
    console.error("ORCID callback error:", error)
    return res.redirect(`${FRONTEND_URL}/loginoauth_error=callback`)
  }
}

app.get("/api/oauth/orcid/callback", handleOrcidCallback)
app.get("/orcid/callback", handleOrcidCallback)

app.listen(PORT, () => {
  console.log(`Backend corriendo en http://localhost:${PORT}`)
})
