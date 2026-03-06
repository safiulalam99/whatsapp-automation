'use client'

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

export function ConversationCard({ conversation, index, onClick }: ConversationCardProps) {
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
        className={`
          w-full text-left
          relative overflow-hidden
          bg-[var(--surface)] hover:bg-[var(--surface-elevated)]
          rounded-2xl border border-white/5
          transition-all duration-200
          hover:shadow-xl
          ${conversation.conversation_status === 'done' ? 'opacity-60' : ''}
          p-4
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
          <span className="text-[var(--foreground-muted)] font-mono">
            {formatTimeAgo(conversation.last_message_at)}
          </span>
          <span className="text-[var(--foreground-muted)]">
            {conversation.message_count} {conversation.message_count === 1 ? 'message' : 'messages'}
          </span>
        </div>
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
