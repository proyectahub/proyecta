import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, "..")
const dataDir = path.join(projectRoot, "backend", "data")
const storePath = path.join(dataDir, "store.json")
const backupPath = path.join(dataDir, "store.real-backup.json")

const clone = (value) => JSON.parse(JSON.stringify(value))

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"))
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8")
}

function isoDaysAgo(days, hour = 12, minute = 0) {
  const date = new Date()
  date.setDate(date.getDate() - days)
  date.setHours(hour, minute, 0, 0)
  return date.toISOString()
}

function avatarUrl(name) {
  return `https://ui-avatars.com/api/name=${encodeURIComponent(name)}&background=1d4ed8&color=ffffff`
}

function articleHtml(title, paragraphs) {
  const body = paragraphs.map((paragraph) => `<p>${paragraph}</p>`).join("\n")
  return `<h2>${title}</h2>\n${body}`
}

function makeUser(seed, index) {
  return {
    id: `usr_sim_${String(index + 1).padStart(2, "0")}`,
    name: seed.name,
    email: seed.email,
    password: "simulation-only",
    image: avatarUrl(seed.name),
    role: seed.orcidId  "Divulgador/a científico/a" : "Divulgador/a",
    affiliation: seed.affiliation,
    orcidId: seed.orcidId  "",
    reputation: 0,
    bio: seed.bio,
    location: seed.location,
    createdAt: isoDaysAgo(18 - (index % 10), 8 + (index % 6), 20),
  }
}

function addUniqueById(collection, items) {
  const existing = new Set(collection.map((item) => item.id))
  for (const item of items) {
    if (!existing.has(item.id)) {
      collection.push(item)
      existing.add(item.id)
    }
  }
}

function refreshMetrics(store) {
  for (const post of store.posts) {
    const votes = store.votes.filter((item) => item.articleId === post.id)
    const reviews = store.reviews.filter((item) => item.articleId === post.id)
    const comments = store.comments.filter((item) => item.articleId === post.id)
    const voteScore = votes.reduce((sum, vote) => sum + Number(vote.value  0), 0)
    const ratingTotal = reviews.reduce((sum, review) => sum + Number(review.rating  0), 0)

    post.votes = voteScore
    post.comments = reviews.length + comments.length
    post.peerScore = reviews.length  Number((ratingTotal / reviews.length).toFixed(1)) : 0
  }
}

