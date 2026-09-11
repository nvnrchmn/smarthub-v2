import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '../../lib/utils'
import { Icon, type IconName } from './Icon'

/* ------------------------------------------------------------------ */
/* Primitif bento grid — Smarthub SaaS                                 */
/* Estetika: kartu seperti Stripe/Linear — permukaan lembut, border    */
/* 1px presisi, shadow tipis berlapis, aksen warna token-aware.        */
/* Semua tone memakai color-mix() agar tetap terbaca di mode terang    */
/* maupun gelap (tanpa pastel keras). API setiap komponen TIDAK        */
/* berubah — aman bagi halaman Admin / RT / Warga.                     */
/* ------------------------------------------------------------------ */

type Tone = 'default' | 'primary' | 'success' | 'warning' | 'danger'

/** Kumpulan util string (di luar komponen agar konsisten) */
const FOCUS_RING =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45 focus-visible:ring-offset-2 focus-visible:ring-offset-surface'
const CARD_SHADOW = 'shadow-[0_1px_2px_0_rgb(0_0_0/0.04),0_2px_8px_-2px_rgb(0_0_0/0.03)]'
const CARD_HOVER = 'hover:-translate-y-0.5 hover:shadow-[0_2px_4px_rgb(0_0_0/0.05),0_14px_28px_-10px_rgb(0_0_0/0.18)]'
const CARD_MOTION = 'transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]'

/** Latar kartu per tone — gradien lembut untuk primary, tint adaptif untuk status */
const toneCard: Record<Tone, string> = {
  default:
    'bg-surface-card border-border',
  primary:
    'border-transparent text-white ' +
    'bg-[linear-gradient(135deg,color-mix(in_srgb,var(--color-primary)_88%,white),color-mix(in_srgb,var(--color-primary)_70%,black))] ' +
    'shadow-[inset_0_1px_0_rgb(255_255_255/0.18),0_8px_20px_-10px_color-mix(in_srgb,var(--color-primary)_60%,transparent)]',
  success:
    'border-[color-mix(in_srgb,var(--color-status-paid)_32%,var(--sh-border))] ' +
    'bg-[color-mix(in_srgb,var(--color-status-paid)_7%,var(--sh-card))]',
  warning:
    'border-[color-mix(in_srgb,var(--color-status-pending)_35%,var(--sh-border))] ' +
    'bg-[color-mix(in_srgb,var(--color-status-pending)_8%,var(--sh-card))]',
  danger:
    'border-[color-mix(in_srgb,var(--color-status-overdue)_32%,var(--sh-border))] ' +
    'bg-[color-mix(in_srgb,var(--color-status-overdue)_7%,var(--sh-card))]',
}

/** Chip ikon KPI — tint translusen yang menyesuaikan tema */
const toneChip: Record<Tone, string> = {
  default:
    'bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] text-primary ' +
    'ring-1 ring-inset ring-[color-mix(in_srgb,var(--color-primary)_18%,transparent)]',
  primary:
    'bg-white/15 text-white ring-1 ring-inset ring-white/20 backdrop-blur-sm',
  success:
    'bg-[color-mix(in_srgb,var(--color-status-paid)_14%,transparent)] text-status-paid ' +
    'ring-1 ring-inset ring-[color-mix(in_srgb,var(--color-status-paid)_26%,transparent)]',
  warning:
    'bg-[color-mix(in_srgb,var(--color-status-pending)_16%,transparent)] text-status-pending ' +
    'ring-1 ring-inset ring-[color-mix(in_srgb,var(--color-status-pending)_30%,transparent)]',
  danger:
    'bg-[color-mix(in_srgb,var(--color-status-overdue)_14%,transparent)] text-status-overdue ' +
    'ring-1 ring-inset ring-[color-mix(in_srgb,var(--color-status-overdue)_26%,transparent)]',
}

