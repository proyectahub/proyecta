import { useEffect, useRef, useState } from 'react'
import { Wand2 } from 'lucide-react'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  showTemplate?: boolean
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Escribe tu descripciÃƒÂ³n...',
  showTemplate = true,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [isTyping, setIsTyping] = useState(false)

  useEffect(() => {
    const editor = editorRef.current
    if (!editor) return

    if (editor.innerHTML !== value) {
      editor.innerHTML = value
    }
  }, [value])

  const handleInput = () => {
    const html = editorRef.current?.innerHTML || ''
    onChange(html)
  }

  const insertTemplate = () => {
    const template = `<h2>IntroducciÃƒÂ³n</h2>
<p>Describe brevemente el contexto del proyecto y su importancia cientÃƒÂ­fica.</p>

<h2>Antecedentes</h2>
<p>Explica el estado actual del conocimiento y la brecha que tu investigaciÃƒÂ³n aborda.</p>

<h2>Material y MÃƒÂ©todos</h2>
<p>Detalla los materiales, equipos y procedimientos que se utilizarÃƒÂ¡n.</p>

<h2>Resultados Esperados</h2>
<p>Explica quÃƒÂ© esperas lograr con este proyecto y cÃƒÂ³mo beneficiarÃƒÂ¡ a la comunidad cientÃƒÂ­fica.</p>

<h2>DescripciÃƒÂ³n del Presupuesto</h2>
<p>Especifica cÃƒÂ³mo se utilizarÃƒÂ¡n los XMR recaudados. Ejemplo: computaciÃƒÂ³n, equipamiento, anÃƒÂ¡lisis de datos, etc.</p>`

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
      if (!file) return

      const reader = new FileReader()
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string
        document.execCommand('insertImage', false, dataUrl)
      }
      reader.readAsDataURL(file)
    }
    input.click()
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const text = e.clipboardData.getData('text/plain')
    document.execCommand('insertText', false, text)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      document.execCommand('insertText', false, '\t')
      return
    }

    if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault()
      document.execCommand('insertText', false, '\n')
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 rounded-t-lg border border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 p-4">
        <div className="flex gap-1 border-r border-slate-300 pr-3">
          <button onClick={() => executeCommand('bold')} title="Negrita (Ctrl+B)" className="rounded p-2 text-sm font-bold transition hover:bg-slate-200">
            B
          </button>
          <button onClick={() => executeCommand('italic')} title="Cursiva (Ctrl+I)" className="rounded p-2 text-sm italic transition hover:bg-slate-200">
            I
          </button>
          <button onClick={() => executeCommand('underline')} title="Subrayado (Ctrl+U)" className="rounded p-2 text-sm underline transition hover:bg-slate-200">
            U
          </button>
        </div>

        <div className="flex gap-1 border-r border-slate-300 pr-3">
          <select
            onChange={(e) => {
              if (e.target.value) executeCommand('formatBlock', e.target.value)
              e.target.value = ''
            }}
            className="cursor-pointer rounded p-2 text-xs transition hover:bg-slate-200"
          >
            <option value="">PÃƒÂ¡rrafo</option>
            <option value="h2">TÃƒÂ­tulo 2</option>
            <option value="h3">TÃƒÂ­tulo 3</option>
          </select>

          <button
            onClick={() => executeCommand('insertUnorderedList')}
            title="Lista"
            className="rounded p-2 text-sm transition hover:bg-slate-200"
          >
            Ã¢â‚¬Â¢ Lista
          </button>
        </div>

        <div className="flex gap-1 border-r border-slate-300 pr-3">
          <button onClick={insertLink} title="Insertar enlace" className="rounded p-2 text-xs font-bold text-blue-600 transition hover:bg-slate-200">
            Ã°Å¸â€â€” Enlace
          </button>
          <button onClick={insertImage} title="Insertar imagen" className="rounded p-2 text-sm transition hover:bg-slate-200">
            Ã°Å¸â€“Â¼Ã¯Â¸Â Imagen
          </button>
        </div>

        <div className="flex gap-1 border-r border-slate-300 pr-3">
          <button onClick={() => executeCommand('undo')} title="Deshacer" className="rounded p-2 text-sm transition hover:bg-slate-200">
            Ã¢â€ Â¶
          </button>
          <button onClick={() => executeCommand('redo')} title="Rehacer" className="rounded p-2 text-sm transition hover:bg-slate-200">
            Ã¢â€ Â·
          </button>
        </div>

        {showTemplate && (
          <button
            onClick={insertTemplate}
            className="ml-auto inline-flex items-center gap-1 rounded bg-purple-600 p-2 text-xs font-bold text-white transition hover:bg-purple-700"
            title="Insertar estructura sugerida"
          >
            <Wand2 className="h-4 w-4" />
            Estructura
          </button>
        )}
      </div>

      <div
        ref={editorRef}
        contentEditable
        role="textbox"
        dir="ltr"
        aria-multiline="true"
        tabIndex={0}
        spellCheck
        suppressContentEditableWarning
        onInput={handleInput}
        onPaste={handlePaste}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsTyping(true)}
        onBlur={() => setIsTyping(false)}
        data-placeholder={placeholder}
        className="min-h-[600px] overflow-auto rounded-lg p-6 text-base leading-relaxed focus:outline-none focus:ring-2 focus:ring-purple-500"
        style={{
          wordBreak: 'break-word',
          whiteSpace: 'pre-wrap',
          direction: 'ltr',
          unicodeBidi: 'plaintext',
          textAlign: 'left',
          tabSize: 4,
          fontVariantLigatures: 'none',
          caretColor: '#c026d3',
          border: isTyping ? '3px solid #a855f7' : '2px solid #cbd5e1',
          backgroundColor: '#fafafa',
          fontFamily: 'inherit',
        }}
        dangerouslySetInnerHTML={{ __html: value }}
      />

      <div className="space-y-1 text-xs text-slate-600">
        <p>
          Ã°Å¸â€™Â¡ <strong>Sugerencia:</strong> Haz clic en "Estructura" para agregar secciones recomendadas. Las imÃƒÂ¡genes se guardan como referencias base64.
        </p>
        <p>
          Ã°Å¸â€œâ€¹ <strong>Presupuesto:</strong> Especifica en la secciÃƒÂ³n de presupuesto cÃƒÂ³mo se usarÃƒÂ¡n los XMR recaudados (computaciÃƒÂ³n, equipamiento, anÃƒÂ¡lisis, etc.).
        </p>
      </div>
    </div>
  )
}