const userSeeds = [
  {
    alias: "valentina",
    name: "Valentina Soto",
    email: "valentina.soto@nova-sim.org",
    affiliation: "Universidad de Chile",
    location: "Chile",
    orcidId: "0000-0002-4510-1101",
    bio: "Divulga temas de salud pública, datos abiertos y comunicación científica para comunidades locales.",
  },
  {
    alias: "mateo",
    name: "Mateo Alvarez",
    email: "mateo.alvarez@nova-sim.org",
    affiliation: "Universidad Nacional de Colombia",
    location: "Colombia",
    orcidId: "",
    bio: "Escribe sobre ciencia abierta, educación y participación ciudadana en proyectos de investigación.",
  },
  {
    alias: "camila",
    name: "Camila Rojas",
    email: "camila.rojas@nova-sim.org",
    affiliation: "Pontificia Universidad Católica del Perú",
    location: "Perú",
    orcidId: "0000-0002-8123-5402",
    bio: "Trabaja en ecología costera, conservación marina y lectura pública de evidencia ambiental.",
  },
  {
    alias: "diego",
    name: "Diego Paredes",
    email: "diego.paredes@nova-sim.org",
    affiliation: "Tecnológico de Monterrey",
    location: "México",
    orcidId: "",
    bio: "Comparte artículos sobre inteligencia artificial, aprendizaje automático y ética tecnológica.",
  },
  {
    alias: "sofia",
    name: "Sofía Benítez",
    email: "sofia.benitez@nova-sim.org",
    affiliation: "Universidad de Buenos Aires",
    location: "Argentina",
    orcidId: "0000-0003-0199-7721",
    bio: "Investiga materiales biodegradables, economía circular y transferencia de conocimiento.",
  },
  {
    alias: "lucas",
    name: "Lucas Herrera",
    email: "lucas.herrera@nova-sim.org",
    affiliation: "Universidad de la República",
    location: "Uruguay",
    orcidId: "",
    bio: "Interesado en astronomía pública, cielo oscuro y cultura científica.",
  },
  {
    alias: "renata",
    name: "Renata Lima",
    email: "renata.lima@nova-sim.org",
    affiliation: "Universidade de São Paulo",
    location: "Brasil",
    orcidId: "0000-0001-6602-8732",
    bio: "Comunica bioinformática, vigilancia genómica y ciencia de datos para salud.",
  },
  {
    alias: "tomas",
    name: "Tomás Cabrera",
    email: "tomas.cabrera@nova-sim.org",
    affiliation: "Universidad de Costa Rica",
    location: "Costa Rica",
    orcidId: "",
    bio: "Trabaja en agua urbana, ingeniería sostenible y resiliencia climática.",
  },
  {
    alias: "paula",
    name: "Paula Fernández",
    email: "paula.fernandez@nova-sim.org",
    affiliation: "Universidad de Guadalajara",
    location: "México",
    orcidId: "",
    bio: "Divulgadora de educación científica, inclusión y laboratorios escolares.",
  },
  {
    alias: "andres",
    name: "Andrés Quispe",
    email: "andres.quispe@nova-sim.org",
    affiliation: "Universidad Mayor de San Andrés",
    location: "Bolivia",
    orcidId: "0000-0002-3418-9081",
    bio: "Escribe sobre historia de la ciencia andina, archivos y memoria científica regional.",
  },
  {
    alias: "elena",
    name: "Elena Martínez",
    email: "elena.martinez@nova-sim.org",
    affiliation: "Universidad Autónoma de Yucatán",
    location: "México",
    orcidId: "",
    bio: "Aporta lecturas sobre medicina comunitaria, prevención y comunicación de riesgo.",
  },
  {
    alias: "nicolas",
    name: "Nicolás Pereira",
    email: "nicolas.pereira@nova-sim.org",
    affiliation: "Universidad de la Frontera",
    location: "Chile",
    orcidId: "0000-0001-4477-2043",
    bio: "Investiga agrociencias, suelos y adaptación productiva al cambio climático.",
  },
  {
    alias: "karla",
    name: "Karla Méndez",
    email: "karla.mendez@nova-sim.org",
    affiliation: "Universidad Nacional Autónoma de Honduras",
    location: "Honduras",
    orcidId: "",
    bio: "Participa en proyectos de alfabetización científica y narrativas de salud pública.",
  },
  {
    alias: "fernando",
    name: "Fernando Ruiz",
    email: "fernando.ruiz@nova-sim.org",
    affiliation: "Universidad de Panamá",
    location: "Panamá",
    orcidId: "0000-0003-7780-1404",
    bio: "Divulga ciencia de materiales, innovación social y tecnologías apropiadas.",
  },
  {
    alias: "julieta",
    name: "Julieta Vargas",
    email: "julieta.vargas@nova-sim.org",
    affiliation: "Universidad Nacional de Córdoba",
    location: "Argentina",
    orcidId: "",
    bio: "Trabaja en humanidades digitales, repositorios abiertos y memoria pública.",
  },
  {
    alias: "samuel",
    name: "Samuel Ortega",
    email: "samuel.ortega@nova-sim.org",
    affiliation: "Instituto Politécnico Nacional",
    location: "México",
    orcidId: "",
    bio: "Lee y comenta artículos sobre ingeniería, energía y sistemas descentralizados.",
  },
  {
    alias: "ines",
    name: "Inés Romero",
    email: "ines.romero@nova-sim.org",
    affiliation: "Universidad de Puerto Rico",
    location: "Puerto Rico",
    orcidId: "0000-0002-2055-3318",
    bio: "Comunica neurociencias, aprendizaje y cultura científica para públicos amplios.",
  },
  {
    alias: "rodrigo",
    name: "Rodrigo Salazar",
    email: "rodrigo.salazar@nova-sim.org",
    affiliation: "Universidad de El Salvador",
    location: "El Salvador",
    orcidId: "",
    bio: "Acompaña procesos de revisión abierta, comentarios públicos y divulgación comunitaria.",
  },
]

