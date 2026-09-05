import { PanelPengaturan } from '../../components/settings/PanelPengaturan'

export function WargaPengaturanPage() {
  return (
    <div className="mx-auto max-w-md px-4 pt-4">
      <header className="mb-4">
        <h1 className="text-xl font-bold text-text-primary">Pengaturan</h1>
        <p className="text-xs text-text-secondary">Tampilan, akun, dan preferensi Anda</p>
      </header>
      <PanelPengaturan />
    </div>
  )
}