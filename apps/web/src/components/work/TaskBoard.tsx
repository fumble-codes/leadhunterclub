'use client'

import { useState, type DragEvent } from 'react'
import { PlusIcon } from '@heroicons/react/24/outline'
import {
  AssigneeAvatar,
  PriorityPill,
  ProductDot,
  StatusPill,
  TASK_STATUS_STYLES,
} from '@/components/work/WorkBits'
import {
  TASK_STATUSES,
  TASK_STATUS_LABELS,
  computeMove,
  formatDueDate,
  type ReorderChange,
  type TaskStatus,
  type WorkTaskDTO,
} from '@/lib/work'

export { computeMove }
export type { ReorderChange } from '@/lib/work'

export default function TaskBoard({
  tasks,
  onEdit,
  onCreate,
  onReorder,
  onQuickStatus,
}: {
  tasks: WorkTaskDTO[]
  onEdit: (task: WorkTaskDTO) => void
  onCreate: (status: TaskStatus) => void
  onReorder: (changes: ReorderChange[]) => void
  onQuickStatus: (task: WorkTaskDTO, status: TaskStatus) => void
}) {
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dropTarget, setDropTarget] = useState<{ status: TaskStatus; beforeId: string | null } | null>(null)

  const clearDrag = () => {
    setDraggingId(null)
    setDropTarget(null)
  }

  const handleDrop = (event: DragEvent, status: TaskStatus) => {
    event.preventDefault()
    const id = event.dataTransfer.getData('text/plain') || draggingId
    const beforeId = dropTarget?.status === status ? dropTarget.beforeId : null
    if (id) {
      const { changes } = computeMove(tasks, id, status, beforeId)
      if (changes.length) onReorder(changes)
    }
    clearDrag()
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
      {TASK_STATUSES.map((status) => {
        const columnTasks = tasks
          .filter((task) => task.status === status)
          .sort((a, b) => a.position - b.position)
        const meta = TASK_STATUS_STYLES[status]
        return (
          <section
            key={status}
            onDragOver={(event) => {
              if (!draggingId) return
              event.preventDefault()
              event.dataTransfer.dropEffect = 'move'
              setDropTarget((current) =>
                current?.status === status && current.beforeId === null
                  ? current
                  : { status, beforeId: null },
              )
            }}
            onDrop={(event) => handleDrop(event, status)}
            className={`flex min-h-[260px] flex-col rounded-2xl border bg-white/[0.015] p-3 transition-colors ${
              dropTarget?.status === status && !dropTarget.beforeId
                ? 'border-accent-orange/40 bg-accent-orange/[0.04]'
                : 'border-white/[0.07]'
            }`}
          >
            <header className="mb-3 flex items-center gap-2 px-1">
              <span className={`h-2 w-2 shrink-0 rounded-full ${meta.dot}`} />
              <h2 className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
                {TASK_STATUS_LABELS[status]}
              </h2>
              <span className="rounded-md bg-white/[0.06] px-1.5 py-0.5 text-[10px] font-medium text-text-muted">
                {columnTasks.length}
              </span>
              <button
                type="button"
                onClick={() => onCreate(status)}
                className="ml-auto rounded-lg border border-white/[0.08] p-1.5 text-text-muted transition-colors hover:border-white/15 hover:text-text-primary"
                title={`Add task to ${TASK_STATUS_LABELS[status]}`}
                aria-label={`Add task to ${TASK_STATUS_LABELS[status]}`}
              >
                <PlusIcon className="h-3.5 w-3.5" strokeWidth={1.6} />
              </button>
            </header>

            <div className="flex-1 space-y-2">
              {columnTasks.map((task) => {
                const isDragging = draggingId === task.id
                const isDropBefore = dropTarget?.status === status && dropTarget.beforeId === task.id
                return (
                  <div key={task.id}>
                    {isDropBefore && <div className="mb-2 h-0.5 rounded-full bg-accent-orange" />}
                    <article
                      draggable
                      onDragStart={(event) => {
                        event.dataTransfer.setData('text/plain', task.id)
                        event.dataTransfer.effectAllowed = 'move'
                        setDraggingId(task.id)
                      }}
                      onDragEnd={clearDrag}
                      onDragOver={(event) => {
                        if (!draggingId || draggingId === task.id) return
                        event.preventDefault()
                        event.stopPropagation()
                        event.dataTransfer.dropEffect = 'move'
                        setDropTarget((current) =>
                          current?.status === status && current.beforeId === task.id
                            ? current
                            : { status, beforeId: task.id },
                        )
                      }}
                      onClick={() => onEdit(task)}
                      className={`cursor-grab rounded-xl border border-white/[0.08] bg-white/[0.025] p-3 transition-all hover:border-white/15 hover:bg-white/[0.04] active:cursor-grabbing ${
                        isDragging ? 'opacity-35' : ''
                      }`}
                    >
                      <p className="line-clamp-2 text-[13px] font-semibold leading-snug text-text-primary">
                        {task.title}
                      </p>
                      {task.description && (
                        <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-text-muted">
                          {task.description}
                        </p>
                      )}

                      <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                        <PriorityPill priority={task.priority} />
                        {task.product && (
                          <span className="inline-flex min-w-0 items-center gap-1.5 text-[11px] text-text-muted">
                            <ProductDot color={task.product.color} size={6} />
                            <span className="truncate">{task.product.name}</span>
                          </span>
                        )}
                        {task.dueDate && (
                          <span className="text-[11px] text-text-muted">{formatDueDate(task.dueDate)}</span>
                        )}
                      </div>

                      <div className="mt-3 flex items-center gap-2 border-t border-white/[0.06] pt-2.5">
                        <AssigneeAvatar member={task.assignee} size={22} />
                        <span className="min-w-0 flex-1 truncate text-[11px] text-text-secondary">
                          {task.assignee ? task.assignee.name || task.assignee.email : 'Unassigned'}
                        </span>
                        <select
                          value={task.status}
                          onClick={(event) => event.stopPropagation()}
                          onChange={(event) => onQuickStatus(task, event.target.value as TaskStatus)}
                          aria-label={`Move ${task.title} to another column`}
                          className="rounded-md border border-white/[0.08] bg-white/[0.04] px-1.5 py-1 text-[10px] text-text-secondary outline-none focus:border-accent-orange/40"
                        >
                          {TASK_STATUSES.map((value) => (
                            <option key={value} value={value}>
                              {TASK_STATUS_LABELS[value]}
                            </option>
                          ))}
                        </select>
                      </div>
                    </article>
                  </div>
                )
              })}

              {columnTasks.length === 0 && (
                <button
                  type="button"
                  onClick={() => onCreate(status)}
                  className="flex w-full flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-white/[0.08] px-3 py-8 text-center transition-colors hover:border-white/15"
                >
                  <StatusPill status={status} compact />
                  <span className="text-[11px] text-text-muted">Drop a task here or add one</span>
                </button>
              )}
            </div>
          </section>
        )
      })}
    </div>
  )
}
