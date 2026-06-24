export type Scientist = {
  id: string
  name: string
  image: string
  role: string
  affiliation: string
  orcidId: string
  reputation: number
  novasBalance: number
  bio: string
  location: string
  isDemo: boolean
}

export type ArticleSource = {
  title: string
  publisher: string
  url: string
}

export type FeedArticle = {
  id: string
  title: string
  excerpt: string
  category: string
  timeAgo: string
  publishedLabel: string
  readTime: string
  heroKicker: string
  tags: string[]
  metrics: {
    votes: number
    comments: number
    peerScore: number
  }
  author: Scientist
  contentHtml: string
  figureImage: string
  figureCaption: string
  sources: ArticleSource[]
  viewerState: {
    vote: number
    followingAuthor: boolean
  }
}

export type ReviewMetric = {
  label: string
  score: string
  value: number
  accent: "blue" | "indigo" | "amber"
}

export const currentUser: Scientist = {
  id: "usr_demo",
  name: "Dra. Camila Ortega",
  image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330w=240&h=240&fit=crop",
  role: "Curadora de ciencia abierta",
  affiliation: "Centro de Innovación Biomédica de Monterrey",
  orcidId: "0000-0003-2041-8893",
  reputation: 214,
  novasBalance: 1240,
  bio: "Divulgadora y coordinadora editorial enfocada en traducir hallazgos complejos a conversaciónes científicas claras, abiertas y verificables.",
  location: "Monterrey, México",
  isDemo: true,
}

export const authorProfile: Scientist = {
  id: "usr_alejandro",
  name: "Dr. Alejandro Silva",
  image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2dw=240&h=240&fit=crop",
  role: "Investigador en biotecnología aplicada",
  affiliation: "UNAM, Ciudad de México",
  orcidId: "0000-0002-1234-5678",
  reputation: 156,
  novasBalance: 860,
  bio: "Especialista en biopolímeros sustentables derivados de residuos agroindustriales. Combina ciencia de materiales, economía circular y divulgación abierta en proyectos con impacto regional.",
  location: "Ciudad de México, México",
}

const articleBody = `
  <p>Proyecta nace para que la investigación académica no termine en un PDF cerrado, sino en una conversación verificable, visible y útil para otras comunidades científicas.</p>

  <h2>Introducción</h2>
  <p>La búsqueda de alternativas sostenibles a los plásticos convencionales ha llevado a un interés creciente en los biopolímeros derivados de residuos agroindustriales. En este estudio, nos enfocamos en el aprovechamiento de los desechos de la industria del café y el maíz en la región mesoamericana, buscando no solo reducir el impacto ambiental de los residuos, sino también crear valor añadido para economías rurales.</p>

  <h2>Metodología</h2>
  <p>Se recolectaron muestras de bagazo de café y cáscara de maíz de tres cooperativas en Chiapas, México. Estas muestras fueron sometidas a un proceso de hidrólisis ácida controlada seguido de fermentación bacteriana con cepas de <em>Bacillus subtilis</em> seleccionadas por su capacidad de síntesis de polihidroxialcanoatos.</p>

  <blockquote>
    “Los resultados preliminares muestran una eficiencia de conversión del 34% en peso seco, superando los promedios reportados anteriormente para sustratos similares en la literatura técnica regional.”
  </blockquote>

  <h2>Resultados y Discusión</h2>
  <p>El análisis FTIR confirmó la estructura de los polímeros obtenidos, mostrando bandas características de los ésteres del PHA. La biodegradabilidad fue evaluada en condiciones de compostaje industrial, donde el material mostró una degradación del 90% en un periodo de 45 días.</p>

  <ul>
    <li>Reducción de residuos agrícolas con un modelo replicable en cooperativas rurales.</li>
    <li>Proceso de extracción con enzimas locales que disminuye costos operativos.</li>
    <li>Material final con desempeño prometedor para empaques biodegradables.</li>
  </ul>

  <h2>Implicaciones Abiertas</h2>
  <p>Además del hallazgo técnico, el artículo propone una ruta de ciencia abierta donde cada revisión deja trazabilidad, contexto métodológico y utilidad social. Ese gesto editorial es el corazón de la plataforma.</p>
`

