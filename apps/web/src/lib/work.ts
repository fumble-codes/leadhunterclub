/**
 * Shared vocabulary + DTOs for the admin work-management screens.
 * Kept framework-agnostic so API routes and client components agree on values.
 */

export const TASK_STATUSES = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'] as const
export type TaskStatus = (typeof TASK_STATUSES)[number]

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: 'To do',
  IN_PROGRESS: 'In progress',
  REVIEW: 'In review',
  DONE: 'Done',
}

export const TASK_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const
export type TaskPriority = (typeof TASK_PRIORITIES)[number]

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  URGENT: 'Urgent',
}

export const PRODUCT_STATUSES = ['PLANNED', 'ACTIVE', 'PAUSED', 'SHIPPED'] as const
export type ProductStatus = (typeof PRODUCT_STATUSES)[number]

export const PRODUCT_STATUS_LABELS: Record<ProductStatus, string> = {
  PLANNED: 'Planned',
  ACTIVE: 'Active',
  PAUSED: 'Paused',
  SHIPPED: 'Shipped',
}

export const WORK_COLORS = ['mint', 'purple', 'cyan', 'orange', 'pink'] as const
export type WorkColor = (typeof WORK_COLORS)[number]

export interface TeamMemberDTO {
  id: string
  name: string
  email: string
}

export interface WorkProductDTO {
  id: string
  name: string
  description: string | null
  status: ProductStatus
  color: WorkColor
  ownerId: string | null
  owner: TeamMemberDTO | null
  createdAt: string
  updatedAt: string
  taskCounts: Record<TaskStatus, number>
  totalTasks: number
}

export interface WorkTaskDTO {
  id: string
  productId: string | null
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  assigneeId: string | null
  assignee: TeamMemberDTO | null
  product: { id: string; name: string; color: WorkColor } | null
  /** YYYY-MM-DD (stored as UTC midnight) or null. */
  dueDate: string | null
  position: number
  completedAt: string | null
  createdAt: string
  updatedAt: string
}

type MemberRow = { id: string; name: string; email: string }
type ProductRefRow = { id: string; name: string; color: string }
type TaskRow = {
  id: string
  productId: string | null
  title: string
  description: string | null
  status: string
  priority: string
  assigneeId: string | null
  dueDate: Date | null
  position: number
  completedAt: Date | null
  createdAt: Date
  updatedAt: Date
  product?: ProductRefRow | null
  assignee?: MemberRow | null
}

type ProductRow = {
  id: string
  name: string
  description: string | null
  status: string
  color: string
  ownerId: string | null
  createdAt: Date
  updatedAt: Date
  owner?: MemberRow | null
}

function asStatus<T extends readonly string[]>(values: T, value: string): T[number] {
  return (values as readonly string[]).includes(value) ? (value as T[number]) : values[0]
}

function isoDate(value: Date | null): string | null {
  return value ? value.toISOString().slice(0, 10) : null
}

function isoDateTime(value: Date): string {
  return value.toISOString()
}

function member(row?: MemberRow | null): TeamMemberDTO | null {
  return row ? { id: row.id, name: row.name, email: row.email } : null
}

export function serializeTask(row: TaskRow): WorkTaskDTO {
  return {
    id: row.id,
    productId: row.productId,
    title: row.title,
    description: row.description,
    status: asStatus(TASK_STATUSES, row.status),
    priority: asStatus(TASK_PRIORITIES, row.priority),
    assigneeId: row.assigneeId,
    assignee: member(row.assignee),
    product: row.product
      ? { id: row.product.id, name: row.product.name, color: asStatus(WORK_COLORS, row.product.color) }
      : null,
    dueDate: isoDate(row.dueDate),
    position: row.position,
    completedAt: row.completedAt ? isoDateTime(row.completedAt) : null,
    createdAt: isoDateTime(row.createdAt),
    updatedAt: isoDateTime(row.updatedAt),
  }
}

export function serializeProduct(
  row: ProductRow,
  counts: Record<TaskStatus, number> = { TODO: 0, IN_PROGRESS: 0, REVIEW: 0, DONE: 0 },
): WorkProductDTO {
  const taskCounts: Record<TaskStatus, number> = {
    TODO: counts.TODO ?? 0,
    IN_PROGRESS: counts.IN_PROGRESS ?? 0,
    REVIEW: counts.REVIEW ?? 0,
    DONE: counts.DONE ?? 0,
  }
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    status: asStatus(PRODUCT_STATUSES, row.status),
    color: asStatus(WORK_COLORS, row.color),
    ownerId: row.ownerId,
    owner: member(row.owner),
    createdAt: isoDateTime(row.createdAt),
    updatedAt: isoDateTime(row.updatedAt),
    taskCounts,
    totalTasks: Object.values(taskCounts).reduce((sum, n) => sum + n, 0),
  }
}

export function emptyTaskCounts(): Record<TaskStatus, number> {
  return { TODO: 0, IN_PROGRESS: 0, REVIEW: 0, DONE: 0 }
}

/** YYYY-MM-DD from a date input → UTC midnight, or null. */
export function dueDateToDate(value: string | null | undefined): Date | null {
  if (!value) return null
  return new Date(`${value}T00:00:00.000Z`)
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

export function formatDueDate(value: string | null): string {
  if (!value) return ''
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  })
}

export interface ReorderChange {
  id: string
  status: TaskStatus
  position: number
}

/**
 * Pure drag calculation. Returns the optimistic task list and the minimal
 * set of {id, status, position} changes to persist (source column included
 * when the task crosses columns).
 */
export function computeMove(
  tasks: WorkTaskDTO[],
  draggedId: string,
  targetStatus: TaskStatus,
  beforeId: string | null,
): { next: WorkTaskDTO[]; changes: ReorderChange[] } {
  const dragged = tasks.find((task) => task.id === draggedId)
  if (!dragged) return { next: tasks, changes: [] }

  const rest = tasks.filter((task) => task.id !== draggedId)
  const target = rest.filter((task) => task.status === targetStatus)
  let insertAt = beforeId ? target.findIndex((task) => task.id === beforeId) : -1
  if (insertAt < 0) insertAt = target.length

  const moved: WorkTaskDTO = { ...dragged, status: targetStatus }
  target.splice(insertAt, 0, moved)

  const changes: ReorderChange[] = target.map((task, index) => ({
    id: task.id,
    status: targetStatus,
    position: index,
  }))
  if (dragged.status !== targetStatus) {
    rest
      .filter((task) => task.status === dragged.status)
      .forEach((task, index) => {
        changes.push({ id: task.id, status: task.status, position: index })
      })
  }

  const byId = new Map(changes.map((change) => [change.id, change]))
  const next = [...rest, moved]
    .map((task) => {
      const change = byId.get(task.id)
      return change ? { ...task, status: change.status, position: change.position } : task
    })
    .sort(
      (a, b) =>
        TASK_STATUSES.indexOf(a.status) - TASK_STATUSES.indexOf(b.status) ||
        a.position - b.position,
    )
  return { next, changes }
}
