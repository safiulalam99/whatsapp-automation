'use client'

import { useState } from 'react'
import { TaskCard } from '@/components/task-card'
import { TaskFilters } from '@/components/task-filters'

// Mock data for now - will replace with real Supabase data
const mockTasks = [
  {
    id: '1',
    client_name: 'Ahmed Al-Mansoori',
    wa_number: '971501234567',
    type: 'invoice' as const,
    urgency: 'high' as const,
    status: 'pending' as const,
    summary: 'Requesting invoice for December 2024 consulting services',
    created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 mins ago
    entities: { amount: 12500, currency: 'AED' },
  },
  {
    id: '2',
    client_name: 'Sara Marketing LLC',
    wa_number: '971509876543',
    type: 'vat_query' as const,
    urgency: 'urgent' as const,
    status: 'pending' as const,
    summary: 'Urgent: VAT return deadline tomorrow, need Q4 summary',
    created_at: new Date(Date.now() - 1000 * 60 * 12).toISOString(), // 12 mins ago
    entities: {},
  },
  {
    id: '3',
    client_name: 'محمد التميمي',
    wa_number: '971505551234',
    type: 'doc_request' as const,
    urgency: 'normal' as const,
    status: 'in_progress' as const,
    summary: 'Requesting trade license renewal documents',
    created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 mins ago
    entities: { document_type: 'Trade License' },
  },
  {
    id: '4',
    client_name: 'Khalid Real Estate',
    wa_number: '971504445678',
    type: 'payment' as const,
    urgency: 'low' as const,
    status: 'done' as const,
    summary: 'Payment confirmation for monthly bookkeeping services',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    entities: { amount: 3000, currency: 'AED' },
  },
]

type FilterStatus = 'all' | 'pending' | 'in_progress' | 'done'

export default function DashboardPage() {
  const [filter, setFilter] = useState<FilterStatus>('all')
  const [unreadCount] = useState(3)

  const filteredTasks = mockTasks.filter((task) => {
    if (filter === 'all') return true
    return task.status === filter
  })

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
              {unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[var(--urgent)] border-2 border-[var(--background)] flex items-center justify-center">
                  <span className="text-[10px] font-bold text-white">{unreadCount}</span>
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

      {/* Task List */}
      <main className="mx-auto max-w-lg px-4 pb-24">
        <div className="flex flex-col gap-3 mt-4">
          {filteredTasks.map((task, index) => (
            <TaskCard key={task.id} task={task} index={index} />
          ))}
        </div>

        {filteredTasks.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-[var(--surface)] flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-[var(--foreground-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-[var(--foreground-muted)]">No {filter !== 'all' ? filter : ''} tasks</p>
          </div>
        )}
      </main>
    </div>
  )
}
