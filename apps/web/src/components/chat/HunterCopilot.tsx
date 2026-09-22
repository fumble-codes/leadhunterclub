'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Minus,
  Send,
  RotateCcw,
  ExternalLink,
  ChevronUp,
  HelpCircle,
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { auth } from '@/lib/firebase'
import { WolfOrb } from '@/components/chat/WolfOrb'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

const QUICK_QUESTIONS = [
  '⚡ How do Credits work?',
  '🔒 Are revealed leads exclusive?',
  '🔄 How do plan renewals work?',
  '🎫 How to contact human support?',
]

const INITIAL_WELCOME: Message = {
  id: 'welcome-1',
  role: 'assistant',
  content: `👋 Hey there! I'm **Hunter Copilot**, your 24/7 platform support assistant.

I can answer questions about:
• **Credits & Reveal Costs** (standard vs. custom overrides)
• **1-to-1 Lead Exclusivity** & Claim rules
• **Plan Renewals, Upgrades & Refills**
• **Refund Policy** on invalid contacts
• **Opening Support Tickets** with our admin team

Tap a quick question below or ask anything!`,
  timestamp: 'Just now',
}

const ease = [0.16, 1, 0.3, 1] as const

export function HunterCopilot() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([INITIAL_WELCOME])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom()
      setTimeout(() => inputRef.current?.focus(), 150)
    }
  }, [isOpen, isMinimized, messages, scrollToBottom])

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim()
    if (!query || loading) return

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: 'Just now',
    }

    setMessages((prev) => [...prev, userMsg])
    if (!textToSend) setInput('')
    setLoading(true)

    try {
      const token = await auth.currentUser?.getIdToken()

      const res = await fetch('/api/copilot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          message: query,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      })

      const data = await res.json()

      const botReply: Message = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content:
          data.reply ||
          data.error ||
          "I'm having trouble connecting right now. For urgent help, please visit the [/support](/support) page!",
        timestamp: 'Just now',
      }

      setMessages((prev) => [...prev, botReply])
    } catch (err) {
      console.error('[Hunter Copilot] Query error:', err)
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          role: 'assistant',
          content:
            "Connection error. Please try again or open a ticket directly at [/support](/support).",
          timestamp: 'Just now',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleResetChat = () => {
    setMessages([INITIAL_WELCOME])
  }

  const orbState = loading ? 'thinking' : isOpen ? 'online' : 'idle'

  return (
    <>
      {/* Floating Trigger Pill */}
      {!isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ duration: 0.4, ease }}
          className="fixed bottom-6 right-6 z-50 safe-area-bottom"
        >
          <button
            onClick={() => {
              setIsOpen(true)
              setIsMinimized(false)
            }}
            title="Open Hunter Copilot 24/7 Support"
            className="group relative flex items-center gap-3 pl-2 pr-4 py-2 bg-surface-container/95 hover:bg-surface-container-high/95 text-white border border-white/10 hover:border-primary/40 rounded-full shadow-elevation-4 backdrop-blur-md transition-all duration-300 active:scale-95 ring-1 ring-white/5 hover:ring-primary/25"
          >
            <div className="absolute inset-0 rounded-full bg-primary/10 blur-md -z-10 group-hover:bg-primary/20 transition-all" />

            <div className="relative">
              <WolfOrb size="sm" state="idle" showRing className="group-hover:scale-105 transition-transform duration-300" />
            </div>

            <div className="flex flex-col text-left pr-1">
              <span className="text-xs font-black tracking-tight text-white flex items-center gap-1.5">
                Hunter Copilot
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-primary/15 text-primary border border-primary/30 font-bold uppercase tracking-wider">
                  24/7
                </span>
              </span>
              <span className="text-[10px] text-text-secondary font-medium">Instant Support & FAQs</span>
            </div>
          </button>
        </motion.div>
      )}

      {/* Minimized Pill Bar */}
      {isOpen && isMinimized && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease }}
          className="fixed bottom-6 right-6 z-50 safe-area-bottom"
        >
          <div className="flex items-center gap-2.5 px-3 py-2 bg-surface-container/95 text-white border border-white/10 rounded-2xl shadow-elevation-4 backdrop-blur-md ring-1 ring-white/5">
            <WolfOrb size="xs" state={loading ? 'thinking' : 'online'} showRing={false} showStatus={false} />
            <span className="text-xs font-bold">Hunter Copilot</span>
            <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse ml-0.5" />
            <div className="flex items-center gap-1 ml-2 border-l border-white/10 pl-2">
              <button
                onClick={() => setIsMinimized(false)}
                title="Expand Copilot"
                className="p-1.5 text-text-secondary hover:text-primary rounded-lg hover:bg-primary/10 transition-colors"
              >
                <ChevronUp size={14} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close Copilot"
                className="p-1.5 text-text-secondary hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Full Chat Window */}
      <AnimatePresence>
        {isOpen && !isMinimized && (
          <motion.div
            initial={{ opacity: 0, y: 25, scale: 0.96, originX: 1, originY: 1 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.32, ease }}
            style={{ transformOrigin: 'bottom right' }}
            className="fixed bottom-6 right-6 z-50 w-[360px] sm:w-[410px] h-[540px] max-h-[85vh] bg-surface-container-low/98 border border-white/10 rounded-3xl shadow-elevation-4 backdrop-blur-2xl flex flex-col overflow-hidden ring-1 ring-white/[0.06] safe-area-bottom"
          >
            {/* Ambient primary glow */}
            <div className="absolute -top-10 -right-8 w-48 h-32 bg-primary/12 blur-3xl pointer-events-none rounded-full" />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent pointer-events-none" />

            {/* Header */}
            <div className="p-3.5 border-b border-white/[0.08] bg-surface-container-high/50 flex items-center justify-between relative z-10">
              <div className="flex items-center gap-3">
                <WolfOrb size="sm" state={orbState} showRing={false} />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-xs font-black tracking-tight text-white uppercase">
                      Hunter Copilot
                    </h3>
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                  </div>
                  <p className="text-[10px] text-text-secondary font-medium">
                    {loading ? 'Thinking…' : '24/7 Instant FAQ & Platform Support'}
                  </p>
                </div>
              </div>

              {/* Window Controls */}
              <div className="flex items-center gap-0.5 text-text-secondary">
                <button
                  onClick={handleResetChat}
                  title="Reset conversation"
                  className="p-1.5 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                >
                  <RotateCcw size={13} />
                </button>
                <button
                  onClick={() => setIsMinimized(true)}
                  title="Minimize"
                  className="p-1.5 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                >
                  <Minus size={14} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  title="Close"
                  className="p-1.5 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
              {messages.map((msg, idx) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease, delay: Math.min(idx * 0.03, 0.15) }}
                  className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[86%] rounded-2xl p-3 leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-primary text-on-primary font-semibold rounded-tr-sm shadow-md shadow-primary/15'
                        : 'bg-surface-elevated/90 text-text-secondary border border-white/[0.08] rounded-tl-sm prose prose-invert prose-sm'
                    }`}
                  >
                    {msg.role === 'user' ? (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    ) : (
                      <div className="markdown-content text-xs text-text-secondary leading-relaxed [&>p]:mb-2 [&>ul]:mb-2 [&>ul]:pl-4 [&>ul]:list-disc [&>strong]:text-white [&>a]:text-primary [&>a]:underline hover:[&>a]:text-white">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}

              {loading && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl bg-surface-elevated/80 border border-white/[0.06] w-fit"
                >
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-primary"
                        animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                        transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
                      />
                    ))}
                  </div>
                  <span className="text-[11px] font-medium text-text-secondary">
                    Hunter Copilot is typing...
                  </span>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompt Chips */}
            {messages.length <= 2 && (
              <div className="px-3.5 pb-2 pt-1">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">
                  <HelpCircle size={11} className="text-primary" />
                  <span>Popular Questions</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_QUESTIONS.map((q, i) => (
                    <motion.button
                      key={q}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 + i * 0.05, duration: 0.3, ease }}
                      onClick={() => handleSend(q)}
                      disabled={loading}
                      className="px-2.5 py-1 text-[10px] font-medium rounded-lg bg-surface-elevated hover:bg-primary/10 text-text-secondary hover:text-primary border border-white/[0.08] hover:border-primary/40 transition-all text-left disabled:opacity-50"
                    >
                      {q}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Bar */}
            <div className="p-3 border-t border-white/[0.08] bg-surface-container-high/40">
              <div className="flex items-center gap-2 bg-surface-container-lowest/80 border border-white/[0.1] rounded-xl px-3 py-1.5 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/30 transition-all">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask a question about Lead Hunter..."
                  disabled={loading}
                  className="flex-1 bg-transparent text-white text-xs outline-none placeholder:text-text-muted py-1"
                />
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.92 }}
                  onClick={() => handleSend()}
                  disabled={!input.trim() || loading}
                  title="Send message"
                  className="p-1.5 rounded-lg bg-primary text-on-primary hover:brightness-110 disabled:opacity-30 disabled:hover:brightness-100 transition-all"
                >
                  <Send size={13} />
                </motion.button>
              </div>

              <div className="flex items-center justify-between mt-1.5 px-1 text-[9px] text-text-muted font-medium">
                <span>Need priority human assistance?</span>
                <a
                  href="/support"
                  className="text-primary hover:underline inline-flex items-center gap-0.5"
                >
                  Open Ticket <ExternalLink size={8} />
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
