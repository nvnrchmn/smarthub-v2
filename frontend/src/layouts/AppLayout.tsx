import { Outlet, useLocation } from 'react-router-dom'
import { BottomNav } from '../components/ui/BottomNav'

export function AppLayout() {
  const { pathname } = useLocation()
  const hideNav = pathname === '/login' || pathname === '/register'

  return (
    <div className="h-dvh flex flex-col bg-surface">
      <main className="flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain">
        <Outlet />
      </main>
      {!hideNav && <BottomNav />}
    </div>
  )
}
