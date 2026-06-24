import { Link, useLocation } from "react-router-dom"
import {
  ArrowUpRight,
  BookOpen,
  BookOpenText,
  LogOut,
  PlusSquare,
  Search,
  Sparkles,
  User,
  ChevronDown,
} from "lucide-react"
import { useState } from "react"

import { useAuth } from "../../context/AuthContext"
import { useTraditionalAuth } from "../../context/TraditionalAuthContext"
import { ProyectaBrandLockup, ProyectaMark } from "../brand/ProyectaBrand"

function Navbar() {
  const { user, logout } = useAuth()
  const { user: traditionalUser, logout: logoutTraditional } = useTraditionalAuth()
  const location = useLocation()
  const [showDropdown, setShowDropdown] = useState(false)

  // Usar usuario de cualquier contexto
  const currentUser = traditionalUser || user
  const isAuthenticated = !!currentUser

  const handleLogout = async () => {
    if (traditionalUser) {
      logoutTraditional()
    } else if (user) {
      await logout()
    }
  }

  const isAccessRoute =
    location.pathname === "/login" ||
    location.pathname === "/recuperar-contraseña" ||
    location.pathname === "/restablecer-contraseña"

  const pageLabel =
    location.pathname === "/login"
      ? "Acceso"
      : location.pathname.startsWith("/article")
        ? "Lectura"
        : location.pathname === "/revisadas"
          ? "Feed revisado"
          : location.pathname === "/por-revisar"
            ? "Por revisar"
            : location.pathname.startsWith("/editor")
              ? "Editor"
              : location.pathname.startsWith("/profile")
                ? "Perfil"
                : location.pathname.startsWith("/projects")
                  ? "Proyectos"
                  : location.pathname === "/create-project"
                    ? "Crear Proyecto"
                    : "Inicio"

  return (
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-slate-200 bg-white shadow-sm">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 py-4">
          {/* Logo y marca */}
          <Link to="/" className="group flex shrink-0 items-center">
            <span className="sm:hidden">
              <ProyectaMark size={40} glow={false} />
            </span>
            <ProyectaBrandLockup
              markSize={48}
              compact
              className="hidden transition-transform group-hover:-translate-y-0.5 sm:flex"
            />
          </Link>

          {/* Página actual */}
          <div className="hidden rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-600 lg:inline-flex lg:items-center lg:gap-2">
            <Sparkles size={14} className="text-fuchsia-500" />
            {pageLabel}
          </div>

          {/* Botones de navegación */}
          <div className="hidden sm:flex items-center gap-2 md:gap-3 lg:gap-4">
            <Link
              to="/projects"
              className="nova-button-soft px-4 py-2.5 md:px-5 flex items-center gap-2"
            >
              <BookOpen size={18} />
              <span className="hidden sm:inline text-sm font-semibold">Explorar</span>
            </Link>

            <Link
              to="/projects"
              className="nova-button-soft px-4 py-2.5 md:px-5 flex items-center gap-2"
            >
              <BookOpenText size={18} />
              <span className="hidden sm:inline text-sm font-semibold">Apoyar</span>
            </Link>

            <Link
              to={isAuthenticated ? "/create-project" : "/login?intent=publish"}
              className="nova-button-solid px-4 py-2.5 md:px-5 flex items-center gap-2"
            >
              <PlusSquare size={18} />
              <span className="hidden sm:inline text-sm font-semibold">Crear Proyecto</span>
            </Link>
          </div>

          {/* Usuario o botón de acceso */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 hover:bg-slate-100 transition"
              >
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900">
                    {currentUser?.fullName || currentUser?.name || currentUser?.email?.split('@')[0] || 'Usuario'}
                  </p>
                  <p className="text-xs text-slate-500">
                    {currentUser?.institution || 'Investigador'}
                  </p>
                </div>
                <ChevronDown size={18} className={`text-slate-600 transition ${showDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-72 rounded-lg border border-slate-200 bg-white shadow-lg z-50">
                  {/* Info del usuario */}
                  <div className="border-b border-slate-200 p-4 space-y-2">
                    <p className="font-bold text-slate-900 text-base">
                      {currentUser?.fullName || currentUser?.name || 'Usuario'}
                    </p>
                    <p className="text-sm text-slate-600">{currentUser?.email || ''}</p>
                    {currentUser?.researchArea && (
                      <p className="text-sm text-slate-600">🔬 {currentUser.researchArea}</p>
                    )}
                    {currentUser?.orcidId && (
                      <p className="text-sm text-blue-600">ORCID: {currentUser.orcidId}</p>
                    )}
                  </div>

                  {/* Opciones del dropdown */}
                  <div className="p-2 space-y-1">
                    <Link
                      to="/profile"
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                    >
                      <User size={18} />
                      Mi Perfil
                    </Link>

                    <button
                      onClick={() => {
                        handleLogout()
                        setShowDropdown(false)
                      }}
                      className="w-full flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 transition"
                    >
                      <LogOut size={18} />
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="nova-button-soft">
              Acceder
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
