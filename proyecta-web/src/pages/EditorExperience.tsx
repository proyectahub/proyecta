import { useEffect, useRef, useState } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import Underline from "@tiptap/extension-underline"
import Link from "@tiptap/extension-link"
import Image from "@tiptap/extension-image"
import {
  Bold,
  ChevronLeft,
  FileUp,
  Heading1,
  Heading2,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Plus,
  Quote,
  Save,
  Send,
  ShieldCheck,
  Trash2,
  Type,
  Underline as UnderlineIcon,
} from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"
import { toast } from "react-hot-toast"
import mammoth from "mammoth"
import * as pdfjsLib from "pdfjs-dist"
import { categoryLabels, submissionChecklist, type ArticleSource } from "../data/mockData"
import { useAuth } from "../context/AuthContext"
import { ProyectaMark } from "../components/brand/ProyectaBrand"

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

type CategoryGroup = {
  family: string
  categories: string[]
}

type SourceField = keyof ArticleSource

const editorialValues = [
  {
    title: "Respeto entre pares",
    copy: "Se debate con ideas, evidencia y preguntas, nunca con descalificaciones personales, sarcasmo hostil o ataques a la trayectoria de otra persona.",
  },
  {
    title: "Rigor sin distorsion",
    copy: "Divulgar no significa exagerar hallazgos ni prometer lo que la evidencia no sostiene. Aquí importa explicar con claridad sin sacrificar precisiï¿½n.",
  },
  {
    title: "Fuentes y contexto",
    copy: "Todo artículo debe ayudar a ubicar de donde viene el hallazgo, que límites tiene y por que vale la pena leerlo dentro de un contexto científico y social.",
  },
  {
    title: "Ciencia para dialogar",
    copy: "Proyecta busca abrir la ciencia a comunidades científicas y no científicas. La meta es hacerla más comprensible, más publica y más humana.",
  },
]

const minimumWordCount = 180

const articleTemplateSections = [
  {
    title: "Idea central",
    copy: "Resume en pocas lineas cual es la pregunta, el hallazgo o la idea principal del artculo.",
  },
  {
    title: "Por que importa",
    copy: "Explica el valor científico, educativo o social del tema para la comunidad que lo leera.",
  },
  {
    title: "Metodo o ruta de trabajo",
    copy: "Cuenta que se hizo, que se observo o como se construyo el argumento sin perder claridad.",
  },
  {
    title: "Resultados clave",
    copy: "Destaca los hallazgos más importantes con lenguaje sobrio, entendible y verificable.",
  },
  {
    title: "Límites y cautelas",
    copy: "Aclara que no puede concluirse todav?a, que falta revisar o en que condiciones aplica.",
  },
  {
    title: "Fuentes consultables",
    copy: "Aï¿½ade referencias reales para que el artculo pueda seguirse, verificarse y luego exportarse con formato acadï¿½mico.",
  },
] as const

const articleTemplateHtml = `
  <h2>Idea central</h2>
  <p>Resume en 2 o 3 frases cual es la pregunta, el hallazgo o la idea principal de tu artculo de divulgación.</p>

  <h2>Por que importa</h2>
  <p>Explica por que este tema merece atencion científica o publica y que aporta a la conversación.</p>

  <h2>Metodo o ruta de trabajo</h2>
  <p>Describe que se hizo, que se observo o desde que evidencia parte el artculo.</p>

  <h2>Resultados clave</h2>
  <p>Presenta los hallazgos principales con lenguaje claro, sin exageraciones ni promesas que la evidencia no sostenga.</p>

  <h2>Límites y cautelas</h2>
  <p>Señala que límites tiene el estudio, que preguntas siguen abiertas o que contexto conviene tener presente.</p>

  <h2>Conclusion</h2>
  <p>Cierra con la idea principal y con una invitacion a seguir leyendo, revisando o dialogando sobre el tema.</p>
`

const createEmptySource = (): ArticleSource => ({
  title: "",
  publisher: "",
  url: "",
})

function normalizeEditorSources(rawSources: ArticleSource[] | undefined) {
  if (!Array.isArray(rawSources)) {
    return []
  }

  return rawSources
    .map((source) => ({
      title: String(source.title ?? "").trim(),
      publisher: String(source.publisher ?? "").trim(),
      url: String(source.url ?? "").trim(),
    }))
    .filter((source) => source.title || source.publisher || source.url)
}

