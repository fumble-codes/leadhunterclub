'use client'

import { useEffect, useCallback, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  actions?: ReactNode
  size?: 'sm' | 'md'
}

const sizeStyles = {
  sm: 'max-w-sm',
  md: 'max-w-md',
}

export function Modal({ open, onClose, title, children, actions, size = 'md' }: ModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose],
  )

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [open, handleKeyDown])

  // Portal to <body>: modals rendered inside a positioned main (z-10) would
  // otherwise sit below the mobile bottom nav (z-40).
  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className={`relative flex w-full flex-col overflow-hidden bg-surface border border-border-subtle
              rounded-xl shadow-elevation-4 max-h-[calc(100dvh-1.5rem)] ${sizeStyles[size]}`}
          >
            <div className="flex shrink-0 items-center justify-between border-b border-white/5 px-6 py-4">
              <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
              <button
                onClick={onClose}
                aria-label="Close dialog"
                className="text-text-muted hover:text-text-primary transition-colors p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-6 py-4 text-sm leading-relaxed text-text-secondary">
              {children}
            </div>
            {actions && (
              <div className="flex shrink-0 flex-wrap justify-end gap-3 border-t border-white/5 bg-surface px-6 py-4">
                {actions}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
