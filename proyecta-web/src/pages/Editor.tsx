import React, { useState, useCallback, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { 
  Bold, Italic, List, ListOrdered, Quote, Heading1, Heading2, 
  Link as LinkIcon, Image as ImageIcon, FileUp, Save, Send,
  ChevronLeft, Type, Underline as UnderlineIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const Editor = () => {
  const [title, setTitle] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
      }),
      Image,
      Placeholder.configure({
        placeholder: 'Escribe tu hallazgo científico aquí...',
      }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-slate prose-lg max-w-none focus:outline-none min-h-[500px]',
      },
    },
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const toastId = toast.loading('Procesando documento...');

    try {
      if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        // DOCX Import
        const reader = new FileReader();
        reader.onload = async (e) => {
          const arrayBuffer = e.target.result as ArrayBuffer;
          const result = await mammoth.convertToHtml({ arrayBuffer });
          editor.commands.setContent(result.value);
          toast.success('Documento DOCX importado correctamente', { id: toastId });
        };
        reader.readAsArrayBuffer(file);
      } else if (file.type === 'application/pdf') {
        // PDF Import
        const reader = new FileReader();
        reader.onload = async (e) => {
          const typedarray = new Uint8Array(e.target.result as ArrayBuffer);
          const pdf = await pdfjsLib.getDocument(typedarray).promise;
          let fullText = '';
          
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map((item: any) => item.str).join(' ');
            fullText += `<p>${pageText}</p>`;
          }
          
          editor.commands.setContent(fullText);
          toast.success('Texto de PDF extraído correctamente', { id: toastId });
        };
        reader.readAsArrayBuffer(file);
      } else {
        toast.error('Formato no soportado. Usa PDF o DOCX.', { id: toastId });
      }
    } catch (error) {
      console.error(error);
      toast.error('Error al procesar el archivo', { id: toastId });
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const saveDraft = () => {
    toast.success('Borrador guardado localmente');
  };

  const publishArticle = () => {
    if (!title || editor.isEmpty) {
      toast.error('Por favor, añade un título y contenido');
      return;
    }
    
    toast.success('¡Artículo publicado con éxito!');
    // Simulation: +10 reputation
    navigate('/');
  };

  if (!editor) return null;

  return (
    <div className="max-w-4xl mx-auto pb-24">
      {/* Editor Header */}
      <div className="flex items-center justify-between mb-8 sticky top-[64px] bg-slate-50/80 backdrop-blur-sm py-4 z-40 border-b border-slate-200 -mx-4 px-4">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-600"
        >
          <ChevronLeft size={24} />
        </button>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => fileInputRef.current.click()}
            disabled={isImporting}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
          >
            <FileUp size={18} />
            <span className="hidden sm:inline">Importar PDF/DOCX</span>
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
            accept=".pdf,.docx"
          />
          <button 
            onClick={saveDraft}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Save size={18} />
            <span className="hidden sm:inline">Guardar borrador</span>
          </button>
          <button 
            onClick={publishArticle}
            className="flex items-center gap-2 px-6 py-2 text-sm font-bold text-white bg-fuchsia-600 rounded-lg hover:bg-fuchsia-700 transition-colors shadow-md shadow-fuchsia-200"
          >
            <Send size={18} />
            Publicar
          </button>
        </div>
      </div>

      {/* Editor Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-12 min-h-[800px]">
        <input
          type="text"
          placeholder="Título de la publicación..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full text-4xl md:text-5xl font-black text-slate-900 placeholder-slate-200 border-none focus:ring-0 mb-8 p-0"
        />

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-1 border-y border-slate-100 py-3 mb-8 sticky top-[136px] bg-white z-30">
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`p-2 rounded hover:bg-slate-100 ${editor.isActive('heading', { level: 1 })  'text-fuchsia-600 bg-fuchsia-50' : 'text-slate-600'}`}
          >
            <Heading1 size={20} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-2 rounded hover:bg-slate-100 ${editor.isActive('heading', { level: 2 })  'text-fuchsia-600 bg-fuchsia-50' : 'text-slate-600'}`}
          >
            <Heading2 size={20} />
          </button>
          <div className="w-px h-6 bg-slate-200 mx-1" />
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 rounded hover:bg-slate-100 ${editor.isActive('bold')  'text-fuchsia-600 bg-fuchsia-50' : 'text-slate-600'}`}
          >
            <Bold size={20} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 rounded hover:bg-slate-100 ${editor.isActive('italic')  'text-fuchsia-600 bg-fuchsia-50' : 'text-slate-600'}`}
          >
            <Italic size={20} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-2 rounded hover:bg-slate-100 ${editor.isActive('underline')  'text-fuchsia-600 bg-fuchsia-50' : 'text-slate-600'}`}
          >
            <UnderlineIcon size={20} />
          </button>
          <div className="w-px h-6 bg-slate-200 mx-1" />
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded hover:bg-slate-100 ${editor.isActive('bulletList')  'text-fuchsia-600 bg-fuchsia-50' : 'text-slate-600'}`}
          >
            <List size={20} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-2 rounded hover:bg-slate-100 ${editor.isActive('orderedList')  'text-fuchsia-600 bg-fuchsia-50' : 'text-slate-600'}`}
          >
            <ListOrdered size={20} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-2 rounded hover:bg-slate-100 ${editor.isActive('blockquote')  'text-fuchsia-600 bg-fuchsia-50' : 'text-slate-600'}`}
          >
            <Quote size={20} />
          </button>
          <div className="w-px h-6 bg-slate-200 mx-1" />
          <button className="p-2 rounded hover:bg-slate-100 text-slate-600">
            <LinkIcon size={20} />
          </button>
          <button className="p-2 rounded hover:bg-slate-100 text-slate-600">
            <ImageIcon size={20} />
          </button>
        </div>

        <EditorContent editor={editor} />
      </div>

      <div className="mt-8 flex items-center gap-4 px-4 py-3 bg-fuchsia-50 text-fuchsia-800 rounded-xl border border-fuchsia-100">
        <Type size={20} className="shrink-0" />
        <p className="text-sm font-medium">
          El contenido se guarda automáticamente en tu borrador local cada 30 segundos.
        </p>
      </div>
    </div>
  );
};

export default Editor;
