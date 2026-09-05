import { Outlet, useLocation } from 'react-router-dom'
import { BottomNav } from '../components/ui/BottomNav'

export function AppLayout() {
  const { pathname } = useLocation()
  const hideNav = pathname === '/login' || pathname === '/register'
  return (
    <div key={pathname} className="page-enter min-h-screen bg-surface pb-28">
      <Outlet />
      {!hideNav && <BottomNav />}
    </div>
  )
}