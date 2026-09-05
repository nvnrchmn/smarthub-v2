import { Outlet, useLocation } from 'react-router-dom'
import { BottomNav } from '../components/ui/BottomNav'
import { cn } from '../lib/utils'
import { NotificationBell } from '../components/ui/NotificationBell'
import { useAuth } from '../context/AuthContext'

export function AppLayout() {
  const { pathname } = useLocation()
  const { user } = useAuth()
  const hideNav = pathname === '/login' || pathname === '/register'
  const subInactive =
    user?.tenant_status && user.tenant_status !== 'AKTIF' ? user.tenant_status : null

  return (
    <div className="h-dvh flex flex-col bg-surface">
      {subInactive && (
        <div className="sticky top-0 z-40 border-b border-amber-500/30 bg-amber-500/10 px-4 py-2 text-center text-xs font-medium text-amber-300">
          ⚠️ Status langganan RT-mu: {subInactive}. Data masih bisa diakses — hubungi
          pengelola Logikraf untuk perpanjangan.
        </div>
      )}
      <main className={cn("flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain", !hideNav && "pb-24")}>
        <Outlet />
      </main>
      {!hideNav && (
        <>
          <BottomNav />
          <div className="fixed bottom-20 right-4 z-50">
            <NotificationBell />
          </div>
        </>
      )}
    </div>
  )
}
