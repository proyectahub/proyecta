import { useEffect, useRef, type ReactNode } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import { Table, TableCell, TableHeader, TableRow } from '@tiptap/extension-table'
import {
  AlignCenter, AlignJustify, AlignLeft, AlignRight, Bold, Code2, Heading1, Heading2, Heading3, Image as ImageIcon, Italic, Link2,
  List, ListOrdered, Pilcrow, Quote, Redo2, RemoveFormatting, Strikethrough,
  Table2, Underline as UnderlineIcon, Undo2,
} from 'lucide-react'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  showTemplate?: boolean
}

export const PROJECT_DESCRIPTION_TEMPLATE = `
<h2><strong>Resumen</strong></h2><p><em>Recomendación: explica el problema científico, a quién afecta y por qué vale la pena atenderlo.</em></p>
<h2><strong>Objetivo</strong></h2><p><em>Recomendación: describe con claridad qué resultado concreto buscas alcanzar con este proyecto.</em></p>
<h2><strong>Metodología</strong></h2><p><em>Recomendación: resume cómo trabajarás, qué herramientas utilizarás y qué actividades se financiarán.</em></p>
<h2><strong>Impacto esperado</strong></h2><p><em>Recomendación: cuenta qué cambiará si el proyecto avanza y quién se beneficiará de sus resultados.</em></p>
<h2><strong>Uso de fondos</strong></h2><p><em>Recomendación: detalla cómo se usarán los fondos, con prioridades claras y razones verificables.</em></p>`

function ToolbarButton({ active, label, onClick, children }: { active?: boolean, label: string, onClick: () => void, children: ReactNode }) {
  return <button type="button" title={label} aria-label={label} onClick={onClick} className={`rounded-xl p-2 transition ${active ? 'bg-fuchsia-100 text-fuchsia-700' : 'text-slate-600 hover:bg-white hover:text-slate-950'}`}>{children}</button>
}

export function RichTextEditor({ value, onChange, placeholder = 'Escribe aquí...', showTemplate = true }: RichTextEditorProps) {
  const lastValue = useRef(value)
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }), Underline,
      Link.configure({ openOnClick: false, autolink: true, defaultProtocol: 'https://' }),
      Image.configure({ allowBase64: false }),
      Placeholder.configure({ placeholder }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Table.configure({ resizable: true }), TableRow, TableHeader, TableCell,
    ],
    content: value,
    editorProps: { attributes: { class: 'proyecta-rich-editor min-h-[360px] px-5 py-5 outline-none [&_h2]:mt-7 [&_h2]:text-2xl [&_h2]:font-black [&_h2]:text-slate-950 [&_p]:my-3 [&_em]:text-slate-400 [&_em]:font-normal' } },
    onUpdate: ({ editor: nextEditor }) => {
      const html = nextEditor.getHTML()
      lastValue.current = html
      onChange(html)
    },
  })

  useEffect(() => {
    if (!editor || value === lastValue.current) return
    editor.commands.setContent(value || '<p></p>', { emitUpdate: false })
    lastValue.current = value
  }, [editor, value])

  if (!editor) return null

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href as string | undefined
    const url = window.prompt('Pega un enlace seguro (https://, http:// o mailto:)', previousUrl || '')
    if (url === null) return
    if (!url.trim()) editor.chain().focus().unsetLink().run()
    else editor.chain().focus().setLink({ href: url.trim() }).run()
  }
  const addImage = () => {
    const src = window.prompt('Pega la URL HTTPS de la imagen')
    if (src?.trim()) editor.chain().focus().setImage({ src: src.trim(), alt: 'Imagen del proyecto' }).run()
  }

  return (
    <div className="overflow-hidden bg-white">
      <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-stone-50 px-3 py-2">
        <ToolbarButton label="Negrita" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}><Bold size={17} /></ToolbarButton>
        <ToolbarButton label="Cursiva" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic size={17} /></ToolbarButton>
        <ToolbarButton label="Subrayado" active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}><UnderlineIcon size={17} /></ToolbarButton>
        <ToolbarButton label="Tachado" active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()}><Strikethrough size={17} /></ToolbarButton>
        <span className="mx-1 h-6 w-px bg-slate-200" />
        <ToolbarButton label="Título principal" active={editor.isActive('heading', { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}><Heading1 size={18} /></ToolbarButton>
        <ToolbarButton label="Título de sección" active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><Heading2 size={18} /></ToolbarButton>
        <ToolbarButton label="Subtítulo" active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}><Heading3 size={18} /></ToolbarButton>
        <ToolbarButton label="Párrafo" active={editor.isActive('paragraph')} onClick={() => editor.chain().focus().setParagraph().run()}><Pilcrow size={17} /></ToolbarButton>
        <span className="mx-1 h-6 w-px bg-slate-200" />
        <ToolbarButton label="Alinear a la izquierda" active={editor.isActive({ textAlign: 'left' })} onClick={() => editor.chain().focus().setTextAlign('left').run()}><AlignLeft size={17} /></ToolbarButton>
        <ToolbarButton label="Centrar texto" active={editor.isActive({ textAlign: 'center' })} onClick={() => editor.chain().focus().setTextAlign('center').run()}><AlignCenter size={17} /></ToolbarButton>
        <ToolbarButton label="Alinear a la derecha" active={editor.isActive({ textAlign: 'right' })} onClick={() => editor.chain().focus().setTextAlign('right').run()}><AlignRight size={17} /></ToolbarButton>
        <ToolbarButton label="Justificar texto" active={editor.isActive({ textAlign: 'justify' })} onClick={() => editor.chain().focus().setTextAlign('justify').run()}><AlignJustify size={17} /></ToolbarButton>
        <span className="mx-1 h-6 w-px bg-slate-200" />
        <ToolbarButton label="Lista con viñetas" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}><List size={18} /></ToolbarButton>
        <ToolbarButton label="Lista numerada" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered size={18} /></ToolbarButton>
        <ToolbarButton label="Cita" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}><Quote size={17} /></ToolbarButton>
        <ToolbarButton label="Código" active={editor.isActive('codeBlock')} onClick={() => editor.chain().focus().toggleCodeBlock().run()}><Code2 size={17} /></ToolbarButton>
        <span className="mx-1 h-6 w-px bg-slate-200" />
        <ToolbarButton label="Enlace" active={editor.isActive('link')} onClick={setLink}><Link2 size={17} /></ToolbarButton>
        <ToolbarButton label="Imagen por URL" onClick={addImage}><ImageIcon size={17} /></ToolbarButton>
        <ToolbarButton label="Insertar tabla" onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}><Table2 size={17} /></ToolbarButton>
        <ToolbarButton label="Quitar formato" onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}><RemoveFormatting size={17} /></ToolbarButton>
        <span className="mx-1 h-6 w-px bg-slate-200" />
        <ToolbarButton label="Deshacer" onClick={() => editor.chain().focus().undo().run()}><Undo2 size={17} /></ToolbarButton>
        <ToolbarButton label="Rehacer" onClick={() => editor.chain().focus().redo().run()}><Redo2 size={17} /></ToolbarButton>
        {showTemplate ? <button type="button" onClick={() => editor.chain().focus().setContent(PROJECT_DESCRIPTION_TEMPLATE).run()} className="ml-auto rounded-full bg-fuchsia-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-fuchsia-700">Restablecer estructura</button> : null}
      </div>
      <EditorContent editor={editor} />
      <div className="border-t border-slate-100 bg-slate-50 px-5 py-2 text-xs text-slate-500">Contenido estructurado para lectura pública. Las imágenes deben usar una URL HTTPS.</div>
    </div>
  )
}
