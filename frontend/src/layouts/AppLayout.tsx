import { Outlet, useLocation } from 'react-router-dom'
import { BottomNav } from '../components/ui/BottomNav'

export function AppLayout() {
  const { pathname } = useLocation()
  const hideNav = pathname === '/login' || pathname === '/register'

  return (
    <div className="min-h-screen bg-surface">
      <Outlet />
      {!hideNav && <BottomNav />}
    </div>
  )
}