export const categoryLabels = [
  "Biotecnología",
  "Física Cuántica",
  "Ecología",
  "Ciencias Sociales",
  "Inteligencia Artificial",
  "Medicina",
  "Biología",
  "Química",
  "Matemáticas",
  "Ingeniería",
  "Neurociencias",
  "Salud Pública",
  "Astronomía",
  "Geología",
  "Agrociencias",
  "Psicología",
  "Economía",
  "Historia",
  "Filosofía",
  "LingÃ¼ística",
  "Humanidades Digitales",
]

export const trendingTopics = [
  "#COP28",
  "#Vacunas",
  "#Web3",
  "#BioÉtica",
  "#OpenScience",
  "#LatAmTech",
]

export const platformStats = [
  { value: "87", label: "perfiles verificados" },
  { value: "312", label: "lecturas y valoraciones activas" },
  { value: "24h", label: "para mover un buen artículo en la comunidad" },
]

export const reviewMetrics: ReviewMetric[] = [
  { label: "Claridad", score: "4.8/5", value: 96, accent: "blue" },
  { label: "Rigor", score: "4.2/5", value: 84, accent: "indigo" },
  { label: "Utilidad", score: "4.5/5", value: 90, accent: "amber" },
]

export const reviewHighlights = [
  {
    reviewer: "Dra. Marta Ruiz",
    specialty: "Biotecnología molecular",
    quote:
      "La métodología es sólida y la narrativa hace visible por qué este hallazgo importa fuera del laboratorio.",
    about: "Sobre artículos de ciencia abierta con verificación ORCID",
  },
  {
    reviewer: "Dr. Daniel Ibarra",
    specialty: "Ecología de materiales",
    quote:
      "La combinación entre reputación científica y diseño editorial hace que la lectura sea más confiable y más humana.",
    about: "Sobre publicaciones en materiales sostenibles",
  },
  {
    reviewer: "Dra. Elena Martínez",
    specialty: "Ecología marina",
    quote:
      "La plataforma recompensa claridad y trazabilidad, dos cosas que muchas veces se pierden en redes generalistas.",
    about: "Sobre revisión entre pares ligera y pública",
  },
]

export const editorialPrinciples = [
  {
    title: "Serio, pero cercano",
    copy: "Aquí la ciencia se comunica con criterio, pero también con una voz humana que invita a leer, preguntar y seguir explorando.",
  },
  {
    title: "Lectura amable",
    copy: "La interfaz busca que entender un hallazgo se sienta claro, ligero y disfrutable sin perder profundidad ni profesionalismo.",
  },
  {
    title: "Comunidad confiable",
    copy: "Perfiles verificables, valoraciones visibles y conversación abierta para que divulgar ciencia sea un acto colectivo y creible.",
  },
]

export const conversationComments = [
  {
    author: "Dra. Marta Ruiz",
    role: "Investigadora en polímeros",
    avatar: "https://i.pravatar.cc/120u=marta-ruiz",
    timeAgo: "Hace 28 min",
    comment:
      "Sería muy valioso incluir un apéndice con rangos de temperatura y humedad durante el compostaje para facilitar la reproducibilidad en otros climas.",
  },
  {
    author: "Dr. Samuel Torres",
    role: "Ciencia de materiales",
    avatar: "https://i.pravatar.cc/120u=samuel-torres",
    timeAgo: "Hace 1 h",
    comment:
      "El resumen está muy bien aterrizado. Me gustaría ver una comparación económica con polímeros comerciales en escala piloto.",
  },
]

export const submissionChecklist = [
  "Título claro y orientado a hallazgo, no solo a técnica.",
  "Resumen con impacto científico y social en menos de 120 palabras.",
  "Metodología suficiente para que otra persona entienda el diseño experimental.",
  "Un bloque de discusión que explique límites, utilidad y próximos pasos con un tono claro y humano.",
]

export const profileBadges = [
  { label: "Revisor verificado", tone: "bg-fuchsia-100 text-fuchsia-700" },
  { label: "Divulgador Pro", tone: "bg-purple-100 text-purple-700" },
  { label: "Top 100 LatAm", tone: "bg-amber-100 text-amber-700" },
]