export default function EditorExperience() {
  const { id } = useParams()
  const apiBaseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:3000"
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("")
  const [figureImage, setFigureImage] = useState("")
  const [figureCaption, setFigureCaption] = useState("")
  const [sources, setSources] = useState<ArticleSource[]>([createEmptySource()])
  const [categories, setCategories] = useState<string[]>(categoryLabels.map((item) => item.normalize("NFD").replace(/[\u0300-\u036f]/g, "")))
  const [categoryGroups, setCategoryGroups] = useState<CategoryGroup[]>([])
  const [newCategory, setNewCategory] = useState("")
  const [isAddingCategory, setIsAddingCategory] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [isReadingFigure, setIsReadingFigure] = useState(false)
  const [wordCount, setWordCount] = useState(0)
  const [saveLabel, setSaveLabel] = useState("Sin guardar")
  const [isLoadingArticle, setIsLoadingArticle] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const figureInputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const { refreshUser } = useAuth()

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
      }),
      Image,
      Placeholder.configure({
        placeholder: "Escribe tu hallazgo con claridad, calidez y rigor...",
      }),
    ],
    content: "",
    editorProps: {
      attributes: {
        class: "nova-prose min-h-[460px] focus:outline-none",
      },
    },
    onUpdate({ editor: currentEditor }) {
      const text = currentEditor.getText().trim()
      setWordCount(text ? text.split(/\s+/).length : 0)
    },
  })

  useEffect(() => {
    const controller = new AbortController()

    async function loadCommunityMeta() {
      try {
        const response = await fetch(`${apiBaseUrl}/api/meta/community`, {
          signal: controller.signal,
        })
        if (!response.ok) {
          return
        }

        const data = await response.json()
        if (Array.isArray(data.categories) && data.categories.length > 0) {
          setCategories(data.categories)
        }
        if (Array.isArray(data.categoryGroups)) {
          setCategoryGroups(data.categoryGroups)
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Community meta error:", error)
        }
      }
    }

    void loadCommunityMeta()
    return () => controller.abort()
  }, [apiBaseUrl])

  useEffect(() => {
    if (!id || !editor) {
      return
    }

    const token = window.localStorage.getItem("proyecta-session-token")
    const controller = new AbortController()

    async function loadArticle() {
      setIsLoadingArticle(true)
      try {
        const response = await fetch(`${apiBaseUrl}/api/articles/${id}`, {
          signal: controller.signal,
          headers: token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : undefined,
        })

        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.error ?? "No fue posible cargar la publicaciï¿½n.")
        }

        setTitle(data.title ?? "")
        setCategory(data.category ?? "")
        setFigureImage(data.figureImage ?? "")
        setFigureCaption(data.figureCaption ?? "")
        setSources(normalizeEditorSources(data.sources).length ? normalizeEditorSources(data.sources) : [createEmptySource()])
        editor.commands.setContent(data.contentHtml ?? "")
      } catch (error) {
        if (!controller.signal.aborted) {
          const message = error instanceof Error ? error.message : "No fue posible cargar la publicaciï¿½n."
          toast.error(message)
          navigate(-1)
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingArticle(false)
        }
      }
    }

    void loadArticle()
    return () => controller.abort()
  }, [apiBaseUrl, editor, id, navigate])

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    setIsImporting(true)
    const toastId = toast.loading("Procesando documento...")

    try {
      if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        const reader = new FileReader()
        reader.onload = async (readerEvent) => {
          const arrayBuffer = readerEvent.target.result as ArrayBuffer
          const result = await mammoth.convertToHtml({ arrayBuffer })
          editor.commands.setContent(result.value)
          toast.success("Documento DOCX importado correctamente", { id: toastId })
        }
        reader.readAsArrayBuffer(file)
      } else if (file.type === "application/pdf") {
        const reader = new FileReader()
        reader.onload = async (readerEvent) => {
          const typedarray = new Uint8Array(readerEvent.target.result as ArrayBuffer)
          const pdf = await pdfjsLib.getDocument(typedarray).promise
          let fullText = ""

          for (let index = 1; index <= pdf.numPages; index += 1) {
            const page = await pdf.getPage(index)
            const textContent = await page.getTextContent()
            const pageText = textContent.items.map((item) => ("str" in item ? item.str : "")).join(" ")
            fullText += `<p>${pageText}</p>`
          }

          editor.commands.setContent(fullText)
          toast.success("Texto de PDF extraido correctamente", { id: toastId })
        }
        reader.readAsArrayBuffer(file)
      } else {
        toast.error("Formato no soportado. Usa PDF o DOCX.", { id: toastId })
      }
    } catch (error) {
      console.error(error)
      toast.error("Error al procesar el archivo", { id: toastId })
    } finally {
      setIsImporting(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const saveDraft = () => {
    const now = new Intl.DateTimeFormat("es-MX", {
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date())

    setSaveLabel(`Guardado a las ${now}`)
    toast.success("Borrador guardado localmente")
  }

  const handleFigureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Selecciona una imagen válida para acompaï¿½ar tu publicación.")
      return
    }

    if (file.size > 4 * 1024 * 1024) {
      toast.error("La figura principal debe pesar menos de 4 MB.")
      return
    }

    setIsReadingFigure(true)

    try {
      const imageDataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(String(reader.result ?? ""))
        reader.onerror = () => reject(new Error("No fue posible leer la imagen seleccionada."))
        reader.readAsDataURL(file)
      })

      setFigureImage(imageDataUrl)
      setFigureCaption((current) => current || `Figura principal: ${file.name.replace(/\.[^.]+$/, "")}`)
      setSaveLabel("Sin guardar")
      toast.success("Figura principal agregada al borrador.")
    } catch (error) {
      const message = error instanceof Error ? error.message : "No fue posible cargar la figura."
      toast.error(message)
    } finally {
      setIsReadingFigure(false)
      if (figureInputRef.current) {
        figureInputRef.current.value = ""
      }
    }
  }

  const handleInsertArticleTemplate = () => {
    const currentHtml = editor.getHTML().trim()
    const hasCurrentContent = editor.getText().trim().length > 0

    if (hasCurrentContent) {
      editor.commands.setContent(`${currentHtml}${articleTemplateHtml}`)
      toast.success("La plantilla editorial se agrego al final del borrador.")
    } else {
      editor.commands.setContent(articleTemplateHtml)
      toast.success("La plantilla editorial ya esta lista para guiar tu escritura.")
    }

    editor.commands.focus("end")
    setSaveLabel("Sin guardar")
  }

  const handleSourceChange = (index: number, field: SourceField, value: string) => {
    setSources((current) =>
      current.map((source, sourceIndex) =>
        sourceIndex === index
          ? {
              ...source,
              [field]: value,
            }
          : source,
      ),
    )
    setSaveLabel("Sin guardar")
  }

  const handleAddSource = () => {
    setSources((current) => {
      if (current.length >= 6) {
        return current
      }

      return [...current, createEmptySource()]
    })
    setSaveLabel("Sin guardar")
  }

  const handleRemoveSource = (index: number) => {
    setSources((current) => {
      const next = current.filter((_, sourceIndex) => sourceIndex !== index)
      return next.length ? next : [createEmptySource()]
    })
    setSaveLabel("Sin guardar")
  }

  const handleAddCategory = async () => {
    const token = window.localStorage.getItem("proyecta-session-token")
    if (!token) {
      toast.error("Inicia sesión para agregar nuevas areas.")
      navigate("/login")
      return
    }

    if (!newCategory.trim()) {
      toast.error("Escribe el nombre del area que quieres agregar.")
      return
    }

    setIsAddingCategory(true)
    const toastId = toast.loading("Agregando area...")

    try {
      const response = await fetch(`${apiBaseUrl}/api/meta/community/categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          label: newCategory.trim(),
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error ?? "No fue posible agregar el area.")
      }

      if (Array.isArray(data.categories)) {
        setCategories(data.categories)
      }
      if (Array.isArray(data.categoryGroups)) {
        setCategoryGroups(data.categoryGroups)
      }
      setCategory(data.label ?? newCategory.trim())
      setNewCategory("")
      toast.success(
        data.added
          ? `Area agregada al catalogo en ${data.family ?? "Interdisciplina"}.`
          : "Esa area ya existia y ya puedes usarla.",
        { id: toastId },
      )
    } catch (error) {
      const message = error instanceof Error ? error.message : "No fue posible agregar el area."
      toast.error(message, { id: toastId })
    } finally {
      setIsAddingCategory(false)
    }
  }

  const publishArticle = async () => {
    if (!title || editor.isEmpty || !category) {
      toast.error("Agrega título, area científica y contenido antes de publicar.")
      return
    }

    if (!figureImage) {
      toast.error("Agrega una imagen o figura principal antes de publicar.")
      return
    }

    if (wordCount < minimumWordCount) {
      toast.error(`Tu publicación necesita al menos ${minimumWordCount} palabras para salir del borrador.`)
      return
    }

    const token = window.localStorage.getItem("proyecta-session-token")
    if (!token) {
      toast.error("Inicia sesión para publicar.")
      navigate("/login")
      return
    }

    const draftSources = sources.map((source) => ({
      title: String(source.title ?? "").trim(),
      publisher: String(source.publisher ?? "").trim(),
      url: String(source.url ?? "").trim(),
    }))
    const hasIncompleteSource = draftSources.some(
      (source) => (source.title || source.publisher || source.url) && (!source.title || !source.url),
    )
    if (hasIncompleteSource) {
      toast.error("Cada fuente debe incluir al menos título y enlace consultable.")
      return
    }

    const hasInvalidSourceUrl = draftSources.some(
      (source) => source.url && !/^https:\/\//i.test(source.url),
    )
    if (hasInvalidSourceUrl) {
      toast.error("Cada enlace debe comenzar con http:// o https://.")
      return
    }

    const normalizedSources = draftSources.filter(
      (source) => source.title || source.publisher || source.url,
    )
    const plainText = editor.getText().trim()
    const excerpt = `${plainText.slice(0, 170)}${plainText.length > 170 ? "..." : ""}`
    const loadingToast = toast.loading(id ? "Actualizando artículo..." : "Publicando artículo...")

    try {
      const response = await fetch(id ? `${apiBaseUrl}/api/posts/${id}` : `${apiBaseUrl}/api/posts`, {
        method: id ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          contentHtml: editor.getHTML(),
          excerpt,
          category,
          figureImage,
          figureCaption,
          sources: normalizedSources,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error ?? "No fue posible publicar.")
      }

      if (figureImage && !String(data.figureImage ?? "").trim()) {
        throw new Error("La figura no se guardo correctamente. Vuelve a actualizar la publicación.")
      }

      await refreshUser()

      const articleId = data.id

      toast.success(
        id ? "Artículo actualizado." : "¡Artículo publicado! Aparecerá en el feed 'Por revisar'.",
        { id: loadingToast, duration: 5000 }
      )

      navigate(`/article/${articleId}`)
    } catch (error) {
      const message = error instanceof Error ? error.message : "No fue posible publicar."
      toast.error(message, { id: loadingToast })
    }
  }

  if (!editor) {
    return null
  }

  const readingEstimate = Math.max(1, Math.ceil(wordCount / 210))
  const hasTitle = title.trim().length > 0
  const hasCategory = category.trim().length > 0
  const hasBody = !editor.isEmpty && wordCount > 0
  const hasFigure = Boolean(figureImage)
  const normalizedSources = normalizeEditorSources(sources)
  const hasSources = normalizedSources.some((source) => source.title && source.url)
  const meetsWordCount = wordCount >= minimumWordCount
  const integrityLabel =
    hasTitle && hasCategory && hasBody && hasFigure && meetsWordCount
      ? "Alta"
      : hasBody
        ? "En proceso"
        : "Base"
  const publicationRequirements = [
    {
      label: "T?tulo, ?rea y cuerpo",
      detail: hasTitle && hasCategory && hasBody ? "Listo para circular" : "Completa t?tulo, ?rea y contenido",
      ready: hasTitle && hasCategory && hasBody,
    },
    {
      label: "Extensi?n m?nima",
      detail: meetsWordCount ? `${wordCount} palabras: cumples el m?nimo editorial` : `M?nimo ${minimumWordCount} palabras para publicar`,
      ready: meetsWordCount,
    },
    {
      label: "Figura principal obligatoria",
      detail: hasFigure ? "El artículo ya tiene una imagen o figura principal" : "Agrega una figura original o con atribuci?n clara antes de publicar",
      ready: hasFigure,
    },
    {
      label: "Fuentes consultables",
      detail: hasSources
        ? `${normalizedSources.length} fuente(s) lista(s) para futuras referencias PDF y metadatos editoriales`
        : "Recomendado: agrega fuentes reales para fortalecer el artículo y preparar DOI/PDF",
      ready: hasSources,
    },
  ]

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <section className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <button onClick={() => navigate(-1)} className="nova-button-soft px-4 py-2.5">
            <ChevronLeft size={18} />
            Volver
          </button>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => fileInputRef.current.click()}
              disabled={isImporting}
              className="nova-button-soft px-4 py-2.5 disabled:opacity-50"
            >
              <FileUp size={18} />
              Importar PDF/DOCX
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              accept=".pdf,.docx"
            />
            <input
              type="file"
              ref={figureInputRef}
              onChange={handleFigureUpload}
              className="hidden"
              accept="image/*"
            />

            <button onClick={saveDraft} className="nova-button-soft px-4 py-2.5">
              <Save size={18} />
              Guardar borrador
            </button>

            <button onClick={publishArticle} className="nova-button-solid px-5 py-2.5" disabled={isLoadingArticle}>
              <Send size={18} />
              {id ? "Actualizar" : "Publicar"}
            </button>
          </div>
        </div>

        <div className="nova-shell p-6 md:p-8">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <div className="inline-flex items-center gap-3 rounded-full border border-fuchsia-100 bg-fuchsia-50/80 px-3 py-2">
                  <ProyectaMark size={28} glow={false} />
                  <p className="nova-eyebrow text-fuchsia-600">Editor Proyecta</p>
                </div>
                <h1 className="nova-title mt-2 text-3xl font-extrabold text-slate-900">
                  {id ? "Refina tu publicación desde el perfil" : "Comparte ciencia de forma clara, amable y profesional"}
                </h1>
              </div>

              <div className="rounded-full bg-slate-50 px-4 py-2 text-sm font-medium text-slate-500">
                {saveLabel}
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-start">
              <input
                type="text"
                placeholder="Título de la publicación..."
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="w-full border-none bg-transparent p-0 nova-title text-4xl font-extrabold text-slate-900 outline-none placeholder:text-slate-200 md:text-[3.6rem]"
              />
              <button
                type="button"
                onClick={() => figureInputRef.current.click()}
                disabled={isReadingFigure}
                className="nova-button-soft justify-center px-4 py-3 disabled:opacity-60"
              >
                <ImageIcon size={18} />
                {figureImage ? "Cambiar figura" : "Adjuntar imagen o figura"}
              </button>
            </div>

            {figureImage ? (
              <div className="rounded-[28px] border border-slate-200 bg-slate-50/70 p-4">
                <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
                  <div className="overflow-hidden rounded-[24px] border border-white/80 bg-white">
                    <img
                      src={figureImage}
                      alt={figureCaption || "Figura principal de la publicación"}
                      className="h-full min-h-[180px] w-full object-cover"
                    />
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                        Figura principal
                      </p>
                      <p className="mt-2 text-sm leading-7 text-slate-600">
                        Esta imagen acompaï¿½a tu publicación desde el inicio y ayuda a dar contexto visual a la lectura.
                      </p>
                    </div>

                    <label className="block">
                      <span className="mb-2 block text-sm font-semibold text-slate-600">
                        Pie de figura o descripcion
                      </span>
                      <input
                        type="text"
                        value={figureCaption}
                        onChange={(event) => setFigureCaption(event.target.value)}
                        placeholder="Ejemplo: Esquema general del método, micrografia o figura de apoyo."
                        className="nova-field"
                      />
                    </label>

                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => figureInputRef.current.click()}
                        className="nova-button-soft px-4 py-2.5"
                      >
                        <ImageIcon size={16} />
                        Cambiar imagen
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setFigureImage("")
                          setFigureCaption("")
                        }}
                        className="nova-button-soft px-4 py-2.5"
                      >
                        <Trash2 size={16} />
                        Quitar figura
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50/60 p-4 text-sm leading-7 text-slate-500">
                Puedes adjuntar una imagen, esquema o figura principal junto al título para dar contexto visual a tu publicación.
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_260px]">
              <div className="rounded-[24px] border border-fuchsia-100 bg-fuchsia-50/60 p-4 text-sm leading-7 text-fuchsia-900">
                  Seleccionar un área científica organiza el feed, mejora el descubrimiento y ayuda a que la comunidad encuentre tu artículo con más facilidad. La idea es comunicar ciencia con criterio, pero también con una lectura amable.
              </div>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-600">Ãrea científica</span>
                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  className="nova-field"
                >
                  <option value="">Selecciona un área</option>
                  {(categoryGroups.length ? categoryGroups : [{ family: "Áreas", categories }]).map((group) => (
                    <optgroup key={group.family} label={group.family}>
                      {group.categories.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </label>
            </div>

            <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
              <input
                type="text"
                value={newCategory}
                onChange={(event) => setNewCategory(event.target.value)}
                placeholder="Agregar nueva área o disciplina..."
                className="nova-field"
              />
              <button
                onClick={handleAddCategory}
                disabled={isAddingCategory}
                className="nova-button-soft justify-center disabled:opacity-60"
              >
                <Plus size={16} />
                Agregar área
              </button>
            </div>
            <p className="text-sm leading-7 text-slate-500">
              Las áreas se agrupan automáticamente por familias como ciencias de la vida, ciencias físicas, ingenierías, ciencias sociales, humanidades e interdisciplina.
            </p>

            <div className="rounded-[28px] border border-slate-200 bg-slate-50/80 p-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                    <Type size={14} />
                    Patron editorial sugerido
                  </div>
                  <h2 className="nova-title text-2xl font-extrabold text-slate-900">
                    Una guia amable para escribir un artculo de divulgación
                  </h2>
                  <p className="max-w-3xl text-sm leading-7 text-slate-600">
                    Este patrï¿½n te ayuda a ordenar la idea central, la relevancia, el método, los resultados, las cautelas y las fuentes. También deja mejor preparada la publicación para una futura exportaciï¿½n en PDF acadï¿½mico y metadatos editoriales más sï¿½lidos.
                  </p>
                </div>

                <button type="button" onClick={handleInsertArticleTemplate} className="nova-button-soft px-4 py-2.5">
                  <Plus size={16} />
                  Insertar plantilla guiada
                </button>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {articleTemplateSections.map((section) => (
                  <div key={section.title} className="rounded-[22px] border border-white/80 bg-white p-4">
                    <p className="text-sm font-bold text-slate-900">{section.title}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{section.copy}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1 rounded-[24px] border border-slate-100 bg-slate-50/80 p-2">
              <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={`rounded-2xl p-2 transition ${
                  editor.isActive("heading", { level: 1 }) ? "bg-fuchsia-50 text-fuchsia-600" : "text-slate-600 hover:bg-white"
                }`}
              >
                <Heading1 size={20} />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={`rounded-2xl p-2 transition ${
                  editor.isActive("heading", { level: 2 }) ? "bg-fuchsia-50 text-fuchsia-600" : "text-slate-600 hover:bg-white"
                }`}
              >
                <Heading2 size={20} />
              </button>
              <div className="mx-1 h-6 w-px bg-slate-200" />
              <button
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`rounded-2xl p-2 transition ${
                  editor.isActive("bold") ? "bg-fuchsia-50 text-fuchsia-600" : "text-slate-600 hover:bg-white"
                }`}
              >
                <Bold size={20} />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`rounded-2xl p-2 transition ${
                  editor.isActive("italic") ? "bg-fuchsia-50 text-fuchsia-600" : "text-slate-600 hover:bg-white"
                }`}
              >
                <Italic size={20} />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                className={`rounded-2xl p-2 transition ${
                  editor.isActive("underline") ? "bg-fuchsia-50 text-fuchsia-600" : "text-slate-600 hover:bg-white"
                }`}
              >
                <UnderlineIcon size={20} />
              </button>
              <div className="mx-1 h-6 w-px bg-slate-200" />
              <button
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`rounded-2xl p-2 transition ${
                  editor.isActive("bulletList") ? "bg-fuchsia-50 text-fuchsia-600" : "text-slate-600 hover:bg-white"
                }`}
              >
                <List size={20} />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={`rounded-2xl p-2 transition ${
                  editor.isActive("orderedList") ? "bg-fuchsia-50 text-fuchsia-600" : "text-slate-600 hover:bg-white"
                }`}
              >
                <ListOrdered size={20} />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={`rounded-2xl p-2 transition ${
                  editor.isActive("blockquote") ? "bg-fuchsia-50 text-fuchsia-600" : "text-slate-600 hover:bg-white"
                }`}
              >
                <Quote size={20} />
              </button>
              <div className="mx-1 h-6 w-px bg-slate-200" />
              <button className="rounded-2xl p-2 text-slate-600 transition hover:bg-white">
                <LinkIcon size={20} />
              </button>
              <button
                type="button"
                onClick={() => figureInputRef.current.click()}
                className="rounded-2xl p-2 text-slate-600 transition hover:bg-white"
              >
                <ImageIcon size={20} />
              </button>
            </div>

            <EditorContent editor={editor} />

            <div className="rounded-[28px] border border-slate-200 bg-slate-50/80 p-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-2">
                  <p className="nova-eyebrow">Fuentes consultables</p>
                  <h2 className="nova-title text-2xl font-extrabold text-slate-900">
                    Referencias reales para fortalecer el artculo
                  </h2>
                  <p className="max-w-3xl text-sm leading-7 text-slate-600">
                    Puedes citar artículos científicos, DOIs, repositorios, preprints, datos abiertos, sitios institucionales o informes técnicos. Estas fuentes viajarï¿½n con la publicación y ayudarn a una futura salida en PDF con estilo acadï¿½mico.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddSource}
                  disabled={sources.length >= 6}
                  className="nova-button-soft px-4 py-2.5 disabled:opacity-60"
                >
                  <Plus size={16} />
                  Agregar fuente
                </button>
              </div>

              <div className="mt-5 space-y-4">
                {sources.map((source, index) => (
                  <div key={`${index}-${source.title}-${source.url}`} className="rounded-[24px] border border-white/80 bg-white p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-sm font-bold uppercase tracking-[0.16em] text-slate-500">
                        Fuente {index + 1}
                      </p>
                      <button
                        type="button"
                        onClick={() => handleRemoveSource(index)}
                        className="nova-button-soft px-3 py-2"
                      >
                        <Trash2 size={16} />
                        Quitar
                      </button>
                    </div>

                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      <label className="block md:col-span-2">
                        <span className="mb-2 block text-sm font-semibold text-slate-600">Título de la fuente</span>
                        <input
                          type="text"
                          value={source.title}
                          onChange={(event) => handleSourceChange(index, "title", event.target.value)}
                          placeholder="Ejemplo: Título del artculo, preprint o recurso consultado"
                          className="nova-field"
                        />
                      </label>

                      <label className="block">
                        <span className="mb-2 block text-sm font-semibold text-slate-600">Editorial o procedencia</span>
                        <input
                          type="text"
                          value={source.publisher}
                          onChange={(event) => handleSourceChange(index, "publisher", event.target.value)}
                          placeholder="Nature, SciELO, arXiv, universidad, repositorio..."
                          className="nova-field"
                        />
                      </label>

                      <label className="block">
                        <span className="mb-2 block text-sm font-semibold text-slate-600">Enlace consultable</span>
                        <input
                          type="url"
                          value={source.url}
                          onChange={(event) => handleSourceChange(index, "url", event.target.value)}
                          placeholder="https://doi.org/... o https://..."
                          className="nova-field"
                        />
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <aside className="space-y-6 xl:sticky xl:top-28 xl:self-start">
        <section className="nova-card p-6">
          <div className="space-y-4">
            <div>
              <p className="nova-eyebrow">Estado editorial</p>
              <h2 className="nova-title mt-2 text-2xl font-extrabold text-slate-900">
                {meetsWordCount && hasTitle && hasCategory && hasBody && hasFigure
                  ? "Tu borrador ya cumple la base editorial"
                  : "Tu borrador ya tiene una direccion clara"}
              </h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
              <div className="rounded-[22px] bg-slate-50/80 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Palabras</p>
                <p className="nova-title mt-2 text-2xl font-extrabold text-slate-900">{wordCount}</p>
              </div>
              <div className="rounded-[22px] bg-slate-50/80 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                  Lectura estimada
                </p>
                <p className="nova-title mt-2 text-2xl font-extrabold text-slate-900">
                  {readingEstimate} min
                </p>
              </div>
              <div className="rounded-[22px] bg-slate-50/80 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Integridad</p>
                <p className="nova-title mt-2 text-2xl font-extrabold text-slate-900">{integrityLabel}</p>
              </div>
            </div>

            <div className="rounded-[24px] border border-fuchsia-100 bg-fuchsia-50/80 p-4 text-sm leading-7 text-fuchsia-800">
              <div className="mb-2 flex items-center gap-2 font-semibold">
                <ShieldCheck size={16} />
                Requisitos para publicar en Proyecta
              </div>
                  Para publicar pedimos un artículo claro, con area científica definida, una extensin mnima de {minimumWordCount} palabras y una figura principal. La imagen debe ser original o contar con atribucin y contexto suficiente para circular de forma responsable.
            </div>

            <div className="grid gap-3">
              {publicationRequirements.map((item) => (
                <div
                  key={item.label}
                  className={`rounded-[22px] border p-4 ${
                    item.ready ? "border-emerald-100 bg-emerald-50/70" : "border-slate-200 bg-slate-50/80"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-bold text-slate-900">{item.label}</p>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.16em] ${
                        item.ready ? "bg-emerald-100 text-emerald-700" : "bg-white text-slate-500"
                      }`}
                    >
                      {item.ready ? "Cumplido" : "Pendiente"}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="nova-card p-6">
          <p className="nova-eyebrow">Etica y filosofia editorial</p>
          <div className="mt-4 space-y-3">
            {editorialValues.map((item) => (
              <div key={item.title} className="rounded-[22px] bg-slate-50/80 p-4">
                <p className="font-bold text-slate-900">{item.title}</p>
                <p className="mt-2 text-sm leading-7 text-slate-600">{item.copy}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-[22px] border border-fuchsia-100 bg-fuchsia-50/80 p-4 text-sm leading-7 text-fuchsia-900">
            Publicar en Proyecta implica respetar a la comunidad, divulgar sin sensacionalismo y ayudar a que el conocimiento circule con claridad, contexto y responsabilidad.
          </div>
        </section>

        <section className="nova-card p-6">
          <p className="nova-eyebrow">Reputacion transparente</p>
          <div className="mt-4 space-y-3">
            <div className="rounded-[22px] bg-slate-50/80 p-4 text-sm leading-7 text-slate-600">
              <strong className="text-slate-900">+10</strong> por cada publicación en Proyecta.
            </div>
            <div className="rounded-[22px] bg-slate-50/80 p-4 text-sm leading-7 text-slate-600">
              <strong className="text-slate-900">+1</strong> por cada voto positivo recibido en tus publicaciones.
            </div>
            <div className="rounded-[22px] bg-slate-50/80 p-4 text-sm leading-7 text-slate-600">
              <strong className="text-slate-900">+7</strong> por cada revisión científica realizada.
            </div>
            <div className="rounded-[22px] bg-slate-50/80 p-4 text-sm leading-7 text-slate-600">
              <strong className="text-slate-900">+3</strong> por cada comentario científico útil dentro de la comunidad.
            </div>
          </div>
        </section>

        <section className="nova-card p-6">
          <p className="nova-eyebrow">Checklist previo</p>
          <div className="mt-4 space-y-3">
            {submissionChecklist.map((item) => (
              <div key={item} className="flex gap-3 rounded-[22px] bg-slate-50/80 p-4">
                <Type size={18} className="mt-1 shrink-0 text-fuchsia-500" />
                <p className="text-sm leading-7 text-slate-600">{item}</p>
              </div>
            ))}
          </div>
        </section>
      </aside>
    </div>
  )
}
