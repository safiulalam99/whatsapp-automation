'use client'

import { useState, useEffect } from 'react'
import { ConversationCard } from '@/components/conversation-card'
import { TaskFilters } from '@/components/task-filters'

type ConversationStatus = 'pending' | 'in_progress' | 'done' | 'follow_up'
type ConversationUrgency = 'low' | 'normal' | 'high' | 'urgent'
type FilterStatus = 'all' | 'pending' | 'in_progress' | 'done'

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

export default function DashboardPage() {
  const [filter, setFilter] = useState<FilterStatus>('all')
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadConversations()
  }, [])

  async function loadConversations() {
    try {
      const response = await fetch('/api/conversations')
      if (!response.ok) {
        throw new Error('Failed to fetch conversations')
      }

      const data = await response.json()
      setConversations(data.conversations || [])
    } catch (err) {
      console.error('Unexpected error:', err)
      setError('Failed to load conversations')
    } finally {
      setLoading(false)
    }
  }

  const filteredConversations = conversations.filter((conv) => {
    if (filter === 'all') return true
    if (filter === 'pending') return conv.conversation_status === 'pending'
    if (filter === 'in_progress') return conv.conversation_status === 'in_progress'
    if (filter === 'done') return conv.conversation_status === 'done'
    return true
  })

  const actionNeededCount = conversations.filter(c => c.needs_action).length

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[var(--background)]/80 border-b border-white/5">
        <div className="mx-auto max-w-lg px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-8 h-8 rounded-lg bg-[var(--emerald)] flex items-center justify-center">
                <span className="font-mono font-bold text-sm text-black">L</span>
              </div>
              {actionNeededCount > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[var(--urgent)] border-2 border-[var(--background)] flex items-center justify-center">
                  <span className="text-[10px] font-bold text-white">{actionNeededCount}</span>
                </div>
              )}
            </div>
            <h1 className="text-lg font-semibold">Ledgr</h1>
          </div>

          <button className="w-9 h-9 rounded-full bg-[var(--surface)] hover:bg-[var(--surface-elevated)] flex items-center justify-center">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[var(--emerald)] to-[var(--doc)] flex items-center justify-center text-xs font-semibold text-black">
              A
            </div>
          </button>
        </div>
      </header>

      {/* Filters */}
      <TaskFilters activeFilter={filter} onFilterChange={setFilter} />

      {/* Conversation List */}
      <main className="mx-auto max-w-lg px-4 pb-24">
        {loading ? (
          <div className="text-center py-16">
            <div className="w-12 h-12 mx-auto rounded-full border-2 border-[var(--emerald)] border-t-transparent animate-spin mb-4" />
            <p className="text-[var(--foreground-muted)]">Loading conversations...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-[var(--urgent)]/10 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-[var(--urgent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-[var(--urgent)] font-medium mb-2">Failed to load conversations</p>
            <p className="text-[var(--foreground-muted)] text-sm">{error}</p>
            <button
              onClick={loadConversations}
              className="mt-4 px-4 py-2 rounded-lg bg-[var(--emerald)] text-black font-medium hover:opacity-90"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-3 mt-4">
              {filteredConversations.map((conversation, index) => (
                <ConversationCard
                  key={conversation.id}
                  conversation={conversation}
                  index={index}
                  onClick={() => {
                    // TODO: Navigate to conversation view
                    console.log('Open conversation:', conversation.id)
                  }}
                />
              ))}
            </div>

            {filteredConversations.length === 0 && (
              <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-[var(--surface)] flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-[var(--foreground-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                  </svg>
                </div>
                <p className="text-[var(--foreground-muted)]">
                  {conversations.length === 0 ? 'No conversations yet. Send a WhatsApp message to get started!' : `No ${filter} conversations`}
                </p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
