import React, { useEffect, useState } from "react"

type Article = {
  id: string
  title: string
  excerpt: string
  author: {
    name: string
  }
  createdAt: string
}

export default function Home() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("http://localhost:3000/api/articles")
      .then(res => res.json())
      .then(data => {
        setArticles(data || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div className="grid grid-cols-12 gap-6">

      <div className="col-span-3 space-y-6">

        <div>
          <h3 className="text-xs font-semibold text-gray-400 mb-3">CATEGORÍAS</h3>
          <ul className="space-y-2 text-sm">
            <li>Biotecnología</li>
            <li>Física Cuántica</li>
            <li>Ecología</li>
            <li>Ciencias Sociales</li>
            <li>Inteligencia Artificial</li>
            <li>Medicina</li>
          </ul>
        </div>

        <div className="bg-white p-4 rounded-xl border">
          <h4 className="font-semibold mb-2">Temas Tendencia</h4>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="bg-gray-100 px-2 py-1 rounded">#OpenScience</span>
            <span className="bg-gray-100 px-2 py-1 rounded">#IA</span>
            <span className="bg-gray-100 px-2 py-1 rounded">#Biotech</span>
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

        {!loading && articles.length === 0 && (
          <p className="text-gray-500">No hay artículos aún</p>
        )}

        {articles.map(article => (
          <div key={article.id} className="bg-white p-5 rounded-xl border">

            <div className="text-sm text-gray-500 mb-2">
              {article.author.name}
            </div>

            <h2 className="text-lg font-semibold mb-2">
              {article.title}
            </h2>

            <p className="text-gray-600 text-sm">
              {article.excerpt}
            </p>

          </div>
        ))}

      </div>

      <div className="col-span-3 space-y-6">

        <div className="bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white p-6 rounded-xl">
          <h3 className="font-semibold text-lg mb-2">Identidad Proyecta</h3>
          <p className="text-sm mb-4">
            Verifica tu ORCID para aumentar credibilidad científica
          </p>

          <button
            onClick={() => {
              window.location.href = "http://localhost:3000/api/oauth/orcid"
            }}
            className="bg-white text-fuchsia-600 px-4 py-2 rounded-lg text-sm font-medium"
          >
            Verificar mi ORCID
          </button>
        </div>

        <div className="bg-white p-4 rounded-xl border">
          <h4 className="font-semibold mb-3">Últimas revisiones</h4>
          <p className="text-sm text-gray-500">
            Próximamente...
          </p>
        </div>

      </div>

    </div>
  )
}
