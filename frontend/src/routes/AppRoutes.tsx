import { BrowserRouter, Link, Outlet, Route, Routes, useParams } from 'react-router-dom'
import { Navbar } from '../components/Navbar'
import { AuthProvider } from '../context/AuthContext'
import { ToastProvider } from '../context/ToastContext'
import { LoginPage } from '../pages/LoginPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { ProfilePage } from '../pages/ProfilePage'
import { RegisterPage } from '../pages/RegisterPage'
import { StallDetailPage } from '../pages/StallDetailPage'
import { StallFormPage } from '../pages/StallFormPage'
import { StallListPage } from '../pages/StallListPage'
import { ProtectedRoute } from './ProtectedRoute'

function SiteLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex-1"><Outlet /></div>
      <footer className="border-t border-emerald-950/10 bg-white/70">
        <div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-2 px-5 py-5 text-xs text-slate-500 sm:px-8">
          <span>Ngantin Sayang · Makan Dulu</span>
          <Link to="/" className="font-semibold text-emerald-900 hover:underline">Jelajahi warung</Link>
        </div>
      </footer>
    </div>
  )
}

function StallFormRoute() {
  const { id } = useParams()
  return <StallFormPage key={id ?? 'new'} />
}

export function AppRoutes() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route element={<SiteLayout />}>
              <Route path="/" element={<StallListPage />} />
              <Route path="/stalls/:id" element={<StallDetailPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path="/stalls/new" element={<ProtectedRoute roles={['owner', 'admin']}><StallFormRoute /></ProtectedRoute>} />
              <Route path="/stalls/:id/edit" element={<ProtectedRoute roles={['owner', 'admin']}><StallFormRoute /></ProtectedRoute>} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}