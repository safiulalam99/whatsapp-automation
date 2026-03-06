import React from 'react'

interface BadgeProps {
  variant?: 'urgent' | 'warning' | 'info' | 'success' | 'neutral'
  children: React.ReactNode
  className?: string
}

export function Badge({ variant = 'neutral', children, className = '' }: BadgeProps) {
  const variants = {
    urgent: 'bg-[var(--urgent-light)] text-[var(--urgent)] border-[var(--urgent)]',
    warning: 'bg-[var(--warning-light)] text-[var(--warning)] border-[var(--warning)]',
    info: 'bg-[var(--info-light)] text-[var(--info)] border-[var(--info)]',
    success: 'bg-[var(--emerald-light)] text-[var(--emerald)] border-[var(--emerald)]',
    neutral: 'bg-[var(--surface-elevated)] text-[var(--text-secondary)] border-[var(--border)]',
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-lg text-caption font-medium border ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  )
}
