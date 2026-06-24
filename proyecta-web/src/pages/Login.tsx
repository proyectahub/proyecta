import React from "react"

export default function Login() {

  const API_URL = import.meta.env.VITE_API_URL

const handleOrcidLogin = () => {
  window.location.href = `${API_URL}/api/oauth/orcid`
}
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border p-8">

        {/* Icono */}
        <div className="flex justify-center mb-4">
          <div className="bg-fuchsia-100 p-3 rounded-xl">
            <span className="text-2xl">🎓</span>
          </div>
        </div>

        {/* Título */}
        <h1 className="text-2xl font-bold text-center text-slate-800">
          Bienvenido a Proyecta
        </h1>

        <p className="text-center text-slate-500 mt-2 mb-6">
          La plataforma de divulgación científica con identidad verificada.
        </p>

        {/* ORCID BUTTON */}
        <button
          onClick={handleOrcidLogin}
          className="w-full flex items-center justify-center gap-3 border rounded-lg py-3 hover:bg-slate-50 transition"
        >
          <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-bold">
            iD
          </span>
          <span className="font-medium text-slate-700">
            Acceder con ORCID iD
          </span>
          <span className="text-green-500">✔</span>
        </button>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="px-3 text-sm text-slate-400">
            O MEDIANTE CORREO
          </span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        {/* Email */}
        <div className="mb-4">
          <label className="text-sm text-slate-600">Email</label>
          <input
            type="email"
            placeholder="tu@universidad.edu"
            className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
          />
        </div>

        {/* Password */}
        <div className="mb-6">
          <label className="text-sm text-slate-600">Contraseña</label>
          <input
            type="password"
            placeholder="••••••••"
            className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
          />
        </div>

        {/* Submit */}
        <button className="w-full bg-fuchsia-600 text-white py-3 rounded-lg font-medium hover:bg-fuchsia-700 transition">
          Iniciar sesión
        </button>

        {/* Footer */}
        <p className="text-xs text-center text-slate-400 mt-4">
          Al registrarte, aceptas nuestras políticas de divulgación abierta y ética científica.
        </p>

      </div>
    </div>
  )
}