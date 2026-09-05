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
import { RegisterPengurusPage } from './pages/public/RegisterPengurusPage'
import { GabungRTPage } from './pages/public/GabungRTPage'
import { PendingApprovalPage } from './pages/public/PendingApprovalPage'
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
import { RTSettlementPage } from './pages/rt/SettlementPage'

// Admin pages
import { AdminDashboard } from './pages/admin/Dashboard'
import { TenantsPage } from './pages/admin/TenantsPage'
import { UsersPage } from './pages/admin/UsersPage'
import { SettingsPage } from './pages/admin/SettingsPage'
import { AdminSettlementPage } from './pages/admin/SettlementPage'
import { TenantDetailPage } from './pages/admin/TenantDetailPage'
import { AuditLogPage } from './pages/admin/AuditLogPage'
import { BroadcastPage } from './pages/admin/BroadcastPage'
import { AnalyticsPage } from './pages/admin/AnalyticsPage'

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
          <Route path="/register-pengurus" element={<RegisterPengurusPage />} />
          <Route path="/gabung-rt" element={<GabungRTPage />} />
          <Route path="/pending-approval" element={<PendingApprovalPage />} />
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
          <Route path="/rt/settlement" element={<RTSettlementPage />} />
        </Route>

        {/* Super Admin */}
        <Route element={<ProtectedRoute roles={['super_admin']}><AdminLayout /></ProtectedRoute>}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/tenants" element={<TenantsPage />} />
          <Route path="/admin/users" element={<UsersPage />} />
          <Route path="/admin/settings" element={<SettingsPage />} />
          <Route path="/admin/settlement" element={<AdminSettlementPage />} />
          <Route path="/admin/tenants/:id" element={<TenantDetailPage />} />
          <Route path="/admin/audit-logs" element={<AuditLogPage />} />
          <Route path="/admin/broadcast" element={<BroadcastPage />} />
          <Route path="/admin/analytics" element={<AnalyticsPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
    </ThemeProvider>
  )
}