const articleSeeds = [
  {
    id: "art_sim_labs_abiertos_barriales",
    title: "Laboratorios abiertos para resolver problemas de barrio",
    category: "Economia",
    authorAlias: "mateo",
    daysAgo: 2,
    reviewed: true,
    votes: 12,
    excerpt:
      "Una mirada a laboratorios ciudadanos que combinan datos locales, bajo costo y colaboración para resolver necesidades concretas.",
    paragraphs: [
      "Los laboratorios abiertos permiten que estudiantes, docentes, vecinos y especialistas trabajen con preguntas situadas. La innovación no se presenta como un producto cerrado, sino como una conversación verificable.",
      "El reto está en sostener calidad, documentación y seguimiento comunitario. Cuando el conocimiento se abre, también debe cuidarse la trazabilidad de las decisiones.",
    ],
    figureImage:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55fauto=format&fit=crop&w=1200&q=80",
    figureCaption: "Taller colaborativo para prototipar soluciones locales con acompañamiento científico.",
  },
  {
    id: "art_sim_dengue_datos_abiertos",
    title: "Dengue, clima y datos abiertos para prevención comunitaria",
    category: "Salud Publica",
    authorAlias: "elena",
    daysAgo: 3,
    reviewed: true,
    votes: 10,
    excerpt:
      "Cómo la vigilancia ciudadana y los datos climáticos pueden ayudar a anticipar brotes sin caer en alarmismo.",
    paragraphs: [
      "La prevención del dengue requiere datos comprensibles, comunicación clara y participación local. Mapear riesgos no es suficiente si la información no llega a las personas que pueden actuar.",
      "Las plataformas abiertas pueden ayudar a interpretar señales tempranas y convertirlas en acciones de cuidado, siempre con respeto a la privacidad y al contexto territorial.",
    ],
    figureImage:
      "https://images.unsplash.com/photo-1576091160550-2173dba999efauto=format&fit=crop&w=1200&q=80",
    figureCaption: "Lectura pública de datos para fortalecer estrategias comunitarias de prevención.",
  },
  {
    id: "art_sim_corales_pacifico_latam",
    title: "Arrecifes del Pacífico latinoamericano bajo estrés térmico",
    category: "Ecologia",
    authorAlias: "camila",
    daysAgo: 4,
    reviewed: true,
    votes: 8,
    excerpt:
      "Una explicación clara de por qué el calentamiento marino modifica la salud de los corales y afecta economías costeras.",
    paragraphs: [
      "Los arrecifes funcionan como infraestructura viva: protegen costas, sostienen biodiversidad y acompañan economías locales. Su deterioro no es solo un problema ecológico.",
      "Divulgar estos cambios con lenguaje accesible permite conectar monitoreo científico, comunidades pesqueras y políticas de conservación.",
    ],
    figureImage:
      "https://images.unsplash.com/photo-1546026423-cc4642628d2bauto=format&fit=crop&w=1200&q=80",
    figureCaption: "Ecosistemas coralinos como indicadores de estrés ambiental regional.",
  },
  {
    id: "art_sim_ia_diagnostico_rural",
    title: "Inteligencia artificial para apoyar diagnósticos en zonas rurales",
    category: "Inteligencia Artificial",
    authorAlias: "diego",
    daysAgo: 5,
    reviewed: true,
    votes: 9,
    excerpt:
      "Una guía para entender qué puede aportar la IA en salud rural y dónde siguen siendo indispensables las personas.",
    paragraphs: [
      "La IA puede ayudar a priorizar casos, leer patrones y reducir tiempos de espera, pero no reemplaza el juicio clínico ni el vínculo con la comunidad.",
      "Para que una herramienta sea confiable debe explicar sus límites, cuidar sesgos y funcionar con infraestructura realista.",
    ],
    figureImage:
      "https://images.unsplash.com/photo-1518770660439-4636190af475auto=format&fit=crop&w=1200&q=80",
    figureCaption: "Sistemas de apoyo clínico que combinan datos, criterio humano y trazabilidad.",
  },
  {
    id: "art_sim_memoria_cientifica_digital",
    title: "Archivos digitales para preservar memoria científica latinoamericana",
    category: "Humanidades Digitales",
    authorAlias: "julieta",
    daysAgo: 6,
    reviewed: true,
    votes: 7,
    excerpt:
      "Por qué la historia de la ciencia también necesita repositorios abiertos, metadatos claros y narrativas públicas.",
    paragraphs: [
      "Muchas contribuciones científicas regionales quedan dispersas en boletines, tesis, fotografías y archivos personales. Digitalizar no basta: hay que contextualizar.",
      "Las humanidades digitales permiten conectar documentos, instituciones y comunidades para que la memoria científica sea consultable y discutible.",
    ],
    figureImage:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781cauto=format&fit=crop&w=1200&q=80",
    figureCaption: "Digitalización, curaduría y acceso abierto para memoria científica regional.",
  },
  {
    id: "art_sim_neurociencia_aula",
    title: "Neurociencias en el aula sin neuromitos",
    category: "Neurociencias",
    authorAlias: "ines",
    daysAgo: 7,
    reviewed: true,
    votes: 6,
    excerpt:
      "Una lectura para distinguir hallazgos útiles sobre aprendizaje de afirmaciones simplificadas que circulan demasiado rápido.",
    paragraphs: [
      "La neurociencia puede enriquecer la educación cuando se comunica con cautela. No todo hallazgo de laboratorio se traduce directamente en una receta pedagógica.",
      "Un enfoque responsable reconoce evidencia, límites y contexto escolar antes de convertir una idea en recomendación pública.",
    ],
    figureImage:
      "https://images.unsplash.com/photo-1559757175-0eb30cd8c063auto=format&fit=crop&w=1200&q=80",
    figureCaption: "Puentes entre neurociencias, educación y lectura crítica de evidencia.",
  },
  {
    id: "art_sim_bioplasticos_cafe",
    title: "Bioplásticos a partir de residuos de café",
    category: "Ciencia de Materiales",
    authorAlias: "sofia",
    daysAgo: 1,
    reviewed: false,
    votes: 5,
    excerpt:
      "Un artículo abierto a revisión sobre materiales biodegradables obtenidos de subproductos agroindustriales.",
    paragraphs: [
      "Los residuos de café contienen compuestos que pueden transformarse en materiales de interés. Su aprovechamiento puede disminuir desechos y abrir cadenas productivas locales.",
      "La pregunta central es cómo evaluar resistencia, degradabilidad y escalabilidad sin presentar la innovación como una solución automática.",
    ],
    figureImage:
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93auto=format&fit=crop&w=1200&q=80",
    figureCaption: "Residuos agroindustriales como punto de partida para biomateriales regionales.",
  },
  {
    id: "art_sim_cielo_oscuro_norte",
    title: "Cielo oscuro como patrimonio científico y cultural",
    category: "Astronomia",
    authorAlias: "lucas",
    daysAgo: 2,
    reviewed: false,
    votes: 4,
    excerpt:
      "Una invitación a leer la contaminación lumínica como un problema ambiental, educativo y cultural.",
    paragraphs: [
      "La pérdida de cielos oscuros afecta observación astronómica, biodiversidad nocturna y experiencia cultural. No es un tema exclusivo de astrónomos.",
      "Las comunidades pueden medir, mapear y reducir iluminación innecesaria con acciones graduales y evidencia compartida.",
    ],
    figureImage:
      "https://images.unsplash.com/photo-1446776811953-b23d57bd21aaauto=format&fit=crop&w=1200&q=80",
    figureCaption: "Cielo nocturno como recurso científico, educativo y cultural.",
  },
  {
    id: "art_sim_vigilancia_genomica",
    title: "Bioinformática para vigilancia genómica accesible",
    category: "Bioinformatica",
    authorAlias: "renata",
    daysAgo: 3,
    reviewed: false,
    votes: 4,
    excerpt:
      "Cómo explicar secuenciación, linajes y tableros públicos sin convertirlos en una caja negra técnica.",
    paragraphs: [
      "La vigilancia genómica puede apoyar decisiones de salud pública cuando sus resultados se explican con claridad. El reto es traducir datos complejos sin perder precisión.",
      "Una buena divulgación muestra de dónde vienen los datos, qué significan y qué no permiten concluir.",
    ],
    figureImage:
      "https://images.unsplash.com/photo-1581093588401-fbb62a02f120auto=format&fit=crop&w=1200&q=80",
    figureCaption: "Análisis de datos biológicos para seguimiento público de cambios genómicos.",
  },
  {
    id: "art_sim_laboratorios_escolares",
    title: "Laboratorios escolares como semilleros de preguntas",
    category: "Educacion Cientifica",
    authorAlias: "paula",
    daysAgo: 4,
    reviewed: false,
    votes: 3,
    excerpt:
      "Una propuesta para pasar de prácticas cerradas a experiencias donde estudiantes formulen preguntas investigables.",
    paragraphs: [
      "La educación científica gana fuerza cuando el laboratorio deja de ser solo demostración. Preguntar, registrar y conversar resultados también forma criterio.",
      "El acompañamiento docente puede convertir materiales simples en experiencias rigurosas, amables y memorables.",
    ],
    figureImage:
      "https://images.unsplash.com/photo-1532094349884-543bc11b234dauto=format&fit=crop&w=1200&q=80",
    figureCaption: "Aprendizaje experimental centrado en preguntas y conversación pública.",
  },
  {
    id: "art_sim_agua_urbana_resiliencia",
    title: "Agua urbana y resiliencia ante lluvias extremas",
    category: "Ingenieria",
    authorAlias: "tomas",
    daysAgo: 5,
    reviewed: false,
    votes: 3,
    excerpt:
      "Un artículo para revisar soluciones de drenaje, infraestructura verde y participación vecinal en ciudades latinoamericanas.",
    paragraphs: [
      "Las lluvias extremas muestran que la infraestructura no puede pensarse solo como obra gris. La resiliencia urbana combina diseño, mantenimiento y cultura de prevención.",
      "Comunicar riesgos con mapas claros y lenguaje sencillo puede mejorar la toma de decisiones antes de la emergencia.",
    ],
    figureImage:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3eeauto=format&fit=crop&w=1200&q=80",
    figureCaption: "Infraestructura urbana, agua y adaptación climática.",
  },
]

