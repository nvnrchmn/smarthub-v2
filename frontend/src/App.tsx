import { Routes, Route, Navigate } from 'react-router-dom'
import { BottomNav } from './components/BottomNav'
import { HomePage } from './pages/HomePage'
import { TagihanPage } from './pages/TagihanPage'
import { ForumPage, LapakPage } from './pages/OtherPages'

export default function App() {
  return (
    <div className="min-h-dvh bg-surface pb-20">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/tagihan" element={<TagihanPage />} />
        <Route path="/forum" element={<ForumPage />} />
        <Route path="/lapak" element={<LapakPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <BottomNav />
    </div>
  )
}
