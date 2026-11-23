'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ArrowRightIcon,
  ClipboardDocumentListIcon,
  CubeIcon,
  PencilSquareIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/24/outline'
import { useToast } from '@/components/ui/Toast'
import { CustomLoader } from '@/components/ui/CustomLoader'
import { getFirebaseToken } from '@/lib/firebase'
import ProductModal, { type ProductFormValues } from '@/components/work/ProductModal'
import { AssigneeAvatar, ProductDot } from '@/components/work/WorkBits'
import {
  PRODUCT_STATUS_LABELS,
  TASK_STATUSES,
  TASK_STATUS_LABELS,
  type ProductStatus,
  type TeamMemberDTO,
  type WorkProductDTO,
} from '@/lib/work'

const STATUS_STYLES: Record<ProductStatus, string> = {
  PLANNED: 'border-white/12 bg-white/[0.04] text-text-secondary',
  ACTIVE: 'border-accent-mint/30 bg-accent-mint/10 text-accent-mint',
  PAUSED: 'border-accent-purple/30 bg-accent-purple/10 text-accent-purple',
  SHIPPED: 'border-accent-cyan/30 bg-accent-cyan/10 text-accent-cyan',
}

async function authHeaders(): Promise<Record<string, string>> {
  const token = await getFirebaseToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export default function AdminProductsPage() {
  const { addToast } = useToast()
  const [products, setProducts] = useState<WorkProductDTO[]>([])
  const [team, setTeam] = useState<TeamMemberDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<{ mode: 'create' } | { mode: 'edit'; product: WorkProductDTO } | null>(null)
  const [saving, setSaving] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const headers = await authHeaders()
      const [productsRes, teamRes] = await Promise.all([
        fetch('/api/admin/products', { headers }),
        fetch('/api/admin/team', { headers }),
      ])
      if (!productsRes.ok) throw new Error('Failed to load products')
      const json = (await productsRes.json()) as { data: WorkProductDTO[] }
      setProducts(json.data ?? [])
      if (teamRes.ok) {
        const teamJson = (await teamRes.json()) as { data: TeamMemberDTO[] }
        setTeam(teamJson.data ?? [])
      }
    } catch (error) {
      addToast({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to load products',
      })
    } finally {
      setLoading(false)
    }
  }, [addToast])

  useEffect(() => {
    load()
  }, [load])

  const handleSave = async (values: ProductFormValues) => {
    setSaving(true)
    try {
      const isEdit = modal?.mode === 'edit'
      const url = isEdit ? `/api/admin/products/${modal.product.id}` : '/api/admin/products'
      const res = await fetch(url, {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json', ...(await authHeaders()) },
        body: JSON.stringify(values),
      })
      const json = await res.json().catch(() => null)
      if (!res.ok) throw new Error(json?.message || 'Failed to save product')
      addToast({ type: 'success', message: isEdit ? 'Product updated' : 'Product created' })
      setModal(null)
      await load()
    } catch (error) {
      addToast({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to save product',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (product: WorkProductDTO) => {
    const warning =
      product.totalTasks > 0
        ? `Delete "${product.name}"? Its ${product.totalTasks} task(s) will stay on the board without a product.`
        : `Delete "${product.name}"?`
    if (!window.confirm(warning)) return
    setBusyId(product.id)
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: 'DELETE',
        headers: await authHeaders(),
      })
      if (!res.ok) {
        const json = await res.json().catch(() => null)
        throw new Error(json?.message || 'Failed to delete product')
      }
      addToast({ type: 'success', message: 'Product deleted' })
      await load()
    } catch (error) {
      addToast({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to delete product',
      })
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 pb-24 pt-6 md:px-8">
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-text-primary">
            Products
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            The workstreams your team plans around. Each one has its own task board.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/tasks"
            className="inline-flex items-center gap-2 self-start rounded-xl border border-white/[0.09] px-3.5 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:border-white/15 hover:text-text-primary"
          >
            <ClipboardDocumentListIcon className="h-4 w-4" strokeWidth={1.6} />
            All tasks
          </Link>
          <button
            type="button"
            onClick={() => setModal({ mode: 'create' })}
            className="inline-flex items-center gap-2 self-start rounded-xl bg-accent-orange px-4 py-2.5 text-sm font-semibold text-[#0a0a0f] transition-transform hover:scale-[1.02]"
          >
            <PlusIcon className="h-4 w-4" strokeWidth={1.6} />
            New product
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <CustomLoader />
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.015] px-6 py-16 text-center">
          <CubeIcon className="mx-auto h-9 w-9 text-text-muted" strokeWidth={1.4} />
          <p className="mt-3 text-sm font-medium text-text-secondary">No products yet</p>
          <p className="mt-1 text-xs text-text-muted">
            Add a product like &ldquo;Lead Engine&rdquo; or &ldquo;Marketing&rdquo;, then attach tasks to it.
          </p>
          <button
            type="button"
            onClick={() => setModal({ mode: 'create' })}
            className="mt-5 inline-flex items-center gap-2 rounded-xl border border-accent-orange/30 bg-accent-orange/10 px-4 py-2 text-sm font-medium text-accent-orange"
          >
            <PlusIcon className="h-4 w-4" strokeWidth={1.6} />
            Create a product
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => {
            const total = product.totalTasks
            const done = product.taskCounts.DONE
            const percent = total > 0 ? Math.round((done / total) * 100) : 0
            return (
              <article
                key={product.id}
                className="flex flex-col rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 transition-colors hover:border-white/12 hover:bg-white/[0.03]"
              >
                <div className="flex items-start gap-3">
                  <span
                    className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.03]"
                  >
                    <ProductDot color={product.color} size={12} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate text-[15px] font-semibold text-text-primary">
                      {product.name}
                    </h2>
                    <span
                      className={`mt-1 inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${STATUS_STYLES[product.status]}`}
                    >
                      {PRODUCT_STATUS_LABELS[product.status]}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setModal({ mode: 'edit', product })}
                    className="rounded-lg border border-white/[0.08] p-1.5 text-text-muted transition-colors hover:border-white/15 hover:text-text-primary"
                    title="Edit product"
                    aria-label={`Edit ${product.name}`}
                  >
                    <PencilSquareIcon className="h-3.5 w-3.5" strokeWidth={1.6} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(product)}
                    disabled={busyId === product.id}
                    className="rounded-lg border border-white/[0.08] p-1.5 text-text-muted transition-colors hover:border-red-500/40 hover:text-red-400 disabled:opacity-50"
                    title="Delete product"
                    aria-label={`Delete ${product.name}`}
                  >
                    <TrashIcon className="h-3.5 w-3.5" strokeWidth={1.6} />
                  </button>
                </div>

                <p className="mt-3 min-h-[34px] text-xs leading-relaxed text-text-muted">
                  {product.description || 'No description yet.'}
                </p>

                <div className="mt-4">
                  <div className="mb-1.5 flex items-center justify-between text-[11px]">
                    <span className="text-text-muted">Progress</span>
                    <span className="font-mono text-text-secondary">{done}/{total} done</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      className="h-full rounded-full bg-accent-mint transition-[width] duration-300"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-4 gap-1.5">
                  {TASK_STATUSES.map((status) => (
                    <div
                      key={status}
                      className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-1.5 py-2 text-center"
                    >
                      <p className="font-display text-sm font-semibold text-text-primary">
                        {product.taskCounts[status]}
                      </p>
                      <p className="mt-0.5 truncate text-[9px] uppercase tracking-wide text-text-muted">
                        {TASK_STATUS_LABELS[status]}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-auto flex items-center justify-between gap-2 border-t border-white/[0.06] pt-4">
                  <span className="inline-flex min-w-0 items-center gap-2 text-[11px] text-text-secondary">
                    <AssigneeAvatar member={product.owner} size={22} />
                    <span className="truncate">
                      {product.owner ? product.owner.name || product.owner.email : 'No owner'}
                    </span>
                  </span>
                  <Link
                    href={`/admin/tasks?product=${product.id}`}
                    className="inline-flex shrink-0 items-center gap-1 text-[11px] font-semibold text-accent-orange transition-colors hover:text-accent-purple"
                  >
                    Open board
                    <ArrowRightIcon className="h-3.5 w-3.5" strokeWidth={1.6} />
                  </Link>
                </div>
              </article>
            )
          })}
        </div>
      )}

      {modal && (
        <ProductModal
          key={modal.mode === 'edit' ? modal.product.id : 'new-product'}
          product={modal.mode === 'edit' ? modal.product : null}
          team={team}
          busy={saving}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}
