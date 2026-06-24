import { defineConfig, type Plugin } from "vite"
import react from "@vitejs/plugin-react"

// Build ID único por deploy: fuerza cache-bust en browsers con bundle viejo en caché
const BUILD_ID = Date.now().toString(36)

// Plugin que inyecta el BUILD_ID en el index.html durante el build
function novaCacheBusterPlugin(): Plugin {
  return {
    name: "nova-cache-buster",
    transformIndexHtml(html) {
      return html.replace(/%%NOVA_BUILD_ID%%/g, BUILD_ID)
    },
  }
}

export default defineConfig({
  plugins: [react(), novaCacheBusterPlugin()],
  define: {
    __NOVA_BUILD_ID__: JSON.stringify(BUILD_ID),
  },
  worker: {
    // Necesario para que el worker de minería use import() dinámico (randomx.js)
    format: "es",
  },
  server: {
    host: true,
    port: 5174,
    allowedHosts: true,
  },
})