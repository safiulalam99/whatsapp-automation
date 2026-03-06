'use client'

import { useState } from 'react'

type ConversationStatus = 'pending' | 'in_progress' | 'done' | 'follow_up'
type ConversationUrgency = 'low' | 'normal' | 'high' | 'urgent'

interface Conversation {
  id: string
  wa_number: string
  display_name: string | null
  conversation_summary: string | null
  conversation_status: ConversationStatus
  last_message_at: string | null
  needs_action: boolean
  urgency: ConversationUrgency
  message_count: number
}

interface ConversationCardProps {
  conversation: Conversation
  index: number
  onClick: () => void
  isSelected?: boolean
}

const statusConfig: Record<ConversationStatus, { label: string; color: string; icon: string }> = {
  pending: { label: 'New', color: 'var(--high)', icon: '🔔' },
  in_progress: { label: 'Active', color: 'var(--doc)', icon: '💬' },
  done: { label: 'Done', color: 'var(--normal)', icon: '✓' },
  follow_up: { label: 'Follow-up', color: 'var(--vat)', icon: '🔄' },
}

function formatTimeAgo(dateString: string | null): string {
  if (!dateString) return 'Never'

  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return 'Just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
  return date.toLocaleDateString()
}

export function ConversationCard({ conversation, index, onClick, isSelected = false }: ConversationCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const statusInfo = statusConfig[conversation.conversation_status]
  const displayName = conversation.display_name || conversation.wa_number

  return (
    <div
      className="group relative"
      style={{
        animation: `slideIn 300ms ease-out ${index * 50}ms both`,
      }}
    >
      <button
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          w-full text-left
          relative overflow-hidden
          rounded-2xl border transition-all duration-200
          p-4

          /* Mobile: Dark theme */
          bg-[var(--surface)] border-white/5
          hover:bg-[var(--surface-elevated)]

          /* Desktop: Light theme */
          lg:bg-white lg:border-gray-200
          lg:hover:bg-gray-50

          /* Selected state (desktop) */
          ${isSelected ? 'lg:bg-emerald-50 lg:border-emerald-200' : ''}

          /* Done state */
          ${conversation.conversation_status === 'done' ? 'opacity-60' : ''}
        `}
      >
        {/* Urgency Glow */}
        {conversation.urgency === 'urgent' && (
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--urgent)]/10 to-transparent pointer-events-none" />
        )}

        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium text-[var(--foreground)] truncate">
                {displayName}
              </h3>
              {conversation.urgency === 'urgent' && (
                <div className="flex-shrink-0 w-2 h-2 rounded-full bg-[var(--urgent)] animate-pulse" />
              )}
              {conversation.urgency === 'high' && (
                <div className="flex-shrink-0 w-2 h-2 rounded-full bg-[var(--high)]" />
              )}
              {conversation.needs_action && (
                <span className="flex-shrink-0 text-xs px-2 py-0.5 rounded-full bg-[var(--emerald)]/20 text-[var(--emerald)]">
                  Action needed
                </span>
              )}
            </div>
            <p className="text-xs text-[var(--foreground-muted)] font-mono">
              +{conversation.wa_number}
            </p>
          </div>

          {/* Status Badge */}
          <div
            className="flex-shrink-0 px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5"
            style={{
              backgroundColor: `${statusInfo.color}20`,
              color: statusInfo.color,
            }}
          >
            <span>{statusInfo.icon}</span>
            <span>{statusInfo.label}</span>
          </div>
        </div>

        {/* Summary */}
        {conversation.conversation_summary && (
          <p className="text-sm text-[var(--foreground)] leading-relaxed mb-3 line-clamp-2">
            {conversation.conversation_summary}
          </p>
        )}

        {/* Meta Info */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-[var(--foreground-muted)] font-mono lg:text-gray-500">
            {formatTimeAgo(conversation.last_message_at)}
          </span>
          <span className="text-[var(--foreground-muted)] lg:text-gray-500">
            {conversation.message_count} {conversation.message_count === 1 ? 'message' : 'messages'}
          </span>
        </div>

        {/* Desktop Hover Actions */}
        {isHovered && (
          <div className="hidden lg:flex gap-2 mt-3 pt-3 border-t border-gray-200">
            <button
              onClick={(e) => {
                e.stopPropagation()
                // TODO: Quick reply
              }}
              className="flex-1 px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              📤 Send
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                // TODO: Mark done
              }}
              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors"
            >
              ✓ Done
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                // TODO: Snooze
              }}
              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors"
            >
              💤
            </button>
          </div>
        )}
      </button>

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

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  )
}
