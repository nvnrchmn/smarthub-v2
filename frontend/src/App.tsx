import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'

// Layouts
import { PublicLayout } from './layouts/PublicLayout'
import { AppLayout } from './layouts/AppLayout'
import { RTLayout } from './layouts/RTLayout'
import { AdminLayout } from './layouts/AdminLayout'

// Public Pages
import { LandingPage } from './pages/public/LandingPage'
import { LoginPage } from './pages/public/LoginPage'
import { RegisterPage } from './pages/public/RegisterPage'
import { UnauthorizedPage } from './pages/public/UnauthorizedPage'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public */}
        <Route element={<PublicLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
        </Route>

        {/* Warga */}
        <Route element={<ProtectedRoute roles={['warga', 'ketua_rt']}><AppLayout /></ProtectedRoute>}>
          <Route path="/app/*" element={<Navigate to="/app" replace />} />
        </Route>

        {/* Ketua RT */}
        <Route element={<ProtectedRoute roles={['ketua_rt']}><RTLayout /></ProtectedRoute>}>
          <Route path="/rt" element={<RTLayout />} />
        </Route>

        {/* Super Admin */}
        <Route element={<ProtectedRoute roles={['super_admin']}><AdminLayout /></ProtectedRoute>}>
          <Route path="/admin" element={<AdminLayout />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}
