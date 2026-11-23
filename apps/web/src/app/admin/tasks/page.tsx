'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ClipboardDocumentListIcon,
  CubeIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  Squares2X2Icon,
  TableCellsIcon,
} from '@heroicons/react/24/outline'
import { useToast } from '@/components/ui/Toast'
import { CustomLoader } from '@/components/ui/CustomLoader'
import { getFirebaseToken } from '@/lib/firebase'
import TaskBoard, { computeMove, type ReorderChange } from '@/components/work/TaskBoard'
import TaskTable from '@/components/work/TaskTable'
import TaskModal, { type TaskFormValues } from '@/components/work/TaskModal'
import { TASK_STATUSES, TASK_STATUS_LABELS, type TaskStatus, type TeamMemberDTO, type WorkProductDTO, type WorkTaskDTO } from '@/lib/work'

type View = 'board' | 'table'
type ModalState =
  | { mode: 'create'; status: TaskStatus }
  | { mode: 'edit'; task: WorkTaskDTO }
  | null

async function authHeaders(): Promise<Record<string, string>> {
  const token = await getFirebaseToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

function apiError(json: { message?: string } | null, fallback: string) {
  return json?.message || fallback
}

export default function AdminTasksPage() {
  const { addToast } = useToast()
  const [tasks, setTasks] = useState<WorkTaskDTO[]>([])
  const [products, setProducts] = useState<WorkProductDTO[]>([])
  const [team, setTeam] = useState<TeamMemberDTO[]>([])
  const [byStatus, setByStatus] = useState<Record<TaskStatus, number>>({
    TODO: 0,
    IN_PROGRESS: 0,
    REVIEW: 0,
    DONE: 0,
  })
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<View>('board')
  const [query, setQuery] = useState('')
  const [productId, setProductId] = useState('')
  const [assigneeId, setAssigneeId] = useState('')
  const [modal, setModal] = useState<ModalState>(null)
  const [saving, setSaving] = useState(false)

  // Deep link from the products page: /admin/tasks?product=<id>
  useEffect(() => {
    const value = new URLSearchParams(window.location.search).get('product')
    if (value) setProductId(value)
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const headers = await authHeaders()
      const params = new URLSearchParams()
      if (query.trim()) params.set('q', query.trim())
      if (productId) params.set('productId', productId)
      if (assigneeId) params.set('assigneeId', assigneeId)
      const [tasksRes, productsRes, teamRes] = await Promise.all([
        fetch(`/api/admin/tasks?${params.toString()}`, { headers }),
        fetch('/api/admin/products', { headers }),
        fetch('/api/admin/team', { headers }),
      ])
      if (!tasksRes.ok) throw new Error('Failed to load tasks')
      const tasksJson = (await tasksRes.json()) as {
        data: WorkTaskDTO[]
        byStatus: Record<TaskStatus, number>
      }
      setTasks(tasksJson.data ?? [])
      setByStatus(tasksJson.byStatus ?? { TODO: 0, IN_PROGRESS: 0, REVIEW: 0, DONE: 0 })
      if (productsRes.ok) {
        const json = (await productsRes.json()) as { data: WorkProductDTO[] }
        setProducts(json.data ?? [])
      }
      if (teamRes.ok) {
        const json = (await teamRes.json()) as { data: TeamMemberDTO[] }
        setTeam(json.data ?? [])
      }
    } catch (error) {
      addToast({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to load tasks',
      })
    } finally {
      setLoading(false)
    }
  }, [query, productId, assigneeId, addToast])

  useEffect(() => {
    const timer = setTimeout(load, query ? 300 : 0)
    return () => clearTimeout(timer)
  }, [load, query])

  const handleSave = async (values: TaskFormValues) => {
    setSaving(true)
    try {
      const headers = { 'Content-Type': 'application/json', ...(await authHeaders()) }
      const isEdit = modal?.mode === 'edit'
      const url = isEdit ? `/api/admin/tasks/${modal.task.id}` : '/api/admin/tasks'
      const res = await fetch(url, {
        method: isEdit ? 'PATCH' : 'POST',
        headers,
        body: JSON.stringify(values),
      })
      const json = await res.json().catch(() => null)
      if (!res.ok) throw new Error(apiError(json, 'Failed to save task'))
      addToast({ type: 'success', message: isEdit ? 'Task updated' : 'Task created' })
      setModal(null)
      await load()
    } catch (error) {
      addToast({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to save task',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (task: WorkTaskDTO) => {
    if (!window.confirm(`Delete "${task.title}"? This cannot be undone.`)) return
    try {
      const res = await fetch(`/api/admin/tasks/${task.id}`, {
        method: 'DELETE',
        headers: await authHeaders(),
      })
      if (!res.ok) {
        const json = await res.json().catch(() => null)
        throw new Error(apiError(json, 'Failed to delete task'))
      }
      addToast({ type: 'success', message: 'Task deleted' })
      await load()
    } catch (error) {
      addToast({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to delete task',
      })
    }
  }

  const handleReorder = async (changes: ReorderChange[]) => {
    const changeMap = new Map(changes.map((change) => [change.id, change]))
    const nextTasks = tasks.map((task) => {
      const change = changeMap.get(task.id)
      return change ? { ...task, status: change.status, position: change.position } : task
    })
    setTasks(nextTasks)
    const counts: Record<TaskStatus, number> = { TODO: 0, IN_PROGRESS: 0, REVIEW: 0, DONE: 0 }
    nextTasks.forEach((task) => {
      counts[task.status] += 1
    })
    setByStatus(counts)
    try {
      const res = await fetch('/api/admin/tasks/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(await authHeaders()) },
        body: JSON.stringify({ tasks: changes }),
      })
      if (!res.ok) {
        const json = await res.json().catch(() => null)
        throw new Error(apiError(json, 'Failed to move task'))
      }
    } catch (error) {
      addToast({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to move task',
      })
      await load()
    }
  }

  const handleQuickStatus = async (task: WorkTaskDTO, status: TaskStatus) => {
    if (status === task.status) return
    const before = tasks
    setTasks((current) =>
      current.map((item) => (item.id === task.id ? { ...item, status } : item)),
    )
    try {
      const res = await fetch(`/api/admin/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...(await authHeaders()) },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) {
        const json = await res.json().catch(() => null)
        throw new Error(apiError(json, 'Failed to move task'))
      }
      await load()
    } catch (error) {
      setTasks(before)
      addToast({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to move task',
      })
    }
  }

  const hasFilters = Boolean(query.trim() || productId || assigneeId)
  const clearFilters = () => {
    setQuery('')
    setProductId('')
    setAssigneeId('')
  }

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 pb-24 pt-6 md:px-8">
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-text-primary">
            Tasks
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            What the team is working on, what&apos;s next, and what&apos;s done.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-2 self-start rounded-xl border border-white/[0.09] px-3.5 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:border-white/15 hover:text-text-primary"
          >
            <CubeIcon className="h-4 w-4" strokeWidth={1.6} />
            Products
          </Link>
          <button
            type="button"
            onClick={() => setModal({ mode: 'create', status: 'TODO' })}
            className="inline-flex items-center gap-2 self-start rounded-xl bg-accent-orange px-4 py-2.5 text-sm font-semibold text-[#0a0a0f] transition-transform hover:scale-[1.02]"
          >
            <PlusIcon className="h-4 w-4" strokeWidth={1.6} />
            New task
          </button>
        </div>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {TASK_STATUSES.map((status) => (
          <div
            key={status}
            className="rounded-2xl border border-white/[0.07] bg-white/[0.02] px-4 py-3.5"
          >
            <p className="text-[11px] font-medium uppercase tracking-wide text-text-muted">
              {TASK_STATUS_LABELS[status]}
            </p>
            <p className="mt-1 font-display text-2xl font-semibold text-text-primary">
              {byStatus[status] ?? 0}
            </p>
          </div>
        ))}
      </div>

      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-64">
            <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" strokeWidth={1.6} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search tasks"
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] py-2 pl-9 pr-3 text-sm text-text-primary outline-none placeholder:text-text-muted focus:border-accent-orange/40"
            />
          </div>
          <select
            value={productId}
            onChange={(event) => setProductId(event.target.value)}
            aria-label="Filter by product"
            className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-text-secondary outline-none focus:border-accent-orange/40"
          >
            <option value="">All products</option>
            <option value="none">No product</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>{product.name}</option>
            ))}
          </select>
          <select
            value={assigneeId}
            onChange={(event) => setAssigneeId(event.target.value)}
            aria-label="Filter by assignee"
            className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-text-secondary outline-none focus:border-accent-orange/40"
          >
            <option value="">Everyone</option>
            <option value="none">Unassigned</option>
            {team.map((member) => (
              <option key={member.id} value={member.id}>{member.name || member.email}</option>
            ))}
          </select>
          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="self-start rounded-xl px-2 py-2 text-xs font-medium text-text-muted transition-colors hover:text-text-primary"
            >
              Clear filters
            </button>
          )}
        </div>

        <div className="flex w-fit items-center gap-1 rounded-xl border border-white/[0.07] bg-white/[0.02] p-1">
          <button
            type="button"
            onClick={() => setView('board')}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              view === 'board' ? 'bg-accent-orange/15 text-accent-orange' : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            <Squares2X2Icon className="h-3.5 w-3.5" strokeWidth={1.6} />
            Board
          </button>
          <button
            type="button"
            onClick={() => setView('table')}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              view === 'table' ? 'bg-accent-orange/15 text-accent-orange' : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            <TableCellsIcon className="h-3.5 w-3.5" strokeWidth={1.6} />
            Table
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <CustomLoader />
        </div>
      ) : tasks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.015] px-6 py-16 text-center">
          <ClipboardDocumentListIcon className="mx-auto h-9 w-9 text-text-muted" strokeWidth={1.4} />
          <p className="mt-3 text-sm font-medium text-text-secondary">
            {hasFilters ? 'No tasks match these filters' : 'No tasks yet'}
          </p>
          <p className="mt-1 text-xs text-text-muted">
            {hasFilters
              ? 'Try a different search or clear the filters.'
              : 'Create the first task and drag it across the board as work moves.'}
          </p>
          {!hasFilters && (
            <button
              type="button"
              onClick={() => setModal({ mode: 'create', status: 'TODO' })}
              className="mt-5 inline-flex items-center gap-2 rounded-xl border border-accent-orange/30 bg-accent-orange/10 px-4 py-2 text-sm font-medium text-accent-orange"
            >
              <PlusIcon className="h-4 w-4" strokeWidth={1.6} />
              Create a task
            </button>
          )}
        </div>
      ) : view === 'board' ? (
        <TaskBoard
          tasks={tasks}
          onEdit={(task) => setModal({ mode: 'edit', task })}
          onCreate={(status) => setModal({ mode: 'create', status })}
          onReorder={handleReorder}
          onQuickStatus={handleQuickStatus}
        />
      ) : (
        <TaskTable
          tasks={tasks}
          onEdit={(task) => setModal({ mode: 'edit', task })}
          onDelete={handleDelete}
          onQuickStatus={handleQuickStatus}
        />
      )}

      {modal && (
        <TaskModal
          key={modal.mode === 'edit' ? modal.task.id : `new-${modal.status}`}
          task={modal.mode === 'edit' ? modal.task : null}
          products={products}
          team={team}
          defaultStatus={modal.mode === 'create' ? modal.status : 'TODO'}
          defaultProductId={productId && productId !== 'none' ? productId : null}
          busy={saving}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}
