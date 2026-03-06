'use client'

import { useState, useEffect } from 'react'
import { ConversationCard } from '@/components/conversation-card'
import { Sidebar } from '@/components/sidebar'
import { MobileNav } from '@/components/mobile-nav'

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

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'inbox' | 'campaigns' | 'settings'>('inbox')
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
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

  const needsReplyConversations = conversations.filter(c => c.needs_action)
  const allConversations = conversations.filter(c => !c.needs_action)

  return (
    <div className="lg:flex lg:h-screen lg:overflow-hidden bg-[var(--background)] lg:bg-gray-50">
      {/* Desktop Sidebar */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Inbox List (Middle Column) */}
      <div className="w-full lg:w-96 lg:border-r lg:border-gray-200 lg:bg-white lg:flex lg:flex-col lg:h-screen">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-50 backdrop-blur-xl bg-[var(--background)]/80 border-b border-white/5">
          <div className="px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                  <span className="font-bold text-sm text-white">L</span>
                </div>
                {needsReplyConversations.length > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 border-2 border-[var(--background)] flex items-center justify-center">
                    <span className="text-[10px] font-bold text-white">{needsReplyConversations.length}</span>
                  </div>
                )}
              </div>
              <h1 className="text-lg font-semibold">Ledgr</h1>
            </div>
            <button className="w-9 h-9 rounded-full bg-[var(--surface)] hover:bg-[var(--surface-elevated)] flex items-center justify-center">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center text-xs font-semibold text-white">
                A
              </div>
            </button>
          </div>
        </header>

        {/* Desktop Header */}
        <div className="hidden lg:block p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Inbox</h2>
          <p className="text-sm text-gray-500 mt-1">{conversations.length} conversations</p>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto px-4 pb-20 lg:pb-4 lg:px-0">
          {loading ? (
            <div className="text-center py-16">
              <div className="w-12 h-12 mx-auto rounded-full border-2 border-emerald-500 border-t-transparent animate-spin mb-4" />
              <p className="text-gray-500">Loading conversations...</p>
            </div>
          ) : error ? (
            <div className="text-center py-16 px-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-red-50 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-red-600 font-medium mb-2">Failed to load conversations</p>
              <p className="text-gray-500 text-sm mb-4">{error}</p>
              <button
                onClick={loadConversations}
                className="px-4 py-2 rounded-lg bg-emerald-500 text-white font-medium hover:bg-emerald-600"
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              {/* Needs Reply Section */}
              {needsReplyConversations.length > 0 && (
                <div className="mt-4 lg:px-4">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 lg:text-gray-400">
                    🔔 Needs Reply ({needsReplyConversations.length})
                  </h3>
                  <div className="flex flex-col gap-2">
                    {needsReplyConversations.map((conversation, index) => (
                      <ConversationCard
                        key={conversation.id}
                        conversation={conversation}
                        index={index}
                        isSelected={selectedConversation?.id === conversation.id}
                        onClick={() => setSelectedConversation(conversation)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* All Conversations Section */}
              {allConversations.length > 0 && (
                <div className="mt-6 lg:px-4">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 lg:text-gray-400">
                    💬 All Conversations
                  </h3>
                  <div className="flex flex-col gap-2">
                    {allConversations.map((conversation, index) => (
                      <ConversationCard
                        key={conversation.id}
                        conversation={conversation}
                        index={index + needsReplyConversations.length}
                        isSelected={selectedConversation?.id === conversation.id}
                        onClick={() => setSelectedConversation(conversation)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {conversations.length === 0 && (
                <div className="text-center py-16 px-4">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 lg:text-gray-600">
                    No conversations yet. Send a WhatsApp message to get started!
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Detail Panel (Desktop Only) */}
      <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:bg-white lg:items-center lg:justify-center">
        {selectedConversation ? (
          <div className="w-full h-full p-8">
            <h2 className="text-2xl font-bold text-gray-900">{selectedConversation.display_name || selectedConversation.wa_number}</h2>
            <p className="text-gray-500 text-sm mb-6">+{selectedConversation.wa_number}</p>

            {selectedConversation.conversation_summary && (
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <p className="text-sm font-medium text-gray-700 mb-1">AI Summary</p>
                <p className="text-gray-600">{selectedConversation.conversation_summary}</p>
              </div>
            )}

            <div className="mt-8">
              <p className="text-sm text-gray-500 mb-4">Reply</p>
              <textarea
                className="w-full h-32 p-4 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Type your reply..."
              />
              <div className="flex gap-3 mt-4">
                <button className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl transition-colors">
                  📤 Send Reply
                </button>
                <button className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors">
                  ✓ Mark Done
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center px-8">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-gray-100 flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a conversation</h3>
            <p className="text-gray-500">Choose a conversation from the list to view details and reply</p>
          </div>
        )}
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}
