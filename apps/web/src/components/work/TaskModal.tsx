'use client'

import { useState, type FormEvent } from 'react'
import { FIELD_CLASS, LABEL_CLASS, ModalShell } from '@/components/work/WorkBits'
import {
  TASK_PRIORITIES,
  TASK_PRIORITY_LABELS,
  TASK_STATUSES,
  TASK_STATUS_LABELS,
  type TaskPriority,
  type TaskStatus,
  type TeamMemberDTO,
  type WorkProductDTO,
  type WorkTaskDTO,
} from '@/lib/work'

export interface TaskFormValues {
  title: string
  description: string
  productId: string | null
  status: TaskStatus
  priority: TaskPriority
  assigneeId: string | null
  dueDate: string | null
}

export default function TaskModal({
  task,
  products,
  team,
  defaultStatus = 'TODO',
  defaultProductId = null,
  busy,
  onSave,
  onClose,
}: {
  task: WorkTaskDTO | null
  products: WorkProductDTO[]
  team: TeamMemberDTO[]
  defaultStatus?: TaskStatus
  defaultProductId?: string | null
  busy: boolean
  onSave: (values: TaskFormValues) => Promise<void>
  onClose: () => void
}) {
  const [title, setTitle] = useState(task?.title ?? '')
  const [description, setDescription] = useState(task?.description ?? '')
  const [productId, setProductId] = useState(task?.productId ?? defaultProductId ?? '')
  const [status, setStatus] = useState<TaskStatus>(task?.status ?? defaultStatus)
  const [priority, setPriority] = useState<TaskPriority>(task?.priority ?? 'MEDIUM')
  const [assigneeId, setAssigneeId] = useState(task?.assigneeId ?? '')
  const [dueDate, setDueDate] = useState(task?.dueDate ?? '')

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!title.trim()) return
    await onSave({
      title: title.trim(),
      description,
      productId: productId || null,
      status,
      priority,
      assigneeId: assigneeId || null,
      dueDate: dueDate || null,
    })
  }

  return (
    <ModalShell
      title={task ? 'Edit task' : 'New task'}
      subtitle={task ? 'Update the details or move it to another column.' : 'Add something the team needs to get done.'}
      onClose={onClose}
      width="max-w-xl"
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className={LABEL_CLASS} htmlFor="task-title">
            Title <span className="text-accent-pink">*</span>
          </label>
          <input
            id="task-title"
            autoFocus
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="e.g. Fix lead drawer on mobile"
            maxLength={180}
            className={FIELD_CLASS}
            required
          />
        </div>

        <div>
          <label className={LABEL_CLASS} htmlFor="task-description">
            Notes
          </label>
          <textarea
            id="task-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Context, acceptance criteria, links…"
            rows={3}
            maxLength={2000}
            className={`${FIELD_CLASS} resize-y`}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="task-product">
              Product / workstream
            </label>
            <select
              id="task-product"
              value={productId}
              onChange={(event) => setProductId(event.target.value)}
              className={FIELD_CLASS}
            >
              <option value="">No product</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="task-assignee">
              Assignee
            </label>
            <select
              id="task-assignee"
              value={assigneeId}
              onChange={(event) => setAssigneeId(event.target.value)}
              className={FIELD_CLASS}
            >
              <option value="">Unassigned</option>
              {team.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name || member.email}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className={LABEL_CLASS} htmlFor="task-status">
              Status
            </label>
            <select
              id="task-status"
              value={status}
              onChange={(event) => setStatus(event.target.value as TaskStatus)}
              className={FIELD_CLASS}
            >
              {TASK_STATUSES.map((value) => (
                <option key={value} value={value}>
                  {TASK_STATUS_LABELS[value]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="task-priority">
              Priority
            </label>
            <select
              id="task-priority"
              value={priority}
              onChange={(event) => setPriority(event.target.value as TaskPriority)}
              className={FIELD_CLASS}
            >
              {TASK_PRIORITIES.map((value) => (
                <option key={value} value={value}>
                  {TASK_PRIORITY_LABELS[value]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="task-due">
              Due date
            </label>
            <input
              id="task-due"
              type="date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
              className={FIELD_CLASS}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-white/[0.07] pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/[0.09] px-4 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:border-white/15 hover:text-text-primary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={busy || !title.trim()}
            className="inline-flex items-center gap-2 rounded-xl bg-accent-orange px-4 py-2.5 text-sm font-semibold text-[#0a0a0f] transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? 'Saving…' : task ? 'Save changes' : 'Create task'}
          </button>
        </div>
      </form>
    </ModalShell>
  )
}
