'use client'

import { TrashIcon } from '@heroicons/react/24/outline'
import {
  AssigneeAvatar,
  PriorityPill,
  ProductDot,
  StatusPill,
} from '@/components/work/WorkBits'
import {
  TASK_STATUSES,
  TASK_STATUS_LABELS,
  formatDueDate,
  type TaskStatus,
  type WorkTaskDTO,
} from '@/lib/work'

export default function TaskTable({
  tasks,
  onEdit,
  onDelete,
  onQuickStatus,
}: {
  tasks: WorkTaskDTO[]
  onEdit: (task: WorkTaskDTO) => void
  onDelete: (task: WorkTaskDTO) => void
  onQuickStatus: (task: WorkTaskDTO, status: TaskStatus) => void
}) {
  const sorted = [...tasks].sort((a, b) => {
    const statusDiff = TASK_STATUSES.indexOf(a.status) - TASK_STATUSES.indexOf(b.status)
    return statusDiff !== 0 ? statusDiff : a.position - b.position
  })

  return (
    <div className="overflow-x-auto rounded-2xl border border-white/[0.07] bg-white/[0.015]">
      <table className="w-full min-w-[840px] border-collapse text-left">
        <thead>
          <tr className="border-b border-white/[0.07] text-[10px] font-semibold uppercase tracking-wide text-text-muted">
            <th className="px-4 py-3">Task</th>
            <th className="px-4 py-3">Product</th>
            <th className="px-4 py-3">Assignee</th>
            <th className="px-4 py-3">Priority</th>
            <th className="px-4 py-3">Due</th>
            <th className="px-4 py-3">Status</th>
            <th className="w-12 px-4 py-3"><span className="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((task) => (
            <tr
              key={task.id}
              className="border-b border-white/[0.05] transition-colors last:border-0 hover:bg-white/[0.025]"
            >
              <td className="max-w-[320px] px-4 py-3">
                <button
                  type="button"
                  onClick={() => onEdit(task)}
                  className="block max-w-full truncate text-left text-[13px] font-semibold text-text-primary hover:text-accent-orange"
                >
                  {task.title}
                </button>
                {task.description && (
                  <p className="mt-0.5 truncate text-[11px] text-text-muted">{task.description}</p>
                )}
              </td>
              <td className="px-4 py-3">
                {task.product ? (
                  <span className="inline-flex items-center gap-1.5 text-[12px] text-text-secondary">
                    <ProductDot color={task.product.color} size={7} />
                    {task.product.name}
                  </span>
                ) : (
                  <span className="text-[12px] text-text-muted">—</span>
                )}
              </td>
              <td className="px-4 py-3">
                <span className="inline-flex items-center gap-2 text-[12px] text-text-secondary">
                  <AssigneeAvatar member={task.assignee} size={22} />
                  <span className="max-w-[120px] truncate">
                    {task.assignee ? task.assignee.name || task.assignee.email : 'Unassigned'}
                  </span>
                </span>
              </td>
              <td className="px-4 py-3"><PriorityPill priority={task.priority} /></td>
              <td className="px-4 py-3 text-[12px] text-text-secondary">
                {task.dueDate ? formatDueDate(task.dueDate) : '—'}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <StatusPill status={task.status} />
                  <select
                    value={task.status}
                    onChange={(event) => onQuickStatus(task, event.target.value as TaskStatus)}
                    aria-label={`Change status of ${task.title}`}
                    className="rounded-md border border-white/[0.08] bg-white/[0.04] px-1.5 py-1 text-[10px] text-text-secondary outline-none focus:border-accent-orange/40"
                  >
                    {TASK_STATUSES.map((value) => (
                      <option key={value} value={value}>
                        {TASK_STATUS_LABELS[value]}
                      </option>
                    ))}
                  </select>
                </div>
              </td>
              <td className="px-4 py-3">
                <button
                  type="button"
                  onClick={() => onDelete(task)}
                  className="rounded-lg border border-white/[0.08] p-1.5 text-text-muted transition-colors hover:border-red-500/40 hover:text-red-400"
                  title="Delete task"
                  aria-label={`Delete ${task.title}`}
                >
                  <TrashIcon className="h-3.5 w-3.5" strokeWidth={1.6} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
