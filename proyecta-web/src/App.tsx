import React, { lazy, Suspense } from "react"
import {
  BrowserRouter as Router,
  Navigate,
  Outlet,
  Route,
  Routes,
} from "react-router-dom"
import { Toaster } from "react-hot-toast"

import Navbar from "./components/layout/Navbar"
import { PersistentMiningIndicator } from "./components/PersistentMiningIndicator"
import { AuthProvider, useAuth } from "./context/AuthContext"
import { MiningProvider } from "./context/MiningContext"
import { TraditionalAuthProvider, useTraditionalAuth } from "./context/TraditionalAuthContext"
const ArticleView = lazy(() => import("./pages/ArticleExperience"))
const OpenReviewFeedExperience = lazy(() =>
  import("./pages/CommunityFeedExperience").then((module) => ({ default: module.OpenReviewFeedExperience })),
)
const ReviewedFeedExperience = lazy(() =>
  import("./pages/CommunityFeedExperience").then((module) => ({ default: module.ReviewedFeedExperience })),
)
const ComputeDonationExperience = lazy(() =>
  import("./pages/ComputeDonationExperience").then((module) => ({ default: module.ComputeDonationExperience })),
)
const Editor = lazy(() => import("./pages/EditorExperience"))
const Home = lazy(() => import("./pages/HomeExperience"))
const LoginWithEmailExperience = lazy(() =>
  import("./pages/LoginWithEmailExperience").then((module) => ({ default: module.LoginWithEmailExperience })),
)
const SignUpExperience = lazy(() =>
  import("./pages/SignUpExperience").then((module) => ({ default: module.SignUpExperience })),
)
const CreateProjectExperience = lazy(() =>
  import("./pages/CreateProjectExperience").then((module) => ({ default: module.CreateProjectExperience })),
)
const ProjectsExperience = lazy(() =>
  import("./pages/ProjectsExperience").then((module) => ({ default: module.ProjectsExperience })),
)
const ProjectDetailsExperience = lazy(() =>
  import("./pages/ProjectDetailsExperience").then((module) => ({ default: module.ProjectDetailsExperience })),
)
const MoneroEducationExperience = lazy(() =>
  import("./pages/MoneroEducationExperience").then((module) => ({ default: module.MoneroEducationExperience })),
)
const UserProfileExperience = lazy(() =>
  import("./pages/UserProfileExperience").then((module) => ({ default: module.UserProfileExperience })),
)
const WalletWebExperience = lazy(() =>
  import("./pages/WalletWebExperience").then((module) => ({ default: module.WalletWebExperience })),
)
const OrcidCallback = lazy(() => import("./pages/OrcidCallback"))
const PasswordRecovery = lazy(() => import("./pages/PasswordRecoveryExperience"))
const PasswordReset = lazy(() => import("./pages/PasswordResetExperience"))
const PrivacyNotice = lazy(() => import("./pages/PrivacyNoticeExperience"))
const Profile = lazy(() => import("./pages/ProfileExperience"))

function RouteFallback() {
  return (
    <div className="nova-card mx-auto flex min-h-[35vh] max-w-xl items-center justify-center px-8 text-center">
      <p className="text-sm font-semibold text-slate-600">Cargando contenido...</p>
    </div>
  )
}

function PrivateRoute({ children }: { children: React.ReactElement }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="nova-card mx-auto flex min-h-[40vh] max-w-xl items-center justify-center px-8 text-center">
        <div className="space-y-3">
          <p className="nova-eyebrow">Sincronizando identidad</p>
          <h2 className="nova-title text-2xl font-extrabold text-slate-900">
            Preparando tu sesión científica
          </h2>
          <p className="text-sm leading-7 text-slate-500">
            Estamos preparando tu sesión para mostrarte el editor, tu perfil y tu actividad dentro de la comunidad.
          </p>
        </div>
      </div>
    )
  }

  return user ? children : <Navigate to="/login" />
}

function TraditionalPrivateRoute({ children }: { children: React.ReactElement }) {
  const { user, initialized } = useTraditionalAuth()

  if (!initialized) {
    return (
      <div className="nova-card mx-auto flex min-h-[40vh] max-w-xl items-center justify-center px-8 text-center">
        <div className="space-y-3">
          <p className="nova-eyebrow">Sincronizando identidad</p>
          <h2 className="nova-title text-2xl font-extrabold text-slate-900">
            Preparando tu sesión científica
          </h2>
          <p className="text-sm leading-7 text-slate-500">
            Estamos preparando tu sesión para abrir Monero Web en una pestaña aparte y volver luego con la dirección pública.
          </p>
        </div>
      </div>
    )
  }

  return user ? children : <Navigate to="/login" />
}
function LayoutWrapper() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-transparent font-sans text-slate-900">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[-10%] top-[-8%] h-72 w-72 rounded-full bg-fuchsia-300/25 blur-3xl" />
        <div className="absolute right-[-8%] top-16 h-80 w-80 rounded-full bg-purple-300/25 blur-3xl" />
        <div className="absolute bottom-[-8%] left-1/3 h-72 w-72 rounded-full bg-rose-200/25 blur-3xl" />
      </div>

      <Navbar />

      <main className="relative mx-auto max-w-[1440px] px-4 pb-14 pt-28 sm:px-6 md:pt-32 lg:px-8 lg:pt-32">
        <Outlet />
      </main>

      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            borderRadius: "20px",
            background: "rgba(12, 21, 42, 0.92)",
            color: "#f8fbff",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 24px 60px rgba(15, 23, 42, 0.22)",
          },
        }}
      />
    </div>
  )
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginWithEmailExperience />} />
      <Route path="/signup" element={<SignUpExperience />} />

      <Route element={<LayoutWrapper />}>
        <Route path="/" element={<Home />} />
        <Route path="/projects" element={<ProjectsExperience />} />
        <Route path="/projects/:id" element={<ProjectDetailsExperience />} />
        <Route path="/create" element={<CreateProjectExperience />} />
        <Route path="/sobre-monero" element={<MoneroEducationExperience />} />
        <Route path="/create-project" element={<CreateProjectExperience />} />
        <Route path="/profile" element={<UserProfileExperience />} />
        <Route path="/revisadas" element={<ReviewedFeedExperience />} />
        <Route path="/por-revisar" element={<OpenReviewFeedExperience />} />
        <Route path="/recuperar-contraseña" element={<PasswordRecovery />} />
        <Route path="/restablecer-contraseña" element={<PasswordReset />} />
        <Route path="/aviso-de-privacidad" element={<PrivacyNotice />} />
        <Route path="/computacion-donada" element={<ComputeDonationExperience />} />
        <Route path="/orcid/callback" element={<OrcidCallback />} />
        <Route path="/article/:id" element={<ArticleView />} />

        <Route
          path="/editor"
          element={
            <PrivateRoute>
              <Editor />
            </PrivateRoute>
          }
        />

        <Route
          path="/editor/:id"
          element={
            <PrivateRoute>
              <Editor />
            </PrivateRoute>
          }
        />

        <Route
          path="/profile/:id"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />

        <Route
          path="/wallet-web"
          element={
            <TraditionalPrivateRoute>
              <WalletWebExperience />
            </TraditionalPrivateRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Route>
    </Routes>
  )
}

function App() {
  return (
    <TraditionalAuthProvider>
      <AuthProvider>
        <Router>
          <MiningProvider>
            <Suspense fallback={<RouteFallback />}>
              <AppRoutes />
            </Suspense>
            <PersistentMiningIndicator />
          </MiningProvider>
        </Router>
      </AuthProvider>
    </TraditionalAuthProvider>
  )
}

export default App




