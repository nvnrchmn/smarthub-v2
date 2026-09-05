import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
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
import { TagihanSayaPage } from './pages/warga/TagihanSayaPage'
import { ForumWargaPage } from './pages/warga/ForumPage'
import { LapakWargaPage } from './pages/warga/LapakPage'
import { WargaPengaturanPage } from './pages/warga/PengaturanPage'
import { ForumDetailPage } from './pages/forum/ForumDetailPage'

// RT pages
import { RTDashboard } from './pages/rt/Dashboard'
import { RTRumahPage } from './pages/rt/RumahPage'
import { RTWargaPage } from './pages/rt/WargaPage'
import { RTTagihanPage } from './pages/rt/TagihanPage'
import { ForumRT } from './pages/rt/ForumRT'
import { LapakRT } from './pages/rt/LapakRT'
import { RTPengaturanPage } from './pages/rt/PengaturanPage'

// Admin pages
import { AdminDashboard } from './pages/admin/Dashboard'
import { TenantsPage } from './pages/admin/TenantsPage'
import { UsersPage } from './pages/admin/UsersPage'
import { SettingsPage } from './pages/admin/SettingsPage'

export default function App() {
  return (
    <ThemeProvider>
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
          <Route path="/app/tagihan" element={<TagihanSayaPage />} />
          <Route path="/app/forum" element={<ForumWargaPage />} />
          <Route path="/app/forum/:id" element={<ForumDetailPage />} />
          <Route path="/app/lapak" element={<LapakWargaPage />} />
          <Route path="/app/pengaturan" element={<WargaPengaturanPage />} />
        </Route>

        {/* Ketua RT */}
        <Route element={<ProtectedRoute roles={['ketua_rt']}><RTLayout /></ProtectedRoute>}>
          <Route path="/rt" element={<RTDashboard />} />
          <Route path="/rt/rumah" element={<RTRumahPage />} />
          <Route path="/rt/warga" element={<RTWargaPage />} />
          <Route path="/rt/tagihan" element={<RTTagihanPage />} />
          <Route path="/rt/forum" element={<ForumRT />} />
          <Route path="/rt/forum/:id" element={<ForumDetailPage />} />
          <Route path="/rt/lapak" element={<LapakRT />} />
          <Route path="/rt/pengaturan" element={<RTPengaturanPage />} />
        </Route>

        {/* Super Admin */}
        <Route element={<ProtectedRoute roles={['super_admin']}><AdminLayout /></ProtectedRoute>}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/tenants" element={<TenantsPage />} />
          <Route path="/admin/users" element={<UsersPage />} />
          <Route path="/admin/settings" element={<SettingsPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
    </ThemeProvider>
  )
}