const reviewTemplates = [
  {
    comment: "El artículo comunica bien el problema y permite entender por qué importa más allá del grupo especialista.",
    strengths: "La conexión entre evidencia y contexto regional es clara.",
    improvements: "Podría cerrar con una recomendación práctica más concreta.",
    openQuestions: "¿Qué datos mínimos necesitaría una comunidad para replicar la propuesta",
  },
  {
    comment: "La lectura es clara y mantiene un equilibrio sano entre entusiasmo y cautela.",
    strengths: "Explica conceptos técnicos sin perder rigor.",
    improvements: "Sería útil agregar una fuente o ejemplo adicional para ampliar la trazabilidad.",
    openQuestions: "¿Cómo se podría medir el impacto público de esta propuesta",
  },
  {
    comment: "Aporta contexto y abre preguntas interesantes para seguir conversando en comunidad.",
    strengths: "El tono es accesible y profesional.",
    improvements: "Conviene distinguir con más fuerza entre resultados, interpretación y opinión.",
    openQuestions: "¿Qué limitaciones deberían comunicarse desde el inicio",
  },
]

const commentTemplates = [
  "Me parece valioso que el artículo conecte la evidencia con decisiones cotidianas.",
  "Sería interesante sumar una sección de fuentes recomendadas para lectores que quieran profundizar.",
  "La explicación ayuda a entender el tema sin perder el contexto regional.",
  "Este enfoque puede abrir una buena conversación entre especialistas y público general.",
  "Gracias por mantener un tono claro; ayuda a que el tema sea más accesible.",
  "Me gustaría ver más ejemplos de aplicación local en una actualización futura.",
]

