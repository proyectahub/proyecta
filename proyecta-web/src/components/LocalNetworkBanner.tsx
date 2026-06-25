import { useEffect, useState } from 'react'
import { Copy, Smartphone, Wifi } from 'lucide-react'

export function LocalNetworkBanner() {
  const [localURL, setLocalURL] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    // Detectar si es móvil
    const userAgent = navigator.userAgent
    const isMobileDevice =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
    setIsMobile(isMobileDevice)

    // Obtener IP local del servidor
    fetch('/api/local-ip')
      .then((res) => res.json())
      .then((data) => {
        setLocalURL(data.url)
      })
      .catch((err) => console.error('Error fetching local IP:', err))
  }, [])

  const copyToClipboard = () => {
    if (localURL) {
      navigator.clipboard.writeText(localURL)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // Si es móvil, mostrar banner con dirección para abrir en otros dispositivos
  if (isMobile && localURL) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 safe-area-inset-b z-40">
        <div className="max-w-md mx-auto space-y-3">
          <div className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            <p className="font-bold text-sm">Abre en otro dispositivo</p>
          </div>

          <div className="bg-white bg-opacity-20 rounded-lg p-3 space-y-2">
            <p className="text-xs opacity-90">En la misma red WiFi:</p>
            <div className="flex gap-2 items-center">
              <code className="text-xs bg-white bg-opacity-10 px-3 py-2 rounded flex-1 break-all font-mono">
                {localURL}
              </code>
              <button
                onClick={copyToClipboard}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 p-2 rounded transition"
                title="Copiar dirección"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
            {copied && (
              <p className="text-xs text-green-200">✅ Copiado al portapapeles</p>
            )}
          </div>

          <p className="text-xs opacity-75 flex items-center gap-1">
            <Wifi className="h-3 w-3" />
            Comparte esta dirección para que otros usen PROYECTA
          </p>
        </div>
      </div>
    )
  }

  // Si es desktop, mostrar banner superior con opción de abrir en móvil
  if (!isMobile && localURL) {
    return (
      <div className="bg-gradient-to-r from-purple-100 to-blue-100 border-b-2 border-purple-300 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Smartphone className="h-5 w-5 text-purple-600" />
            <div className="text-sm">
              <p className="font-bold text-slate-900">Abre en tu móvil o tablet</p>
              <p className="text-xs text-slate-600">Misma red WiFi</p>
            </div>
          </div>

          <div className="flex gap-2 items-center">
            <code className="text-xs bg-white px-3 py-2 rounded font-mono text-slate-700 border border-purple-300">
              {localURL}
            </code>
            <button
              onClick={copyToClipboard}
              className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded transition"
              title="Copiar dirección"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>

          {copied && (
            <p className="text-xs text-green-600 font-bold">✅ Copiado</p>
          )}
        </div>
      </div>
    )
  }

  return null
}
