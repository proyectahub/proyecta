import React, { useEffect } from "react"
import {
  BrowserRouter as Router,
  Navigate,
  Route,
  Routes,
} from "react-router-dom"
import { Toaster } from "react-hot-toast"

import { ComputeDonationPopupContainer } from "./components/ComputeDonationPopupContainer"
import { ComputeDonationWidget } from "./components/ComputeDonationWidget"
import Navbar from "./components/layout/Navbar"
import { AuthProvider, useAuth } from "./context/AuthContext"
import { WalletAuthProvider } from "./context/WalletAuthContext"
import { TraditionalAuthProvider } from "./context/TraditionalAuthContext"
import { seedTestProjects } from "./utils/testProjects"
import ArticleView from "./pages/ArticleExperience"
import {
  OpenReviewFeedExperience,
  ReviewedFeedExperience,
} from "./pages/CommunityFeedExperience"
import { ComputeDonationExperience } from "./pages/ComputeDonationExperience"
import Editor from "./pages/EditorExperience"
import Home from "./pages/HomeExperience"
import { LoginExperience } from "./pages/LoginExperience"
import { LoginWithEmailExperience } from "./pages/LoginWithEmailExperience"
import { SignUpExperience } from "./pages/SignUpExperience"
import { CreateProjectExperience } from "./pages/CreateProjectExperience"
import { ProjectsExperience } from "./pages/ProjectsExperience"
import { ProjectDetailsExperience } from "./pages/ProjectDetailsExperience"
import { UserProfileExperience } from "./pages/UserProfileExperience"
import { CompleteProfileExperience } from "./pages/CompleteProfileExperience"
import OrcidCallback from "./pages/OrcidCallback"
import PasswordRecovery from "./pages/PasswordRecoveryExperience"
import PasswordReset from "./pages/PasswordResetExperience"
import PrivacyNotice from "./pages/PrivacyNoticeExperience"
import Profile from "./pages/ProfileExperience"

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

function LayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-transparent font-sans text-slate-900">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[-10%] top-[-8%] h-72 w-72 rounded-full bg-fuchsia-300/25 blur-3xl" />
        <div className="absolute right-[-8%] top-16 h-80 w-80 rounded-full bg-purple-300/25 blur-3xl" />
        <div className="absolute bottom-[-8%] left-1/3 h-72 w-72 rounded-full bg-rose-200/25 blur-3xl" />
      </div>

      {/* Popup de donación (mostrado después de N interacciones) */}
      <ComputeDonationPopupContainer />

      {/* Widget flotante cuando está donando */}
      <ComputeDonationWidget />

      <Navbar />

      <main className="relative mx-auto max-w-[1440px] px-4 pb-14 pt-28 sm:px-6 md:pt-32 lg:px-8 lg:pt-32">
        {children}
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
      {/* Login, Signup, Profile Setup y Create Project sin layout */}
      <Route path="/login" element={<LoginWithEmailExperience />} />
      <Route path="/signup" element={<SignUpExperience />} />
      <Route path="/complete-profile" element={<CompleteProfileExperience />} />
      <Route path="/create-project" element={<CreateProjectExperience />} />

      {/* Resto con layout */}
      <Route
        path="*"
        element={
          <LayoutWrapper>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/projects" element={<ProjectsExperience />} />
              <Route path="/projects/:id" element={<ProjectDetailsExperience />} />
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

              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </LayoutWrapper>
        }
      />
    </Routes>
  )
}

function App() {
  useEffect(() => {
    // Seed test projects on app load
    seedTestProjects()
  }, [])

  return (
    <TraditionalAuthProvider>
      <AuthProvider>
        <WalletAuthProvider>
          <Router>
            <AppRoutes />
          </Router>
        </WalletAuthProvider>
      </AuthProvider>
    </TraditionalAuthProvider>
  )
}

export default App