const SIMULATED_USER_TARGET = 100

const generatedFirstNames = [
  "Ana",
  "Bruno",
  "Carolina",
  "Daniel",
  "Estefania",
  "Fabian",
  "Gabriela",
  "Hector",
  "Isabel",
  "Javier",
  "Laura",
  "Miguel",
  "Natalia",
  "Oscar",
  "Patricia",
  "Rafael",
  "Silvia",
  "Uriel",
  "Veronica",
  "Ximena",
]

const generatedLastNames = [
  "Arias",
  "Barrera",
  "Campos",
  "Delgado",
  "Espinoza",
  "Fuentes",
  "Guzman",
  "Ibarra",
  "Lara",
  "Molina",
  "Navarro",
  "Ochoa",
  "Pineda",
  "Ramirez",
  "Serrano",
  "Torres",
  "Valdez",
  "Zamora",
]

const generatedAffiliations = [
  "Comunidad Divulgara",
  "Universidad Nacional Autonoma de Mexico",
  "Universidad de Antioquia",
  "Universidad de Buenos Aires",
  "Universidad de Costa Rica",
  "Universidad de Guadalajara",
  "Universidad de Chile",
  "Pontificia Universidad Catolica del Peru",
  "Universidade de Sao Paulo",
  "Instituto Politecnico Nacional",
]

