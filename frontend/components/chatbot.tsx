'use client'

import { useState } from 'react'
import { MessageCircle, X, Send, Loader2 } from 'lucide-react'

type Msg = { role: 'user' | 'assistant'; content: string }

const SUGGESTIONS = ['How do I buy cover?', 'What triggers a payout?', 'How do I use USSD?', 'What does the oracle do?']

export function Chatbot() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<Msg[]>([
    { role: 'assistant', content: 'Hi! I am the AgroShield assistant. Ask me about the platform, parametric insurance, USSD, or weather payouts.' },
  ])

  const send = async (text?: string) => {
    const msg = (text ?? input).trim()
    if (!msg || loading) return
    setInput('')
    const next: Msg[] = [...messages, { role: 'user', content: msg }]
    setMessages(next)
    setLoading(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next }),
      })
      const data = await res.json()
      setMessages((prev) => [...prev, { role: 'assistant', content: data?.reply || data?.error || 'No response.' }])
    } catch (e: any) {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Network error. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open AgroShield assistant"
          className="fixed bottom-5 right-5 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-[#19a463] text-white shadow-lg hover:bg-[#00c896]"
        >
          <MessageCircle size={20} />
        </button>
      )}
      {open && (
        <div className="fixed bottom-5 right-5 z-50 flex h-[460px] w-[340px] max-w-[90vw] flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between bg-[#19a463] px-4 py-3 text-white">
            <span className="text-sm font-semibold">AgroShield Assistant</span>
            <button onClick={() => setOpen(false)} aria-label="Close chat" className="rounded p-1 hover:bg-white/20">
              <X size={16} />
            </button>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-3 text-sm">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-3 py-2 ${m.role === 'user' ? 'bg-[#19a463] text-white' : 'bg-neutral-100 text-neutral-900'}`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-neutral-100 px-3 py-2">
                  <Loader2 size={14} className="animate-spin" />
                </div>
              </div>
            )}
          </div>
          {messages.length <= 1 && (
            <div className="flex flex-wrap gap-2 border-t border-neutral-100 px-3 py-2">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => send(s)} className="rounded-full border border-neutral-200 px-2 py-1 text-xs text-neutral-600 hover:bg-neutral-50">
                  {s}
                </button>
              ))}
            </div>
          )}
          <div className="flex items-center gap-2 border-t border-neutral-200 p-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') send() }}
              placeholder="Ask about AgroShield…"
              className="flex-1 rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#19a463]"
            />
            <button onClick={() => send()} disabled={loading || !input.trim()} className="rounded-xl bg-[#19a463] p-2 text-white disabled:opacity-50">
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
