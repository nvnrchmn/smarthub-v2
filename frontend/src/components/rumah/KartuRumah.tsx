import { StatusDot } from './StatusDot'
import { Icon } from '../ui/Icon'

interface Props {
  namaJalanGang: string
  nomorRumah: string
  statusHunian: 'Dihuni' | 'Kosong'
}

/* Kartu rumah — komponen paling sering dilihat pengurus (Design.md).
   Border kiri tebal + dot status = terbaca 1 detik tanpa warna saja. */
export function KartuRumah({ namaJalanGang, nomorRumah, statusHunian }: Props) {
  const border = statusHunian === 'Dihuni' ? 'border-status-paid' : 'border-status-empty'
  return (
    <div className={`rounded-xl border-l-4 bg-surface-card p-4 shadow-[0_1px_3px_rgba(0,0,0,0.08)] ${border}`}>
      <div className="flex items-center gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary-50 text-primary">
          <Icon name="home" size={20} aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-semibold text-text-primary">
            {namaJalanGang} No. {nomorRumah}
          </p>
          <div className="mt-0.5 flex items-center gap-1.5">
            <StatusDot status={statusHunian} />
            <span className="text-xs text-text-secondary">{statusHunian}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