/** Teks sekunder bernuansa — dicampur abu-abu agar kontras cukup di kedua mode */
const toneSub: Record<Tone, string> = {
  default: 'text-text-secondary',
  primary: 'text-white/75',
  success: 'text-[color-mix(in_srgb,var(--color-status-paid)_62%,var(--sh-text-2))]',
  warning: 'text-[color-mix(in_srgb,var(--color-status-pending)_58%,var(--sh-text-2))]',
  danger: 'text-[color-mix(in_srgb,var(--color-status-overdue)_60%,var(--sh-text-2))]',
}

/* ------------------------------------------------------------------ */
/* BentoCard — wadah utama grid bento                                  */
/* ------------------------------------------------------------------ */

export function BentoCard({
  className,
  children,
  as: Tag = 'div',
  to,
  tone = 'default',
  innerClassName,
}: {
  /** untuk penempatan grid (mis. col-span-2) — elemen luar kartu */
  className?: string
  children: ReactNode
  as?: 'div' | 'section' | 'li'
  to?: string
  /** tone memberi aksen warna pada kartu (hirarki visual) */
  tone?: Tone
  /** styling visual isi kartu (padding/gap) */
  innerClassName?: string
}) {
  const inner = (
    <div
      className={cn(
        'flex h-full flex-col overflow-hidden rounded-2xl border p-4',
        CARD_SHADOW,
        toneCard[tone],
        to && cn(CARD_MOTION, CARD_HOVER, 'active:translate-y-0 active:scale-[0.995]'),
        innerClassName
      )}
    >
      {children}
    </div>
  )
  if (to)
    return (
      <Tag className={cn('group h-full min-w-0', className)}>
        <Link
          to={to}
          className={cn('block h-full rounded-2xl', FOCUS_RING)}
        >
          {inner}
        </Link>
      </Tag>
    )
  return <Tag className={cn('h-full min-w-0', className)}>{inner}</Tag>
}

/* ------------------------------------------------------------------ */
/* KPI — angka penting dengan chip ikon, label & keterangan            */
/* ------------------------------------------------------------------ */

export function KPI({
  icon,
  label,
  value,
  sub,
  tone = 'default',
  className,
  to,
}: {
  icon: IconName
  label: string
  value: ReactNode
  sub?: string
  tone?: Tone
  className?: string
  to?: string
}) {
  return (
    <BentoCard innerClassName="gap-3 p-4" className={className} tone={tone} to={to}>
      <div className="flex items-center justify-between gap-2">
        <p
          className={cn(
            'truncate text-xs font-semibold tracking-[0.01em]',
            tone === 'primary' ? 'text-white/80' : 'text-text-secondary'
          )}
        >
          {label}
        </p>
        <span
          className={cn(
            'grid h-8 w-8 shrink-0 place-items-center rounded-[10px] shadow-[0_1px_2px_rgb(0_0_0/0.05)]',
            toneChip[tone]
          )}
        >
          <Icon name={icon} size={16} />
        </span>
      </div>
      <p
        className={cn(
          'truncate text-2xl font-extrabold leading-tight tracking-[-0.02em] tabular-nums',
          tone === 'primary' ? 'text-white' : 'text-text-primary'
        )}
      >
        {value}
      </p>
      {sub && (
        <p className={cn('mt-auto text-xs font-medium leading-snug tabular-nums', toneSub[tone])}>
          {sub}
        </p>
      )}
    </BentoCard>
  )
}

/* ------------------------------------------------------------------ */
/* ActionTile — pintu aksi navigasi cepat                              */
/* ------------------------------------------------------------------ */

const ACCENT_GLOSS =
  'shadow-[inset_0_1px_0_rgb(255_255_255/0.22),0_1px_2px_rgb(0_0_0/0.08)]'

const accentChip: Record<string, string> = {
  primary: `bg-gradient-to-br from-primary to-[color-mix(in_srgb,var(--color-primary)_58%,black)] text-white ${ACCENT_GLOSS}`,
  success: `bg-gradient-to-br from-emerald-500 to-emerald-700 text-white ${ACCENT_GLOSS}`,
  warning: `bg-gradient-to-br from-amber-500 to-amber-700 text-white ${ACCENT_GLOSS}`,
  danger: `bg-gradient-to-br from-red-500 to-red-700 text-white ${ACCENT_GLOSS}`,
  neutral:
    'bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] text-primary ' +
    'ring-1 ring-inset ring-[color-mix(in_srgb,var(--color-primary)_18%,transparent)]',
}

