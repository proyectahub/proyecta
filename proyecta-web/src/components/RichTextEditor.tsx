import { useRef, useState } from 'react'
import { Wand2 } from 'lucide-react'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  showTemplate?: boolean
}

export function RichTextEditor({ value, onChange, placeholder = 'Escribe tu descripción...', showTemplate = true }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [isTyping, setIsTyping] = useState(false)

  const handleInput = () => {
    const html = editorRef.current?.innerHTML || ''
    onChange(html)
  }

  const insertTemplate = () => {
    const template = `<h2>Introducción</h2>
<p>Describe brevemente el contexto del proyecto y su importancia científica.</p>

<h2>Antecedentes</h2>
<p>Explica el estado actual del conocimiento y la brecha que tu investigación aborda.</p>

<h2>Material y Métodos</h2>
<p>Detalla los materiales, equipos y procedimientos que se utilizarán.</p>

<h2>Resultados Esperados</h2>
<p>Explica qué esperas lograr con este proyecto y cómo beneficiará a la comunidad científica.</p>

<h2>Descripción del Presupuesto</h2>
<p>Especifica cómo se utilizarán los XMR recaudados. Ejemplo: computación, equipamiento, análisis de datos, etc.</p>`

    if (editorRef.current) {
      editorRef.current.innerHTML = template
      handleInput()
      editorRef.current.focus()
    }
  }

  const executeCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    editorRef.current?.focus()
  }

  const insertLink = () => {
    const url = prompt('Ingresa la URL:')
    if (url) executeCommand('createLink', url)
  }

  const insertImage = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (event) => {
          const dataUrl = event.target?.result as string
          document.execCommand('insertImage', false, dataUrl)
        }
        reader.readAsDataURL(file)
      }
    }
    input.click()
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const text = e.clipboardData.getData('text/plain')
    document.execCommand('insertText', false, text)
  }

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-t-lg border border-slate-200 p-4 flex flex-wrap gap-2">
        <div className="flex gap-1 border-r border-slate-300 pr-3">
          <button
            onClick={() => executeCommand('bold')}
            title="Negrita (Ctrl+B)"
            className="p-2 hover:bg-slate-200 rounded text-sm font-bold transition"
          >
            B
          </button>
          <button
            onClick={() => executeCommand('italic')}
            title="Cursiva (Ctrl+I)"
            className="p-2 hover:bg-slate-200 rounded text-sm italic transition"
          >
            I
          </button>
          <button
            onClick={() => executeCommand('underline')}
            title="Subrayado (Ctrl+U)"
            className="p-2 hover:bg-slate-200 rounded text-sm underline transition"
          >
            U
          </button>
        </div>

        <div className="flex gap-1 border-r border-slate-300 pr-3">
          <select
            onChange={(e) => {
              if (e.target.value) executeCommand('formatBlock', e.target.value)
              e.target.value = ''
            }}
            className="p-2 hover:bg-slate-200 rounded text-xs transition cursor-pointer"
          >
            <option value="">Párrafo</option>
            <option value="h2">Título 2</option>
            <option value="h3">Título 3</option>
          </select>

          <button
            onClick={() => executeCommand('insertUnorderedList')}
            title="Lista"
            className="p-2 hover:bg-slate-200 rounded text-sm transition"
          >
            • Lista
          </button>
        </div>

        <div className="flex gap-1 border-r border-slate-300 pr-3">
          <button
            onClick={insertLink}
            title="Insertar enlace"
            className="p-2 hover:bg-slate-200 rounded text-xs font-bold text-blue-600 transition"
          >
            🔗 Enlace
          </button>
          <button
            onClick={insertImage}
            title="Insertar imagen"
            className="p-2 hover:bg-slate-200 rounded text-sm transition"
          >
            🖼️ Imagen
          </button>
        </div>

        <div className="flex gap-1 border-r border-slate-300 pr-3">
          <button
            onClick={() => executeCommand('undo')}
            title="Deshacer"
            className="p-2 hover:bg-slate-200 rounded text-sm transition"
          >
            ↶
          </button>
          <button
            onClick={() => executeCommand('redo')}
            title="Rehacer"
            className="p-2 hover:bg-slate-200 rounded text-sm transition"
          >
            ↷
          </button>
        </div>

        {showTemplate && (
          <button
            onClick={insertTemplate}
            className="ml-auto p-2 bg-purple-600 hover:bg-purple-700 text-white rounded flex items-center gap-1 text-xs font-bold transition"
            title="Insertar estructura sugerida"
          >
            <Wand2 className="h-4 w-4" />
            Estructura
          </button>
        )}
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onPaste={handlePaste}
        onFocus={() => setIsTyping(true)}
        onBlur={() => setIsTyping(false)}
        className="min-h-[600px] p-6 focus:outline-none focus:ring-2 focus:ring-purple-500 overflow-auto text-base leading-relaxed rounded-lg"
        style={{
          wordBreak: 'break-word',
          whiteSpace: 'pre-wrap',
          border: isTyping ? '3px solid #a855f7' : '2px solid #cbd5e1',
          backgroundColor: '#fafafa',
          fontFamily: 'inherit',
        }}
        dangerouslySetInnerHTML={{ __html: value }}
      />

      <div className="text-xs text-slate-600 space-y-1">
        <p>💡 <strong>Sugerencia:</strong> Haz clic en "Estructura" para agregar secciones recomendadas. Las imágenes se guardan como referencias base64.</p>
        <p>📋 <strong>Presupuesto:</strong> Especifica en la sección de presupuesto cómo se usarán los XMR recaudados (computación, equipamiento, análisis, etc.)</p>
      </div>
    </div>
  )
}
