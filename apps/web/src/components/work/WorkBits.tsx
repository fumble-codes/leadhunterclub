'use client'

import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { accentColorMap } from '@/lib/colors'
import {
  TASK_PRIORITY_LABELS,
  TASK_STATUS_LABELS,
  WORK_COLORS,
  initials,
  type TaskPriority,
  type TaskStatus,
  type TeamMemberDTO,
  type WorkColor,
} from '@/lib/work'

/** Every class below is a literal so Tailwind's scanner keeps it. */
export const TASK_STATUS_STYLES: Record<TaskStatus, { pill: string; dot: string; bar: string }> = {
  TODO: {
    pill: 'border-white/12 bg-white/[0.04] text-text-secondary',
    dot: 'bg-text-muted',
    bar: 'bg-text-muted',
  },
  IN_PROGRESS: {
    pill: 'border-accent-purple/30 bg-accent-purple/10 text-accent-purple',
    dot: 'bg-accent-purple',
    bar: 'bg-accent-purple',
  },
  REVIEW: {
    pill: 'border-accent-cyan/30 bg-accent-cyan/10 text-accent-cyan',
    dot: 'bg-accent-cyan',
    bar: 'bg-accent-cyan',
  },
  DONE: {
    pill: 'border-accent-mint/30 bg-accent-mint/10 text-accent-mint',
    dot: 'bg-accent-mint',
    bar: 'bg-accent-mint',
  },
}

export const PRIORITY_STYLES: Record<TaskPriority, string> = {
  LOW: 'text-text-muted',
  MEDIUM: 'text-accent-cyan',
  HIGH: 'text-accent-purple',
  URGENT: 'text-accent-pink',
}

export function StatusPill({ status, compact = false }: { status: TaskStatus; compact?: boolean }) {
  const style = TASK_STATUS_STYLES[status]
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${style.pill}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      {compact ? TASK_STATUS_LABELS[status].replace('In ', '') : TASK_STATUS_LABELS[status]}
    </span>
  )
}

export function PriorityPill({ priority }: { priority: TaskPriority }) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-medium ${PRIORITY_STYLES[priority]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full bg-current`} />
      {TASK_PRIORITY_LABELS[priority]}
    </span>
  )
}

export function ProductDot({ color, size = 8 }: { color: WorkColor; size?: number }) {
  const key = (WORK_COLORS as readonly string[]).includes(color) ? color : 'mint'
  return (
    <span
      className="inline-block shrink-0 rounded-full"
      style={{ width: size, height: size, backgroundColor: accentColorMap[key] }}
    />
  )
}

export function AssigneeAvatar({ member, size = 24 }: { member: TeamMemberDTO | null; size?: number }) {
  if (!member) {
    return (
      <span
        className="inline-flex shrink-0 items-center justify-center rounded-full border border-dashed border-white/15 text-text-muted"
        style={{ width: size, height: size, fontSize: Math.round(size * 0.38) }}
        title="Unassigned"
      >
        ?
      </span>
    )
  }
  const keys = WORK_COLORS
  const key = keys[member.id.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) % keys.length]
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full text-[#0a0a0f] font-bold"
      style={{
        width: size,
        height: size,
        fontSize: Math.round(size * 0.38),
        backgroundColor: accentColorMap[key],
      }}
      title={member.name || member.email}
    >
      {initials(member.name || member.email)}
    </span>
  )
}

export function ModalShell({
  title,
  subtitle,
  onClose,
  children,
  width = 'max-w-lg',
}: {
  title: string
  subtitle?: string
  onClose: () => void
  children: ReactNode
  width?: string
}) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-md"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative w-full ${width} max-h-[90dvh] overflow-y-auto rounded-[22px] border border-white/[0.09] bg-surface-container-low shadow-[0_25px_85px_-20px_rgba(0,0,0,0.8)]`}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-white/[0.07] bg-surface-container-low/95 px-6 py-5 backdrop-blur">
          <div>
            <h2 className="font-display text-lg font-semibold text-text-primary">{title}</h2>
            {subtitle && <p className="mt-1 text-xs text-text-muted">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/[0.08] p-1.5 text-text-muted transition-colors hover:border-white/15 hover:text-text-primary"
            aria-label="Close"
          >
            <XMarkIcon className="h-4 w-4" strokeWidth={1.6} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>,
    document.body,
  )
}

export const FIELD_CLASS =
  'w-full rounded-xl border border-white/[0.09] bg-white/[0.03] px-3 py-2.5 text-sm text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-accent-orange/40'

export const LABEL_CLASS = 'mb-1.5 block text-xs font-medium text-text-secondary'
