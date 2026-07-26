import { FormEvent, useEffect, useState } from 'react'
import { ArrowLeft, MessageCircle, Plus, Send, Sparkles, Users } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useTraditionalAuth } from '../context/TraditionalAuthContext'
import { PROJECTS_API_BASE } from '../lib/api'

type ForumTopic = {
  id: string
  authorId: string
  authorName: string
  title: string
  content: string
  category: string
  createdAt: number
  updatedAt: number
  replyCount: number
}

type ForumReply = {
  id: string
  authorId: string
  authorName: string
  content: string
  createdAt: number
}

const categories = [
  { id: 'general', label: 'Comunidad' },
  { id: 'mejoras', label: 'Mejoras del portal' },
  { id: 'investigacion', label: 'Investigación abierta' },
  { id: 'mineria', label: 'Cómputo y minería' },
  { id: 'gobernanza', label: 'Red y gobernanza' },
]

function formatDate(value: number) {
  return new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium' }).format(new Date(value))
}

export function ForumExperience() {
  const navigate = useNavigate()
  const { user } = useTraditionalAuth()
  const [topics, setTopics] = useState<ForumTopic[]>([])
  const [selectedTopic, setSelectedTopic] = useState<ForumTopic | null>(null)
  const [replies, setReplies] = useState<ForumReply[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showComposer, setShowComposer] = useState(false)
  const [topicForm, setTopicForm] = useState({ title: '', content: '', category: 'general' })
  const [replyContent, setReplyContent] = useState('')

  const loadTopics = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${PROJECTS_API_BASE}/forum`, { credentials: 'same-origin' })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'No fue posible cargar el foro.')
      setTopics(Array.isArray(data) ? data : [])
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'No fue posible cargar el foro.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadTopics()
  }, [])

  const openTopic = async (topic: ForumTopic) => {
    setSelectedTopic(topic)
    setReplies([])
    setError(null)
    try {
      const response = await fetch(`${PROJECTS_API_BASE}/forum/${encodeURIComponent(topic.id)}/replies`, { credentials: 'same-origin' })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'No fue posible cargar las respuestas.')
      setReplies(Array.isArray(data) ? data : [])
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'No fue posible cargar las respuestas.')
    }
  }

  const submitTopic = async (event: FormEvent) => {
    event.preventDefault()
    if (!user) {
      navigate('/login?intent=forum')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const response = await fetch(`${PROJECTS_API_BASE}/forum`, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(topicForm),
      })
      const topic = await response.json()
      if (!response.ok) throw new Error(topic.error || 'No fue posible publicar el tema.')
      setTopics((current) => [topic, ...current])
      setTopicForm({ title: '', content: '', category: 'general' })
      setShowComposer(false)
      void openTopic(topic)
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'No fue posible publicar el tema.')
    } finally {
      setSubmitting(false)
    }
  }

  const submitReply = async (event: FormEvent) => {
    event.preventDefault()
    if (!selectedTopic) return
    if (!user) {
      navigate('/login?intent=forum')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const response = await fetch(`${PROJECTS_API_BASE}/forum/${encodeURIComponent(selectedTopic.id)}/replies`, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: replyContent }),
      })
      const reply = await response.json()
      if (!response.ok) throw new Error(reply.error || 'No fue posible enviar la respuesta.')
      setReplies((current) => [...current, reply])
      setReplyContent('')
      setTopics((current) => current.map((topic) => topic.id === selectedTopic.id
        ? { ...topic, replyCount: topic.replyCount + 1, updatedAt: reply.createdAt }
        : topic))
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'No fue posible enviar la respuesta.')
    } finally {
      setSubmitting(false)
    }
  }

  if (selectedTopic) {
    return (
      <div className="mx-auto max-w-5xl space-y-6">
        <button onClick={() => setSelectedTopic(null)} className="nova-button-soft inline-flex items-center gap-2 px-4 py-2 text-sm">
          <ArrowLeft className="h-4 w-4" /> Volver al foro
        </button>
        <article className="nova-card p-6 md:p-8">
          <p className="nova-eyebrow">{categories.find((category) => category.id === selectedTopic.category)?.label || 'Comunidad'}</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 md:text-4xl">{selectedTopic.title}</h1>
          <p className="mt-3 text-sm text-slate-500">Iniciado por {selectedTopic.authorName} · {formatDate(selectedTopic.createdAt)}</p>
          <p className="mt-6 whitespace-pre-wrap text-base leading-8 text-slate-700">{selectedTopic.content}</p>
        </article>

        <section className="space-y-4">
          <div className="flex items-center gap-2 px-1"><MessageCircle className="h-5 w-5 text-fuchsia-600" /><h2 className="text-xl font-black text-slate-900">Discusión ({replies.length})</h2></div>
          {replies.map((reply) => (
            <article key={reply.id} className="nova-card p-5">
              <p className="font-bold text-slate-900">{reply.authorName}</p>
              <p className="mt-1 text-xs text-slate-500">{formatDate(reply.createdAt)}</p>
              <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-700">{reply.content}</p>
            </article>
          ))}
          {!replies.length ? <p className="nova-card p-6 text-center text-sm text-slate-500">Aún no hay respuestas. Inicia la conversación.</p> : null}
        </section>

        <form onSubmit={submitReply} className="nova-card space-y-4 p-6">
          <h2 className="text-xl font-black text-slate-900">Responder</h2>
          <textarea value={replyContent} onChange={(event) => setReplyContent(event.target.value)} required minLength={1} maxLength={3000} rows={5} className="nova-field w-full resize-y" placeholder="Comparte una idea, una pregunta o una mejora concreta..." />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-slate-500">Las discusiones deben ser respetuosas y enfocadas en la comunidad.</p>
            <button disabled={submitting} className="nova-button-solid inline-flex items-center gap-2 px-5 py-3 disabled:opacity-60"><Send className="h-4 w-4" /> Publicar respuesta</button>
          </div>
        </form>
        {error ? <p className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{error}</p> : null}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <section className="nova-card relative overflow-hidden p-7 md:p-10">
        <div className="absolute -right-12 -top-14 h-48 w-48 rounded-full bg-fuchsia-200/50 blur-3xl" />
        <div className="relative grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <p className="nova-eyebrow">Voz de la comunidad</p>
            <h1 className="mt-3 max-w-3xl text-4xl font-black tracking-tight text-slate-950 md:text-5xl">Foro para construir PROYECTA juntos</h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">Propón mejoras, conversa sobre investigación abierta y ayuda a definir una red de financiamiento colectivo más útil, clara y justa.</p>
          </div>
          <button onClick={() => user ? setShowComposer(true) : navigate('/login?intent=forum')} className="nova-button-solid inline-flex items-center justify-center gap-2 px-5 py-3"><Plus className="h-5 w-5" /> Crear tema</button>
        </div>
      </section>

      {showComposer ? (
        <form onSubmit={submitTopic} className="nova-card space-y-5 border-fuchsia-200 p-6 md:p-8">
          <div className="flex items-center justify-between gap-4"><h2 className="text-2xl font-black text-slate-950">Nueva conversación</h2><button type="button" onClick={() => setShowComposer(false)} className="text-sm font-bold text-slate-500 hover:text-slate-900">Cancelar</button></div>
          <div className="grid gap-4 md:grid-cols-[1fr_220px]"><input value={topicForm.title} onChange={(event) => setTopicForm({ ...topicForm, title: event.target.value })} required minLength={8} maxLength={140} className="nova-field w-full" placeholder="¿Qué quieres conversar o mejorar?" /><select value={topicForm.category} onChange={(event) => setTopicForm({ ...topicForm, category: event.target.value })} className="nova-field w-full">{categories.map((category) => <option key={category.id} value={category.id}>{category.label}</option>)}</select></div>
          <textarea value={topicForm.content} onChange={(event) => setTopicForm({ ...topicForm, content: event.target.value })} required minLength={20} maxLength={5000} rows={7} className="nova-field w-full resize-y" placeholder="Explica tu propuesta, contexto o pregunta para que la comunidad pueda aportar..." />
          <button disabled={submitting} className="nova-button-solid inline-flex items-center gap-2 px-5 py-3 disabled:opacity-60"><Send className="h-4 w-4" /> Publicar tema</button>
        </form>
      ) : null}

      {error ? <p className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{error}</p> : null}

      <section className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-3">
          {loading ? <p className="nova-card p-6 text-sm text-slate-500">Cargando conversaciones...</p> : null}
          {!loading && !topics.length ? <p className="nova-card p-8 text-center text-sm text-slate-500">Todavía no hay temas. Sé la primera persona en abrir una conversación.</p> : null}
          {topics.map((topic) => (
            <button key={topic.id} onClick={() => void openTopic(topic)} className="nova-card w-full p-5 text-left transition hover:-translate-y-0.5 hover:border-fuchsia-200 hover:shadow-lg">
              <div className="flex flex-wrap items-center justify-between gap-3"><span className="rounded-full bg-fuchsia-50 px-3 py-1 text-xs font-bold text-fuchsia-700">{categories.find((category) => category.id === topic.category)?.label || 'Comunidad'}</span><span className="text-xs text-slate-500">{topic.replyCount} respuesta{topic.replyCount === 1 ? '' : 's'}</span></div>
              <h2 className="mt-3 text-xl font-black text-slate-950">{topic.title}</h2><p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{topic.content}</p><p className="mt-4 text-xs font-semibold text-slate-500">{topic.authorName} · {formatDate(topic.updatedAt)}</p>
            </button>
          ))}
        </div>
        <aside className="space-y-4">
          <div className="nova-card p-5"><div className="flex items-center gap-2 text-fuchsia-700"><Sparkles className="h-5 w-5" /><p className="font-black">Para crecer juntos</p></div><p className="mt-3 text-sm leading-7 text-slate-600">Comparte ideas accionables, documenta problemas y responde con respeto. Las propuestas claras ayudan a priorizar mejoras.</p></div>
          <div className="nova-card p-5"><div className="flex items-center gap-2 text-cyan-700"><Users className="h-5 w-5" /><p className="font-black">Participación abierta</p></div><p className="mt-3 text-sm leading-7 text-slate-600">Puedes leer sin cuenta. Para crear temas o responder, inicia sesión con tu perfil PROYECTA.</p><Link to={user ? '/profile' : '/login'} className="mt-4 inline-flex text-sm font-bold text-fuchsia-700 hover:text-fuchsia-900">{user ? 'Ver mi perfil' : 'Iniciar sesión'} →</Link></div>
        </aside>
      </section>
    </div>
  )
}
