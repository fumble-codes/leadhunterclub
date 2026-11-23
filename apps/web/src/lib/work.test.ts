import { describe, expect, it } from 'vitest'
import {
  computeMove,
  dueDateToDate,
  serializeTask,
  type WorkTaskDTO,
} from './work'
import { createTaskSchema, reorderTasksSchema } from './validators/work'

function task(id: string, status: WorkTaskDTO['status'], position: number): WorkTaskDTO {
  return {
    id,
    productId: null,
    title: `Task ${id}`,
    description: null,
    status,
    priority: 'MEDIUM',
    assigneeId: null,
    assignee: null,
    product: null,
    dueDate: null,
    position,
    completedAt: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  }
}

describe('computeMove (drag and drop)', () => {
  const tasks = [
    task('a', 'TODO', 0),
    task('b', 'TODO', 1),
    task('c', 'DONE', 0),
  ]

  it('moves a task across columns and reindexes the source column', () => {
    const { next, changes } = computeMove(tasks, 'a', 'DONE', null)
    expect(next.find((item) => item.id === 'a')?.status).toBe('DONE')
    expect(next.find((item) => item.id === 'b')).toMatchObject({ status: 'TODO', position: 0 })
    expect(changes).toEqual(
      expect.arrayContaining([
        { id: 'a', status: 'DONE', position: 1 },
        { id: 'b', status: 'TODO', position: 0 },
      ]),
    )
  })

  it('inserts before a hovered card in the same column', () => {
    const { next, changes } = computeMove(tasks, 'b', 'TODO', 'a')
    expect(next.filter((item) => item.status === 'TODO').map((item) => item.id)).toEqual(['b', 'a'])
    expect(changes).toEqual([
      { id: 'b', status: 'TODO', position: 0 },
      { id: 'a', status: 'TODO', position: 1 },
    ])
  })

  it('appends when the hovered card is not in the target column', () => {
    const { next } = computeMove(tasks, 'a', 'DONE', 'nonexistent')
    expect(next.filter((item) => item.status === 'DONE').map((item) => item.id)).toEqual(['c', 'a'])
  })

  it('is a no-op for a missing task', () => {
    const { next, changes } = computeMove(tasks, 'missing', 'DONE', null)
    expect(next).toBe(tasks)
    expect(changes).toEqual([])
  })
})

describe('work helpers', () => {
  it('stores a date input as UTC midnight', () => {
    expect(dueDateToDate('2026-11-23')?.toISOString()).toBe('2026-11-23T00:00:00.000Z')
    expect(dueDateToDate(null)).toBeNull()
  })

  it('serializes a task row with sane fallbacks', () => {
    const serialized = serializeTask({
      ...task('x', 'BOGUS' as WorkTaskDTO['status'], 0),
      priority: 'BOGUS' as WorkTaskDTO['priority'],
      dueDate: new Date('2026-11-23T00:00:00.000Z'),
      completedAt: null,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-02T00:00:00.000Z'),
    })
    expect(serialized.status).toBe('TODO')
    expect(serialized.priority).toBe('LOW')
    expect(serialized.dueDate).toBe('2026-11-23')
  })
})

describe('work validators', () => {
  it('requires a title and accepts a valid task', () => {
    expect(createTaskSchema.safeParse({ title: '  ' }).success).toBe(false)
    expect(
      createTaskSchema.safeParse({
        title: '  Fix drawer  ',
        productId: '',
        assigneeId: null,
        dueDate: '2026-11-23',
      }),
    ).toMatchObject({
      success: true,
      data: { title: 'Fix drawer', productId: null, status: 'TODO', priority: 'MEDIUM' },
    })
  })

  it('rejects invalid reorder payloads', () => {
    expect(
      reorderTasksSchema.safeParse({ tasks: [{ id: 'a', status: 'TODO', position: -1 }] }).success,
    ).toBe(false)
    expect(
      reorderTasksSchema.safeParse({ tasks: [{ id: 'a', status: 'TODO', position: 0 }] }).success,
    ).toBe(true)
  })
})