const generatedLocations = [
  "Mexico",
  "Colombia",
  "Argentina",
  "Chile",
  "Peru",
  "Brasil",
  "Costa Rica",
  "Uruguay",
  "Bolivia",
  "LatAm",
]

const generatedFocus = [
  "salud publica",
  "ciencia abierta",
  "educacion cientifica",
  "biotecnologia",
  "inteligencia artificial",
  "ecologia",
  "humanidades digitales",
  "ingenieria sostenible",
  "economia circular",
  "neurociencias",
]

function buildSimulationSeeds(target) {
  const seeds = [...userSeeds]
  let index = 0

  while (seeds.length < target) {
    const first = generatedFirstNames[index % generatedFirstNames.length]
    const last = generatedLastNames[Math.floor(index / generatedFirstNames.length) % generatedLastNames.length]
    const serial = String(index + 1).padStart(3, "0")
    const focus = generatedFocus[index % generatedFocus.length]

    seeds.push({
      alias: `sim_${serial}`,
      name: `${first} ${last}`,
      email: `${first}.${last}.${serial}@nova-sim.org`.toLowerCase(),
      affiliation: generatedAffiliations[index % generatedAffiliations.length],
      location: generatedLocations[index % generatedLocations.length],
      orcidId:
        index % 4 === 0
           `0000-0002-${String(7000 + index).padStart(4, "0")}-${String(1000 + index).padStart(4, "0")}`
          : "",
      bio: `Divulgador/a de ${focus}; participa en lecturas comunitarias, comentarios y revisiones abiertas dentro de Divulgara.`,
    })
    index += 1
  }

  return seeds
}

const currentStore = readJson(storePath)
let realStore

if (currentStore.__simulationMeta) {
  if (!fs.existsSync(backupPath)) {
    throw new Error("El store actual ya parece simulado, pero no existe un respaldo real para reconstruirlo.")
  }
  realStore = readJson(backupPath)
} else {
  realStore = clone(currentStore)
  writeJson(backupPath, realStore)
}

const store = clone(realStore)
store.users = []
store.posts = []
store.votes = []
store.reviews = []
store.comments = []
store.follows = []
store.categories = []

const simulatedUserIdsInBackup = new Set(
  store.users.filter((user) => String(user.id).startsWith("usr_sim_")).map((user) => user.id),
)
const simulatedPostIdsInBackup = new Set(
  store.posts.filter((post) => String(post.id).startsWith("art_sim_")).map((post) => post.id),
)

store.users = store.users.filter((user) => !simulatedUserIdsInBackup.has(user.id))
store.posts = store.posts.filter((post) => !simulatedPostIdsInBackup.has(post.id))
store.votes = store.votes.filter(
  (vote) =>
    !String(vote.id).startsWith("vote_sim_") &&
    !simulatedUserIdsInBackup.has(vote.userId) &&
    !simulatedPostIdsInBackup.has(vote.articleId),
)
store.reviews = store.reviews.filter(
  (review) =>
    !String(review.id).startsWith("rev_sim_") &&
    !simulatedUserIdsInBackup.has(review.userId) &&
    !simulatedPostIdsInBackup.has(review.articleId),
)
store.comments = store.comments.filter(
  (comment) =>
    !String(comment.id).startsWith("com_sim_") &&
    !simulatedUserIdsInBackup.has(comment.userId) &&
    !simulatedPostIdsInBackup.has(comment.articleId),
)
store.follows = store.follows.filter(
  (follow) =>
    !String(follow.id).startsWith("fol_sim_") &&
    !simulatedUserIdsInBackup.has(follow.followerUserId) &&
    !simulatedUserIdsInBackup.has(follow.followingUserId),
)

