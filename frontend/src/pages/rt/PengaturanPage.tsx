import { PanelPengaturan } from '../../components/settings/PanelPengaturan'

export function RTPengaturanPage() {
  return (
    <div className="mx-auto max-w-lg">
      <header className="mb-4">
        <h1 className="text-xl font-bold text-text-primary">Pengaturan</h1>
        <p className="text-xs text-text-secondary">Tampilan dan akun pengurus</p>
      </header>
      <PanelPengaturan />
    </div>
  )
}