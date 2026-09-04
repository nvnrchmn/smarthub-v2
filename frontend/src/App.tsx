import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'

// Layouts
import { PublicLayout } from './layouts/PublicLayout'
import { AppLayout } from './layouts/AppLayout'
import { RTLayout } from './layouts/RTLayout'
import { AdminLayout } from './layouts/AdminLayout'

// Public pages
import { LandingPage } from './pages/public/LandingPage'
import { LoginPage } from './pages/public/LoginPage'
import { RegisterPage } from './pages/public/RegisterPage'
import { UnauthorizedPage } from './pages/public/UnauthorizedPage'

// Warga pages
import { WargaDashboard } from './pages/warga/Dashboard'

// RT pages
import { RTDashboard } from './pages/rt/Dashboard'

// Admin pages
import { AdminDashboard } from './pages/admin/Dashboard'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
        </Route>

        {/* Warga */}
        <Route element={<ProtectedRoute roles={['warga']}><AppLayout /></ProtectedRoute>}>
          <Route path="/app" element={<WargaDashboard />} />
        </Route>

        {/* Ketua RT */}
        <Route element={<ProtectedRoute roles={['ketua_rt']}><RTLayout /></ProtectedRoute>}>
          <Route path="/rt" element={<RTDashboard />} />
        </Route>

        {/* Super Admin */}
        <Route element={<ProtectedRoute roles={['super_admin']}><AdminLayout /></ProtectedRoute>}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}