writeJson(backupPath, store)

const simulationSeeds = buildSimulationSeeds(SIMULATED_USER_TARGET)
const usersNeeded = Math.max(0, SIMULATED_USER_TARGET - store.users.length)
const simulatedUsers = simulationSeeds.slice(0, usersNeeded).map(makeUser)
addUniqueById(store.users, simulatedUsers)

const aliasToUser = new Map()
for (const user of store.users) {
  if (user.email === "osram90@gmail.com") {
    aliasToUser.set("juan", user)
  }
  if (user.email === "jmreyesrz@hotmail.com") {
    aliasToUser.set("jose", user)
  }
}
for (const user of simulatedUsers) {
  const seed = simulationSeeds.find((item) => item.email === user.email)
  if (seed) {
    aliasToUser.set(seed.alias, user)
  }
}

const getUser = (alias) => aliasToUser.get(alias)
const actorIds = [...aliasToUser.values()].map((user) => user.id)

const seededPosts = articleSeeds
  .map((article, index) => {
    const author = getUser(article.authorAlias)
    if (!author) {
      return null
    }

    return {
      id: article.id,
      title: article.title,
      contentHtml: articleHtml(article.title, article.paragraphs),
      excerpt: article.excerpt,
      category: article.category,
      authorId: author.id,
      createdAt: isoDaysAgo(article.daysAgo, 9 + (index % 6), 15),
      votes: 0,
      comments: 0,
      peerScore: 0,
      readTime: index % 3 === 0  "3 min de lectura" : "2 min de lectura",
      updatedAt: isoDaysAgo(Math.max(0, article.daysAgo - 1), 15, 10),
      figureImage: article.figureImage,
      figureCaption: article.figureCaption,
    }
  })
  .filter(Boolean)

addUniqueById(store.posts, seededPosts)

const seededPostIds = new Set(seededPosts.map((post) => post.id))
const realPost = store.posts.find((post) => post.id === "art_4ce01010-f")
if (realPost) {
  seededPostIds.add(realPost.id)
}

const reviewedPostIds = new Set([
  "art_4ce01010-f",
  ...articleSeeds.filter((article) => article.reviewed).map((article) => article.id),
])

const pickParticipants = (articleId, count, offset = 0) => {
  const post = store.posts.find((item) => item.id === articleId)
  const available = actorIds.filter((userId) => userId && userId !== post.authorId)
  const picked = []

  for (let index = 0; picked.length < count && index < available.length * 2; index += 1) {
    const userId = available[(offset + index) % available.length]
    if (!picked.includes(userId)) {
      picked.push(userId)
    }
  }

  return picked
}

let voteCounter = 1
let reviewCounter = 1
let commentCounter = 1

const voteCountByArticle = new Map(articleSeeds.map((article) => [article.id, article.votes]))
voteCountByArticle.set("art_4ce01010-f", 11)

for (const postId of seededPostIds) {
  const baseVotes = voteCountByArticle.get(postId)  4
  const votesWanted = Math.min(actorIds.length - 1, postId === "art_4ce01010-f"  38 : baseVotes + 14)
  const participants = pickParticipants(postId, votesWanted, voteCounter)
  participants.forEach((userId, index) => {
    store.votes.push({
      id: `vote_sim_${String(voteCounter).padStart(3, "0")}`,
      articleId: postId,
      userId,
      value: 1,
      createdAt: isoDaysAgo(Math.max(0, 6 - (index % 5)), 13, index * 3),
    })
    voteCounter += 1
  })
}

for (const postId of reviewedPostIds) {
  const reviewers = pickParticipants(postId, postId === "art_4ce01010-f"  9 : 5, reviewCounter)
  reviewers.forEach((userId, index) => {
    const template = reviewTemplates[(reviewCounter + index) % reviewTemplates.length]
    const score = Number((4.1 + ((reviewCounter + index) % 5) * 0.15).toFixed(1))

    store.reviews.push({
      id: `rev_sim_${String(reviewCounter).padStart(3, "0")}`,
      articleId: postId,
      userId,
      rating: score,
      clarity: Math.min(5, score + 0.1),
      rigor: score,
      utility: Math.min(5, score + 0.2),
      novelty: Math.max(1, score - 0.2),
      reproducibility: Math.max(1, score - 0.1),
      recommendation: score >= 4.4  "Destacar en la comunidad" : "Publicar con seguimiento",
      comment: template.comment,
      strengths: template.strengths,
      improvements: template.improvements,
      openQuestions: template.openQuestions,
      createdAt: isoDaysAgo(Math.max(0, 5 - (reviewCounter % 4)), 16, reviewCounter % 50),
    })
    reviewCounter += 1
  })
}

