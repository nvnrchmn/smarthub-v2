import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '../../lib/utils'
import { Icon, type IconName } from './Icon'

/* ------------------------------------------------------------------ */
/* Primitif bento grid — dashboard dirombak jadi bento (grid heterogen) */
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
  /** tone memberi aksen warna halus pada kartu (psikologi: hirarki visual) */
  tone?: 'default' | 'primary' | 'success' | 'warning' | 'danger'
  /** styling visual isi kartu (padding/gap) */
  innerClassName?: string
}) {
  const tones: Record<string, string> = {
    default: 'bg-surface-card',
    primary: 'bg-primary text-white',
    success: 'bg-emerald-50 border-emerald-200',
    warning: 'bg-amber-50 border-amber-200',
    danger: 'bg-red-50 border-red-200',
  }
  const inner = (
    <div className={cn('flex h-full flex-col rounded-2xl border border-border p-4 shadow-sm transition-shadow duration-200', tones[tone], innerClassName)}>
      {children}
    </div>
  )
  if (to)
    return (
      <Tag className={cn('h-full min-w-0', className)}>
        <Link to={to} className="block h-full rounded-2xl focus-visible:outline-none">
          {inner}
        </Link>
      </Tag>
    )
  return <Tag className={cn('h-full min-w-0', className)}>{inner}</Tag>
}

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
  tone?: 'default' | 'primary' | 'success' | 'warning' | 'danger'
  className?: string
  to?: string
}) {
  const chip: Record<string, string> = {
    default: 'bg-primary-50 text-primary',
    primary: 'bg-white/20 text-white',
    success: 'bg-emerald-100 text-emerald-700',
    warning: 'bg-amber-100 text-amber-700',
    danger: 'bg-red-100 text-red-700',
  }
  const subTxt: Record<string, string> = {
    default: 'text-text-secondary',
    primary: 'text-white/75',
    success: 'text-emerald-700',
    warning: 'text-amber-700',
    danger: 'text-red-700',
  }
  return (
    <BentoCard innerClassName="gap-2 p-4" className={className} tone={tone} to={to}>
      <div className="flex items-center justify-between gap-2">
        <p className={cn('text-xs font-medium', tone === 'primary' ? 'text-white/80' : 'text-text-secondary')}>{label}</p>
        <span className={cn('grid h-8 w-8 shrink-0 place-items-center rounded-xl', chip[tone])}>
          <Icon name={icon} size={16} />
        </span>
      </div>
      <p className={cn('truncate text-2xl font-extrabold leading-tight tracking-tight', tone === 'primary' ? 'text-white' : 'text-text-primary')}>{value}</p>
      {sub && <p className={cn('text-xs', subTxt[tone])}>{sub}</p>}
    </BentoCard>
  )
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
  const chip: Record<string, string> = {
    primary: 'bg-primary text-white',
    success: 'bg-emerald-500 text-white',
    warning: 'bg-amber-500 text-white',
    danger: 'bg-red-500 text-white',
    neutral: 'bg-primary-50 text-primary',
  }
  return (
    <Link to={to} className="group flex h-full items-center gap-3 rounded-2xl border border-border bg-surface-card p-4 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 active:translate-y-0">
      <span className={cn('grid h-11 w-11 shrink-0 place-items-center rounded-xl shadow-sm', chip[accent])}>
        <Icon name={icon} size={20} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-text-primary">{title}</span>
        <span className="block truncate text-xs text-text-secondary">{desc}</span>
      </span>
      <Icon name="chevron" size={16} className="shrink-0 text-text-disabled transition-transform group-hover:translate-x-0.5" />
    </Link>
  )
}

export function SectionHead({ title, desc, to, toLabel = 'Lihat semua' }: { title: string; desc?: string; to?: string; toLabel?: string }) {
  return (
    <div className="mb-2 flex items-end justify-between gap-2">
      <div className="min-w-0">
        <h2 className="text-sm font-bold text-text-primary">{title}</h2>
        {desc && <p className="truncate text-xs text-text-secondary">{desc}</p>}
      </div>
      {to && (
        <Link to={to} className="flex shrink-0 items-center gap-0.5 rounded-lg px-1.5 py-1 text-xs font-medium text-primary hover:bg-primary-50">
          {toLabel}
          <Icon name="chevron" size={14} />
        </Link>
      )}
    </div>
  )
}

export function Progress({ value, tone = 'primary', className }: { value: number; tone?: 'primary' | 'success' | 'warning' | 'danger'; className?: string }) {
  const bar: Record<string, string> = {
    primary: 'bg-primary',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-red-500',
  }
  const pct = Math.max(0, Math.min(100, value))
  return (
    <div className={cn('h-2 w-full overflow-hidden rounded-full bg-primary-100', className)} role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
      <div className={cn('h-full rounded-full transition-[width] duration-700 ease-out', bar[tone])} style={{ width: `${pct}%` }} />
    </div>
  )
}

export function Avatar({ name, className }: { name: string; className?: string }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('')
  return (
    <span className={cn('grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary-50 text-sm font-bold text-primary', className)} aria-hidden="true">
      {initials || '?'}
    </span>
  )
}

/* ------------------------------------------------------------------ */
/* Status umpan-balik (heuristik 1, 6, 9 Nielsen)                      */
/* ------------------------------------------------------------------ */

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-xl bg-text-disabled/15', className)} />
}

export function EmptyState({ icon = 'file', title, desc, action }: { icon?: IconName; title: string; desc?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-surface-card px-6 py-10 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary-50 text-primary">
        <Icon name={icon} size={22} />
      </span>
      <p className="text-sm font-semibold text-text-primary">{title}</p>
      {desc && <p className="max-w-xs text-xs text-text-secondary">{desc}</p>}
      {action}
    </div>
  )
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-6 py-8 text-center" role="alert">
      <span className="grid h-11 w-11 place-items-center rounded-2xl bg-red-100 text-red-600">
        <Icon name="alert" size={20} />
      </span>
      <p className="text-sm font-semibold text-red-800">Gagal memuat data</p>
      <p className="max-w-xs text-xs text-red-600">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-1 inline-flex min-h-[40px] items-center gap-1.5 rounded-xl bg-red-600 px-4 text-xs font-semibold text-white hover:bg-red-700"
        >
          <Icon name="refresh" size={14} /> Coba lagi
        </button>
      )}
    </div>
  )
}
