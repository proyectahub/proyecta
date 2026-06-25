import { useRef, useState } from 'react'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function RichTextEditor({ value, onChange, placeholder = 'Escribe tu descripción...' }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [isTyping, setIsTyping] = useState(false)

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

  const handleInput = () => {
    const html = editorRef.current?.innerHTML || ''
    onChange(html)
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const text = e.clipboardData.getData('text/plain')
    document.execCommand('insertText', false, text)
  }

  return (
    <div className="space-y-2">
      {/* Toolbar */}
      <div className="bg-slate-100 rounded-t-lg border border-slate-200 p-3 flex flex-wrap gap-1">
        <div className="flex gap-1 border-r border-slate-300 pr-2">
          <button
            onClick={() => executeCommand('bold')}
            title="Negrita (Ctrl+B)"
            className="p-2 hover:bg-slate-200 rounded text-sm font-bold"
          >
            B
          </button>
          <button
            onClick={() => executeCommand('italic')}
            title="Cursiva (Ctrl+I)"
            className="p-2 hover:bg-slate-200 rounded text-sm italic"
          >
            I
          </button>
          <button
            onClick={() => executeCommand('underline')}
            title="Subrayado (Ctrl+U)"
            className="p-2 hover:bg-slate-200 rounded text-sm underline"
          >
            U
          </button>
        </div>

        <div className="flex gap-1 border-r border-slate-300 pr-2">
          <select
            onChange={(e) => {
              if (e.target.value) executeCommand('formatBlock', e.target.value)
              e.target.value = ''
            }}
            className="p-2 hover:bg-slate-200 rounded text-xs"
          >
            <option value="">Párrafo</option>
            <option value="h1">Título 1</option>
            <option value="h2">Título 2</option>
            <option value="h3">Título 3</option>
          </select>

          <button
            onClick={() => executeCommand('insertUnorderedList')}
            title="Lista"
            className="p-2 hover:bg-slate-200 rounded text-sm"
          >
            • Lista
          </button>
        </div>

        <div className="flex gap-1 border-r border-slate-300 pr-2">
          <button
            onClick={insertLink}
            title="Insertar enlace"
            className="p-2 hover:bg-slate-200 rounded text-xs font-bold text-blue-600"
          >
            🔗 Enlace
          </button>
          <button
            onClick={insertImage}
            title="Insertar imagen"
            className="p-2 hover:bg-slate-200 rounded text-sm"
          >
            🖼️ Imagen
          </button>
        </div>

        <div className="flex gap-1">
          <button
            onClick={() => executeCommand('undo')}
            title="Deshacer"
            className="p-2 hover:bg-slate-200 rounded text-sm"
          >
            ↶
          </button>
          <button
            onClick={() => executeCommand('redo')}
            title="Rehacer"
            className="p-2 hover:bg-slate-200 rounded text-sm"
          >
            ↷
          </button>
        </div>
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
        className="nova-field min-h-[300px] focus:outline-none focus:ring-2 focus:ring-blue-500 overflow-auto"
        style={{
          wordBreak: 'break-word',
          whiteSpace: 'pre-wrap',
          border: isTyping ? '2px solid #3b82f6' : '1px solid #cbd5e1',
        }}
        dangerouslySetInnerHTML={{ __html: value }}
      />

      <div className="text-xs text-slate-500">
        Puedes usar el editor para dar formato a tu descripción. Las imágenes se guardan como referencias base64.
      </div>
    </div>
  )
}
