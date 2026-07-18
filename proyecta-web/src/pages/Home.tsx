import React, { useEffect, useState } from "react"
import { feedArticles } from "../data/mockData"
import { API_BASE } from "../lib/api"

export default function Home() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 0)
    return () => window.clearTimeout(timer)
  }, [])

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-3 space-y-6">
        <div>
          <h3 className="mb-3 text-xs font-semibold text-gray-400">CATEGORÍAS</h3>
          <ul className="space-y-2 text-sm">
            <li>Biotecnología</li>
            <li>Física Cuántica</li>
            <li>Ecología</li>
            <li>Ciencias Sociales</li>
            <li>Inteligencia Artificial</li>
            <li>Medicina</li>
          </ul>
        </div>

        <div className="rounded-xl border bg-white p-4">
          <h4 className="mb-2 font-semibold">Temas Tendencia</h4>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="rounded bg-gray-100 px-2 py-1">#OpenScience</span>
            <span className="rounded bg-gray-100 px-2 py-1">#IA</span>
            <span className="rounded bg-gray-100 px-2 py-1">#Biotech</span>
          </div>
        </div>
      </div>

      <div className="col-span-6 space-y-6">
        <div className="flex gap-6 border-b pb-2 text-sm">
          <span className="font-semibold text-fuchsia-600">Tendencia</span>
          <span className="text-gray-500">Recientes</span>
          <span className="text-gray-500">Mejor evaluados</span>
        </div>

        {loading && <p>Cargando artículos...</p>}

        {!loading && feedArticles.length === 0 && <p className="text-gray-500">No hay artículos aún</p>}

        {!loading &&
          feedArticles.map((article) => (
            <div key={article.id} className="rounded-xl border bg-white p-5">
              <div className="mb-2 text-sm text-gray-500">{article.author.name}</div>
              <h2 className="mb-2 text-lg font-semibold">{article.title}</h2>
              <p className="text-sm text-gray-600">{article.excerpt}</p>
            </div>
          ))}
      </div>

      <div className="col-span-3 space-y-6">
        <div className="rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-600 p-6 text-white">
          <h3 className="mb-2 text-lg font-semibold">Identidad Proyecta</h3>
          <p className="mb-4 text-sm">Verifica tu ORCID para aumentar credibilidad científica</p>
          <button
            onClick={() => {
              window.location.href = `${API_BASE}/api/oauth/orcid`
            }}
            className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-fuchsia-600"
          >
            Verificar mi ORCID
          </button>
        </div>

        <div className="rounded-xl border bg-white p-4">
          <h4 className="mb-3 font-semibold">Últimas revisiones</h4>
          <p className="text-sm text-gray-500">Próximamente...</p>
        </div>
      </div>
    </div>
  )
}
