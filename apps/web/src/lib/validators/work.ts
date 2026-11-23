import { z } from 'zod'
import {
  PRODUCT_STATUSES,
  TASK_PRIORITIES,
  TASK_STATUSES,
  WORK_COLORS,
} from '@/lib/work'

const nullableText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Must be ${max} characters or fewer`)
    .optional()
    .nullable()
    .transform((value) => (value && value.trim() ? value.trim() : null))

const idOrNull = z
  .string()
  .trim()
  .max(128)
  .optional()
  .nullable()
  .transform((value) => value || null)

/** Date inputs send YYYY-MM-DD; stored as UTC midnight. */
const dueDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date')
  .optional()
  .nullable()

export const createTaskSchema = z.object({
  title: z.string().trim().min(2, 'Add a short task title').max(180, 'Title is too long'),
  description: nullableText(2000),
  productId: idOrNull,
  status: z.enum(TASK_STATUSES).default('TODO'),
  priority: z.enum(TASK_PRIORITIES).default('MEDIUM'),
  assigneeId: idOrNull,
  dueDate,
})

export const updateTaskSchema = createTaskSchema.partial()

export const reorderTasksSchema = z.object({
  tasks: z
    .array(
      z.object({
        id: z.string().min(1),
        status: z.enum(TASK_STATUSES),
        position: z.number().int().min(0).max(10000),
      }),
    )
    .min(1)
    .max(500),
})

export const createProductSchema = z.object({
  name: z.string().trim().min(2, 'Add a product name').max(120, 'Name is too long'),
  description: nullableText(1000),
  status: z.enum(PRODUCT_STATUSES).default('ACTIVE'),
  color: z.enum(WORK_COLORS).default('mint'),
  ownerId: idOrNull,
})

export const updateProductSchema = createProductSchema.partial()

export type CreateTaskInput = z.infer<typeof createTaskSchema>
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>
export type CreateProductInput = z.infer<typeof createProductSchema>
export type UpdateProductInput = z.infer<typeof updateProductSchema>
