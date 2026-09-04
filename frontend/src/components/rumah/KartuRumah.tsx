import { StatusDot } from './StatusDot'

interface Props {
  namaJalanGang: string
  nomorRumah: string
  statusHunian: 'Dihuni' | 'Kosong'
}

export function KartuRumah({ namaJalanGang, nomorRumah, statusHunian }: Props) {
  return (
    <div className={`rounded-xl border-l-[3px] bg-surface-card p-4 ${statusHunian === 'Dihuni' ? 'border-status-paid' : 'border-status-overdue'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-50 text-primary">
            <span className="text-lg">🏠</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-text-primary">{namaJalanGang} No. {nomorRumah}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <StatusDot status={statusHunian} />
              <span className="text-xs text-text-secondary">{statusHunian}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
