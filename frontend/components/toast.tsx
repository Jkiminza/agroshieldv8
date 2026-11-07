'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, AlertCircle, X } from 'lucide-react'

interface ToastProps {
  message: string
  type?: 'success' | 'error'
  duration?: number
  onClose?: () => void
}

export function Toast({ message, type = 'success', duration = 3000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      onClose?.()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  if (!isVisible) return null

  return (
    <div
      className={`fixed top-4 right-4 flex items-center gap-3 px-4 py-3 rounded-lg border backdrop-blur-sm animate-in fade-in slide-in-from-top-4 z-[9999] ${
        type === 'success'
          ? 'bg-emerald-900/30 border-emerald-500/30 text-emerald-300'
          : 'bg-red-900/30 border-red-500/30 text-red-300'
      }`}
    >
      {type === 'success' ? (
        <CheckCircle size={20} />
      ) : (
        <AlertCircle size={20} />
      )}
      <span className="text-sm font-medium">{message}</span>
      <button
        onClick={() => setIsVisible(false)}
        className="ml-2 text-current hover:opacity-70"
      >
        <X size={16} />
      </button>
    </div>
  )
}

export function ToastContainer({
  toasts,
  onRemove,
}: {
  toasts: Array<{ id: string; message: string; type?: 'success' | 'error' }>
  onRemove: (id: string) => void
}) {
  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => onRemove(toast.id)}
        />
      ))}
    </div>
  )
}
