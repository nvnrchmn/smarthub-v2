import { Outlet, useLocation } from 'react-router-dom'
import { BottomNav } from '../components/ui/BottomNav'
import { cn } from '../lib/utils'
import { NotificationBell } from '../components/ui/NotificationBell'

export function AppLayout() {
  const { pathname } = useLocation()
  const hideNav = pathname === '/login' || pathname === '/register'

  return (
    <div className="h-dvh flex flex-col bg-surface">
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
