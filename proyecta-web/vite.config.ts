import { defineConfig, type Plugin } from "vite"
import { fileURLToPath, URL } from "node:url"
import react from "@vitejs/plugin-react"

// A unique build ID forces browsers to discard a previously loaded bundle.
const BUILD_ID = Date.now().toString(36)

function proyectaCacheBusterPlugin(): Plugin {
  return {
    name: "proyecta-cache-buster",
    transformIndexHtml(html) {
      return html.replace(/%%PROYECTA_BUILD_ID%%/g, BUILD_ID)
    },
  }
}

export default defineConfig({
  plugins: [react(), proyectaCacheBusterPlugin()],
  worker: {
    // Necesario para que el worker de minería use import() dinámico (randomx.js)
    format: "es",
  },
  resolve: {
    alias: {
      os: fileURLToPath(new URL('./src/shims/os.ts', import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'editor-vendor': [
            '@tiptap/react',
            '@tiptap/starter-kit',
            '@tiptap/extension-image',
            '@tiptap/extension-link',
            '@tiptap/extension-table',
          ],
          'pdf-vendor': ['pdfjs-dist'],
          'docx-vendor': ['mammoth'],
          'icon-vendor': ['lucide-react'],
        },
      },
    },
  },
  server: {
    host: true,
    port: 5174,
    allowedHosts: true,
  },
})