export const orcidWorks = [
  {
    title: "Characterization of sustainable biopolymers from agricultural waste",
    year: 2022,
    type: "Journal Article",
    doi: "10.1016/j.biopoly.2022.10.004",
    journal: "Biopolymers & Sustainability",
  },
  {
    title: "New pathways for cellulose extraction in tropical environments",
    year: 2020,
    type: "Conference Proceeding",
    doi: "10.1109/IEEE.BIO.2020.1234",
    journal: "IEEE Bio-Engineering LatAm",
  },
  {
    title: "Sustainable materials for rural construction: A review",
    year: 2018,
    type: "Book Chapter",
    doi: "",
    journal: "Global Sustainable Development",
  },
]

export const feedArticles: FeedArticle[] = [
  {
    id: "biopolimeros-mesoamerica",
    title: "Avances en la síntesis de biopolímeros a partir de desechos agrícolas en Mesoamérica",
    excerpt:
      "Este estudio explora nuevas métodologías para la extracción de celulosa y su conversión en plásticos biodegradables utilizando enzimas locales.",
    category: "Biotecnología",
    timeAgo: "Hace 2 horas",
    publishedLabel: "Publicado el 24 de mayo, 2024",
    readTime: "8 min de lectura",
    heroKicker: "Aprovechamiento de residuos con enfoque regional",
    tags: ["biomateriales", "economía circular", "open science"],
    metrics: {
      votes: 42,
      comments: 12,
      peerScore: 4.8,
    },
    author: authorProfile,
    contentHtml: articleBody,
  },
  {
    id: "corales-caribe",
    title: "Impacto del cambio climático en los arrecifes de coral del Caribe: una década de señales tempranas",
    excerpt:
      "Una revisión de diez años de datos oceanográficos y biomarcadores muestra patrones consistentes de estrés térmico en arrecifes costeros.",
    category: "Ecología",
    timeAgo: "Hace 5 horas",
    publishedLabel: "Publicado el 18 de mayo, 2024",
    readTime: "6 min de lectura",
    heroKicker: "Lectura crítica para decisiones de conservación",
    tags: ["clima", "caribe", "biodiversidad"],
    metrics: {
      votes: 31,
      comments: 9,
      peerScore: 4.6,
    },
    author: {
      id: "usr_elena",
      name: "Dra. Elena Martínez",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2w=240&h=240&fit=crop",
      role: "Ecología marina",
      affiliation: "Universidad de La Habana",
      orcidId: "0000-0001-5602-9730",
      reputation: 131,
      bio: "Investiga arrecifes coralinos, estrés térmico y políticas de conservación costera.",
      location: "La Habana, Cuba",
    },
    contentHtml: articleBody,
  },
  {
    id: "ia-diagnostico-rural",
    title: "Modelos ligeros de IA para diagnóstico rural: precisión clínica con hardware limitado",
    excerpt:
      "El artículo compara arquitecturas compactas y propone un enfoque híbrido para desplegar inferencia médica en comunidades con baja conectividad.",
    category: "Inteligencia Artificial",
    timeAgo: "Ayer",
    publishedLabel: "Publicado el 11 de mayo, 2024",
    readTime: "7 min de lectura",
    heroKicker: "IA aplicada con foco en accesibilidad",
    tags: ["healthtech", "diagnóstico", "edge ai"],
    metrics: {
      votes: 27,
      comments: 15,
      peerScore: 4.7,
    },
    author: {
      id: "usr_nadia",
      name: "Dra. Nadia López",
      image: "https://images.unsplash.com/photo-1554151228-14d9def656e4w=240&h=240&fit=crop",
      role: "Salud digital",
      affiliation: "Tecnológico de Monterrey",
      orcidId: "0000-0002-7850-3421",
      reputation: 188,
      bio: "Trabaja en sistemas de apoyo clínico, IA explicable y despliegue responsable en contextos de recursos limitados.",
      location: "Monterrey, México",
    },
    contentHtml: articleBody,
  },
]