export function ActionTile({
  to,
  icon,
  title,
  desc,
  accent = 'primary',
}: {
  to: string
  icon: IconName
  title: string
  desc: string
  accent?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral'
}) {
  return (
    <Link
      to={to}
      className={cn(
        'group flex h-full items-center gap-3 rounded-2xl border border-border bg-surface-card p-3.5',
        CARD_SHADOW,
        CARD_MOTION,
        'hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--color-primary)_28%,var(--sh-border))]',
        'hover:shadow-[0_2px_4px_rgb(0_0_0/0.04),0_12px_24px_-10px_rgb(0_0_0/0.14)]',
        'active:translate-y-0 active:scale-[0.99]',
        FOCUS_RING
      )}
    >
      <span
        className={cn(
          'grid h-11 w-11 shrink-0 place-items-center rounded-[12px] transition-transform duration-200 ease-out group-hover:scale-105 group-active:scale-95',
          accentChip[accent]
        )}
      >
        <Icon name={icon} size={20} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-bold tracking-[-0.01em] text-text-primary">
          {title}
        </span>
        <span className="mt-0.5 block truncate text-xs text-text-secondary">{desc}</span>
      </span>
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-border text-text-disabled transition-colors duration-200 group-hover:border-primary/25 group-hover:text-primary">
        <Icon
          name="chevron"
          size={14}
          className="transition-transform duration-200 group-hover:translate-x-0.5"
        />
      </span>
    </Link>
  )
}

/* ------------------------------------------------------------------ */
/* SectionHead — judul seksi + aksi opsional                           */
/* ------------------------------------------------------------------ */

