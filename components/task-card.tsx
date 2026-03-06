'use client'

import { useState } from 'react'

type TaskType = 'invoice' | 'vat_query' | 'doc_request' | 'payment' | 'general' | 'ignore'
type TaskUrgency = 'low' | 'normal' | 'high' | 'urgent'
type TaskStatus = 'pending' | 'in_progress' | 'done' | 'snoozed'

interface Task {
  id: string
  client_name: string
  wa_number: string
  type: TaskType
  urgency: TaskUrgency
  status: TaskStatus
  summary: string
  created_at: string
  entities: Record<string, any>
}

interface TaskCardProps {
  task: Task
  index: number
}

const typeConfig: Record<TaskType, { label: string; color: string; icon: string }> = {
  invoice: { label: 'Invoice', color: 'var(--invoice)', icon: '📄' },
  vat_query: { label: 'VAT', color: 'var(--vat)', icon: '📊' },
  doc_request: { label: 'Document', color: 'var(--doc)', icon: '📎' },
  payment: { label: 'Payment', color: 'var(--payment)', icon: '💳' },
  general: { label: 'General', color: 'var(--general)', icon: '💬' },
  ignore: { label: 'Ignore', color: 'var(--normal)', icon: '🚫' },
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return 'Just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

export function TaskCard({ task, index }: TaskCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const typeInfo = typeConfig[task.type]

  return (
    <div
      className="group relative"
      style={{
        animation: `slideIn 300ms ease-out ${index * 50}ms both`,
      }}
    >
      <div
        className={`
          relative overflow-hidden
          bg-[var(--surface)] hover:bg-[var(--surface-elevated)]
          rounded-2xl border border-white/5
          transition-all duration-200
          ${isExpanded ? 'shadow-2xl' : 'hover:shadow-xl'}
          ${task.status === 'done' ? 'opacity-60' : ''}
        `}
      >
        {/* Urgency Glow */}
        {task.urgency === 'urgent' && (
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--urgent)]/10 to-transparent pointer-events-none" />
        )}

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full text-left p-4"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium text-[var(--foreground)] truncate">
                  {task.client_name}
                </h3>
                {task.urgency === 'urgent' && (
                  <div className="flex-shrink-0 w-2 h-2 rounded-full bg-[var(--urgent)] animate-pulse" />
                )}
                {task.urgency === 'high' && (
                  <div className="flex-shrink-0 w-2 h-2 rounded-full bg-[var(--high)]" />
                )}
              </div>
              <p className="text-xs text-[var(--foreground-muted)] font-mono">
                +{task.wa_number}
              </p>
            </div>

            <div className="flex-shrink-0 flex items-center gap-2">
              {/* Type Badge */}
              <div
                className="px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5"
                style={{
                  backgroundColor: `${typeInfo.color}20`,
                  color: typeInfo.color,
                }}
              >
                <span>{typeInfo.icon}</span>
                <span>{typeInfo.label}</span>
              </div>

              {/* Expand Icon */}
              <div
                className={`
                  w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center
                  transition-transform duration-200
                  ${isExpanded ? 'rotate-180' : ''}
                `}
              >
                <svg className="w-4 h-4 text-[var(--foreground-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Summary */}
          <p className="text-sm text-[var(--foreground)] leading-relaxed mb-3">
            {task.summary}
          </p>

          {/* Meta Info */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-[var(--foreground-muted)] font-mono">
              {formatTimeAgo(task.created_at)}
            </span>

            {/* Entities */}
            {task.entities.amount && (
              <span className="font-mono font-semibold text-[var(--emerald)]">
                {task.entities.currency} {task.entities.amount.toLocaleString()}
              </span>
            )}
          </div>
        </button>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="px-4 pb-4 border-t border-white/5 pt-4 space-y-3 animate-fadeIn">
            {/* Status Actions */}
            <div className="flex gap-2">
              <button className="flex-1 py-2.5 rounded-xl bg-[var(--emerald)] hover:bg-[var(--emerald)]/90 text-black font-medium text-sm transition-colors">
                Reply
              </button>
              <button className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-[var(--foreground)] text-sm transition-colors">
                Mark Done
              </button>
            </div>

            {/* Additional Info */}
            {task.entities.document_type && (
              <div className="p-3 rounded-xl bg-white/5">
                <p className="text-xs text-[var(--foreground-muted)] mb-1">Document Type</p>
                <p className="text-sm text-[var(--foreground)] font-medium">{task.entities.document_type}</p>
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}