for (const postId of seededPostIds) {
  const commentCount = reviewedPostIds.has(postId)  7 : 4
  const commenters = pickParticipants(postId, commentCount, commentCounter + 2)

  commenters.forEach((userId, index) => {
    store.comments.push({
      id: `com_sim_${String(commentCounter).padStart(3, "0")}`,
      articleId: postId,
      userId,
      comment: commentTemplates[(commentCounter + index) % commentTemplates.length],
      createdAt: isoDaysAgo(Math.max(0, 4 - (commentCounter % 4)), 18, commentCounter % 50),
    })
    commentCounter += 1
  })
}

const followPairs = []
const juan = getUser("juan")
if (juan) {
  for (const alias of ["valentina", "mateo", "camila", "diego", "sofia", "lucas", "renata", "elena"]) {
    const follower = getUser(alias)
    if (follower) {
      followPairs.push([follower.id, juan.id])
    }
  }

  for (const alias of ["valentina", "diego", "renata", "julieta"]) {
    const followed = getUser(alias)
    if (followed) {
      followPairs.push([juan.id, followed.id])
    }
  }
}

for (const [leftAlias, rightAlias] of [
  ["camila", "sofia"],
  ["sofia", "fernando"],
  ["diego", "renata"],
  ["paula", "ines"],
  ["tomas", "samuel"],
  ["andres", "julieta"],
  ["karla", "valentina"],
  ["rodrigo", "mateo"],
  ["nicolas", "camila"],
  ["elena", "karla"],
]) {
  const left = getUser(leftAlias)
  const right = getUser(rightAlias)
  if (left && right) {
    followPairs.push([left.id, right.id])
  }
}

const generatedNetworkUsers = simulatedUsers.slice(0, SIMULATED_USER_TARGET)
generatedNetworkUsers.forEach((user, index) => {
  const next = generatedNetworkUsers[(index + 7) % generatedNetworkUsers.length]
  const peer = generatedNetworkUsers[(index + 19) % generatedNetworkUsers.length]

  if (next) {
    followPairs.push([user.id, next.id])
  }

  if (peer && index % 2 === 0) {
    followPairs.push([user.id, peer.id])
  }
})

const existingFollowPairs = new Set(
  store.follows.map((follow) => `${follow.followerUserId}:${follow.followingUserId}`),
)
followPairs.forEach(([followerUserId, followingUserId], index) => {
  const key = `${followerUserId}:${followingUserId}`
  if (followerUserId !== followingUserId && !existingFollowPairs.has(key)) {
    store.follows.push({
      id: `fol_sim_${String(index + 1).padStart(3, "0")}`,
      followerUserId,
      followingUserId,
      createdAt: isoDaysAgo(10 - (index % 8), 11, index),
    })
    existingFollowPairs.add(key)
  }
})

refreshMetrics(store)

store.__simulationMeta = {
  mode: "community-simulation",
  seededAt: new Date().toISOString(),
  backupFile: path.basename(backupPath),
  note: "Datos simulados para mostrar actividad comunitaria. Restaurar con npm run restore:real.",
}

writeJson(storePath, store)

console.log(
  JSON.stringify(
    {
      ok: true,
      mode: store.__simulationMeta.mode,
      users: store.users.length,
      posts: store.posts.length,
      reviewedArticles: store.posts.filter((post) => Number(post.peerScore  0) > 0).length,
      openArticles: store.posts.filter((post) => Number(post.peerScore  0) <= 0).length,
      reviews: store.reviews.length,
      comments: store.comments.length,
      votes: store.votes.length,
      follows: store.follows.length,
      backup: backupPath,
    },
    null,
    2,
  ),
)