export function SectionHead({ title, desc, to, toLabel = 'Lihat semua' }: { title: string; desc?: string; to?: string; toLabel?: string }) {
  return (
    <div className="mb-2 flex items-end justify-between gap-3">
      <div className="min-w-0">
        <h2 className="text-sm font-bold tracking-[-0.01em] text-text-primary">{title}</h2>
        {desc && <p className="mt-0.5 truncate text-xs leading-relaxed text-text-secondary">{desc}</p>}
      </div>
      {to && (
        <Link
          to={to}
          className={cn(
            'group flex shrink-0 items-center gap-1 rounded-lg py-1 pl-2 pr-1 text-xs font-semibold text-primary',
            'transition-colors duration-150 hover:bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]',
            FOCUS_RING
          )}
        >
          {toLabel}
          <Icon
            name="chevron"
            size={14}
            className="transition-transform duration-200 group-hover:translate-x-0.5"
          />
        </Link>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Progress — batang persentase tipis dengan rel aksen tone            */
/* ------------------------------------------------------------------ */

const toneTrack: Record<string, string> = {
  primary: 'bg-[color-mix(in_srgb,var(--color-primary)_16%,transparent)]',
  success: 'bg-[color-mix(in_srgb,var(--color-status-paid)_18%,transparent)]',
  warning: 'bg-[color-mix(in_srgb,var(--color-status-pending)_20%,transparent)]',
  danger: 'bg-[color-mix(in_srgb,var(--color-status-overdue)_18%,transparent)]',
}

const toneFill: Record<string, string> = {
  primary:
    'bg-gradient-to-r from-primary to-[color-mix(in_srgb,var(--color-primary)_72%,white)]',
  success: 'bg-gradient-to-r from-emerald-600 to-emerald-400',
  warning: 'bg-gradient-to-r from-amber-600 to-amber-400',
  danger: 'bg-gradient-to-r from-red-600 to-red-400',
}

export function Progress({ value, tone = 'primary', className }: { value: number; tone?: 'primary' | 'success' | 'warning' | 'danger'; className?: string }) {
  const pct = Math.max(0, Math.min(100, value))
  return (
    <div
      className={cn('h-1.5 w-full overflow-hidden rounded-full', toneTrack[tone], className)}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={cn(
          'h-full rounded-full shadow-[inset_0_1px_0_rgb(255_255_255/0.25)]',
          'transition-[width] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]',
          toneFill[tone]
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Avatar — inisial dengan gradien warna ditentukan hash nama          */
/* ------------------------------------------------------------------ */

const avatarTones = [
  'bg-gradient-to-br from-emerald-500 to-emerald-700',
  'bg-gradient-to-br from-teal-500 to-teal-700',
  'bg-gradient-to-br from-sky-500 to-sky-700',
  'bg-gradient-to-br from-indigo-500 to-indigo-700',
  'bg-gradient-to-br from-violet-500 to-violet-700',
  'bg-gradient-to-br from-amber-500 to-amber-700',
  'bg-gradient-to-br from-rose-500 to-rose-700',
  'bg-gradient-to-br from-cyan-500 to-cyan-700',
]

export function Avatar({ name, className }: { name: string | null | undefined; className?: string }) {
  const clean = (name || '').trim()
  let hash = 0
  for (let i = 0; i < clean.length; i++) hash = (hash * 31 + clean.charCodeAt(i)) >>> 0
  const tone = avatarTones[hash % avatarTones.length]
  const initials = clean
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('')
  return (
    <span
      className={cn(
        'grid h-10 w-10 shrink-0 select-none place-items-center rounded-full text-[13px] font-bold text-white',
        'shadow-[inset_0_1px_0_rgb(255_255_255/0.25),0_1px_2px_rgb(0_0_0/0.12)]',
        tone,
        className
      )}
      aria-hidden="true"
    >
      {initials || '?'}
    </span>
  )
}

/* ------------------------------------------------------------------ */
/* Status umpan-balik (heuristik 1, 6, 9 Nielsen)                      */
/* ------------------------------------------------------------------ */

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('h-4 w-full rounded-xl bg-shimmer', className)} aria-hidden="true" />
}

export function EmptyState({ icon = 'file', title, desc, action }: { icon?: IconName; title: string; desc?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2.5 rounded-2xl border border-dashed border-[color-mix(in_srgb,var(--sh-text-3)_45%,var(--sh-border))] bg-surface-card px-6 py-12 text-center">
      <span
        className={cn(
          'grid h-14 w-14 place-items-center rounded-2xl',
          'bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)] text-primary',
          'ring-1 ring-inset ring-[color-mix(in_srgb,var(--color-primary)_16%,transparent)]'
        )}
      >
        <Icon name={icon} size={24} />
      </span>
      <p className="mt-1 text-[15px] font-bold tracking-[-0.01em] text-text-primary">{title}</p>
      {desc && (
        <p className="max-w-sm text-[13px] leading-relaxed text-text-secondary">{desc}</p>
      )}
      {action && <div className="mt-1">{action}</div>}
    </div>
  )
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-2.5 rounded-2xl border px-6 py-10 text-center',
        'border-[color-mix(in_srgb,var(--color-status-overdue)_34%,var(--sh-border))]',
        'bg-[color-mix(in_srgb,var(--color-status-overdue)_6%,var(--sh-card))]',
        CARD_SHADOW
      )}
      role="alert"
    >
      <span
        className={cn(
          'grid h-12 w-12 place-items-center rounded-2xl',
          'bg-[color-mix(in_srgb,var(--color-status-overdue)_13%,transparent)] text-status-overdue',
          'ring-1 ring-inset ring-[color-mix(in_srgb,var(--color-status-overdue)_24%,transparent)]'
        )}
      >
        <Icon name="alert" size={22} />
      </span>
      <p className="mt-1 text-[15px] font-bold tracking-[-0.01em] text-text-primary">
        Gagal memuat data
      </p>
      <p className="max-w-sm text-[13px] leading-relaxed text-text-secondary">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className={cn(
            'mt-2 inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-danger px-4 text-[13px] font-semibold text-white',
            'shadow-[inset_0_1px_0_rgb(255_255_255/0.2),0_1px_2px_rgb(0_0_0/0.12)]',
            'hover:bg-[color-mix(in_srgb,var(--color-danger)_85%,black)]',
            FOCUS_RING
          )}
        >
          <Icon name="refresh" size={15} /> Coba lagi
        </button>
      )}
    </div>
  )
}
