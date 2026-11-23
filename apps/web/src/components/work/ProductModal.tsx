'use client'

import { useState, type FormEvent } from 'react'
import { FIELD_CLASS, LABEL_CLASS, ModalShell, ProductDot } from '@/components/work/WorkBits'
import { accentColorMap } from '@/lib/colors'
import {
  PRODUCT_STATUSES,
  PRODUCT_STATUS_LABELS,
  WORK_COLORS,
  type ProductStatus,
  type TeamMemberDTO,
  type WorkColor,
  type WorkProductDTO,
} from '@/lib/work'

export interface ProductFormValues {
  name: string
  description: string
  status: ProductStatus
  color: WorkColor
  ownerId: string | null
}

export default function ProductModal({
  product,
  team,
  busy,
  onSave,
  onClose,
}: {
  product: WorkProductDTO | null
  team: TeamMemberDTO[]
  busy: boolean
  onSave: (values: ProductFormValues) => Promise<void>
  onClose: () => void
}) {
  const [name, setName] = useState(product?.name ?? '')
  const [description, setDescription] = useState(product?.description ?? '')
  const [status, setStatus] = useState<ProductStatus>(product?.status ?? 'ACTIVE')
  const [color, setColor] = useState<WorkColor>(product?.color ?? 'mint')
  const [ownerId, setOwnerId] = useState(product?.ownerId ?? '')

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!name.trim()) return
    await onSave({
      name: name.trim(),
      description,
      status,
      color,
      ownerId: ownerId || null,
    })
  }

  return (
    <ModalShell
      title={product ? 'Edit product' : 'New product'}
      subtitle="Group tasks by product, team or workstream — whatever your team plans around."
      onClose={onClose}
      width="max-w-lg"
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className={LABEL_CLASS} htmlFor="product-name">
            Name <span className="text-accent-pink">*</span>
          </label>
          <input
            id="product-name"
            autoFocus
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Lead Engine"
            maxLength={120}
            className={FIELD_CLASS}
            required
          />
        </div>

        <div>
          <label className={LABEL_CLASS} htmlFor="product-description">
            Description
          </label>
          <textarea
            id="product-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="What does this workstream cover?"
            rows={3}
            maxLength={1000}
            className={`${FIELD_CLASS} resize-y`}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="product-status">
              Status
            </label>
            <select
              id="product-status"
              value={status}
              onChange={(event) => setStatus(event.target.value as ProductStatus)}
              className={FIELD_CLASS}
            >
              {PRODUCT_STATUSES.map((value) => (
                <option key={value} value={value}>
                  {PRODUCT_STATUS_LABELS[value]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="product-owner">
              Owner
            </label>
            <select
              id="product-owner"
              value={ownerId}
              onChange={(event) => setOwnerId(event.target.value)}
              className={FIELD_CLASS}
            >
              <option value="">No owner</option>
              {team.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name || member.email}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <span className={LABEL_CLASS}>Accent</span>
          <div className="flex flex-wrap gap-2">
            {WORK_COLORS.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setColor(value)}
                aria-label={`Use ${value} accent`}
                aria-pressed={color === value}
                className={`flex h-9 w-9 items-center justify-center rounded-full border transition-transform hover:scale-105 ${
                  color === value ? 'border-white/60' : 'border-white/10'
                }`}
              >
                <ProductDot color={value} size={18} />
              </button>
            ))}
          </div>
          <span className="sr-only">Selected accent: {accentColorMap[color]}</span>
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
            disabled={busy || !name.trim()}
            className="inline-flex items-center gap-2 rounded-xl bg-accent-orange px-4 py-2.5 text-sm font-semibold text-[#0a0a0f] transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? 'Saving…' : product ? 'Save changes' : 'Create product'}
          </button>
        </div>
      </form>
    </ModalShell>
  )
}
