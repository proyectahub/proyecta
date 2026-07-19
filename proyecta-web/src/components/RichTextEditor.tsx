import { useMemo, useRef } from 'react'
import { Bold, Heading2, ImageIcon, Italic, Link2, List, Wand2 } from 'lucide-react'
import { sanitizeRichHtml } from '../utils/sanitizeRichHtml'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  showTemplate?: boolean
}

const SECTION_TITLES = new Set([
  'Título del proyecto',
  'Resumen',
  'Objetivo',
  'Metodología',
  'Impacto esperado',
  'Presupuesto',
])

function escapeHtml(input: string) {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function inlineFormat(input: string) {
  return escapeHtml(input)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
}

function renderPreview(value: string) {
  const lines = value.replace(/\r\n/g, '\n').split('\n')
  const blocks: string[] = []
  let paragraph: string[] = []

  const flushParagraph = () => {
    if (!paragraph.length) return
    blocks.push(`<p>${inlineFormat(paragraph.join(' '))}</p>`)
    paragraph = []
  }

  for (const rawLine of lines) {
    const line = rawLine.trim()

    if (!line) {
      flushParagraph()
      continue
    }

    if (line.startsWith('- ')) {
      flushParagraph()
      blocks.push(`<ul><li>${inlineFormat(line.slice(2))}</li></ul>`)
      continue
    }

    if (SECTION_TITLES.has(line)) {
      flushParagraph()
      const level = line === 'Título del proyecto' ? 'h1' : 'h2'
      blocks.push(`<${level}>${inlineFormat(line)}</${level}>`)
      continue
    }

    if (/^#{1,3}\s+/.test(line)) {
      flushParagraph()
      const hashCount = line.match(/^#+/)?.[0].length ?? 1
      const level = Math.min(hashCount + 1, 3)
      const title = line.replace(/^#{1,3}\s+/, '')
      blocks.push(`<h${level}>${inlineFormat(title)}</h${level}>`)
      continue
    }

    paragraph.push(rawLine)
  }

  flushParagraph()
  return blocks.join('')
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Escribe tu descripción...',
  showTemplate = true,
}: RichTextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const previewHtml = useMemo(() => renderPreview(value), [value])

  const applySelection = (before: string, after = before) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart ?? value.length
    const end = textarea.selectionEnd ?? value.length
    const selected = value.slice(start, end)
    const nextValue = `${value.slice(0, start)}${before}${selected}${after}${value.slice(end)}`
    onChange(nextValue)

    requestAnimationFrame(() => {
      textarea.focus()
      const selectionStart = start + before.length
      const selectionEnd = selectionStart + selected.length
      textarea.setSelectionRange(selectionStart, selectionEnd)
    })
  }

  const insertLine = (line: string) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart ?? value.length
    const end = textarea.selectionEnd ?? value.length
    const before = start > 0 && value[start - 1] !== '\n' ? '\n' : ''
    const after = end < value.length && value[end] !== '\n' ? '\n' : ''
    const nextValue = `${value.slice(0, start)}${before}${line}${after}${value.slice(end)}`
    onChange(nextValue)

    requestAnimationFrame(() => {
      textarea.focus()
      const caret = start + before.length + line.length
      textarea.setSelectionRange(caret, caret)
    })
  }

  const insertBlock = (block: string) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart ?? value.length
    const end = textarea.selectionEnd ?? value.length
    const needsPrefixBreak = start > 0 && value[start - 1] !== '\n'
    const needsSuffixBreak = end < value.length && value[end] !== '\n'
    const prefixBreak = needsPrefixBreak ? '\n' : ''
    const suffixBreak = needsSuffixBreak ? '\n' : ''
    const nextValue = `${value.slice(0, start)}${prefixBreak}${block}${value.slice(start, end)}${suffixBreak}${value.slice(end)}`
    onChange(nextValue)

    requestAnimationFrame(() => {
      textarea.focus()
      const caret = start + prefixBreak.length + block.length
      textarea.setSelectionRange(caret, caret)
    })
  }

  const insertTemplate = () => {
    onChange([
      'Título del proyecto',
      '',
      'Resumen',
      'Explica el problema científico y por qué importa.',
      '',
      'Objetivo',
      'Describe qué quieres lograr con este proyecto.',
      '',
      'Metodología',
      'Resume cómo vas a trabajar, qué herramientas usarás y qué parte se financiará.',
      '',
      'Impacto esperado',
      'Cuenta qué cambia si el proyecto avanza.',
      '',
      'Presupuesto',
      'Detalla cómo se usarán los fondos y por qué es necesario.',
    ].join('\n'))
    requestAnimationFrame(() => textareaRef.current?.focus())
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Tab') {
      event.preventDefault()
      const textarea = textareaRef.current
      if (!textarea) return

      const start = textarea.selectionStart ?? value.length
      const end = textarea.selectionEnd ?? value.length
      const insert = '  '
      const nextValue = `${value.slice(0, start)}${insert}${value.slice(end)}`
      onChange(nextValue)

      requestAnimationFrame(() => {
        textarea.focus()
        textarea.setSelectionRange(start + insert.length, start + insert.length)
      })
      return
    }

    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'b') {
      event.preventDefault()
      applySelection('**')
      return
    }

    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'i') {
      event.preventDefault()
      applySelection('*')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 rounded-t-[28px] border-b border-fuchsia-100 bg-white/80 px-4 py-3">
        <button type="button" onClick={() => applySelection('**')} className="nova-button-soft px-3 py-2 text-xs font-bold" title="Negrita">
          <Bold size={14} />
          B
        </button>
        <button type="button" onClick={() => applySelection('*')} className="nova-button-soft px-3 py-2 text-xs italic" title="Cursiva">
          <Italic size={14} />
          I
        </button>
        <button type="button" onClick={() => insertLine('Título del proyecto')} className="nova-button-soft px-3 py-2 text-xs font-bold" title="Título del proyecto">
          <Heading2 size={14} />
          Título
        </button>
        <button type="button" onClick={() => insertBlock('- ')} className="nova-button-soft px-3 py-2 text-xs font-bold" title="Lista">
          <List size={14} />
          Lista
        </button>
        <button type="button" onClick={() => insertBlock('[texto](https://)')} className="nova-button-soft px-3 py-2 text-xs font-bold" title="Enlace">
          <Link2 size={14} />
          Enlace
        </button>
        <button type="button" onClick={() => insertBlock('![imagen](https://)')} className="nova-button-soft px-3 py-2 text-xs font-bold" title="Imagen">
          <ImageIcon size={14} />
          Imagen
        </button>
        {showTemplate ? (
          <button type="button" onClick={insertTemplate} className="ml-auto inline-flex items-center gap-1 rounded-full bg-fuchsia-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-fuchsia-700">
            <Wand2 className="h-4 w-4" />
            Estructura
          </button>
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-[24px] border border-slate-200 bg-white/90 p-1 shadow-sm">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            spellCheck
            dir="ltr"
            className="min-h-[420px] w-full resize-y rounded-[22px] border-0 bg-transparent px-5 py-5 text-left text-base leading-7 outline-none placeholder:text-slate-400 focus:ring-0"
            style={{ whiteSpace: 'pre-wrap', tabSize: 4, direction: 'ltr', unicodeBidi: 'plaintext' }}
          />
        </div>

        <div className="rounded-[24px] border border-fuchsia-200 bg-gradient-to-br from-white via-fuchsia-50/40 to-orange-50/35 p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Vista previa</p>
            <p className="text-xs text-slate-400">Cómo se verá la descripción</p>
          </div>
          <div
            className="prose prose-slate max-w-none prose-h1:mb-3 prose-h1:text-3xl prose-h1:font-black prose-h1:text-slate-900 prose-h2:mb-2 prose-h2:mt-5 prose-h2:text-xl prose-h2:font-black prose-h2:text-slate-900 prose-p:my-2 prose-p:leading-7 prose-strong:text-slate-900 prose-code:rounded prose-code:bg-slate-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-xs"
            dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(previewHtml || `<p>${escapeHtml(placeholder)}</p>`) }}
          />
        </div>
      </div>
    </div>
  )
}
