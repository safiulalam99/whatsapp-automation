'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { TaskCard } from '@/components/task-card'
import { TaskFilters } from '@/components/task-filters'

type TaskType = 'invoice' | 'vat_query' | 'doc_request' | 'payment' | 'general' | 'ignore'
type TaskUrgency = 'low' | 'normal' | 'high' | 'urgent'
type TaskStatus = 'pending' | 'in_progress' | 'done' | 'snoozed'
type FilterStatus = 'all' | 'pending' | 'in_progress' | 'done'

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

export default function DashboardPage() {
  const [filter, setFilter] = useState<FilterStatus>('all')
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadTasks()
  }, [])

  async function loadTasks() {
    try {
      const supabase = createClient()

      // Fetch tasks with client info
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          id,
          type,
          status,
          urgency,
          summary,
          entities,
          created_at,
          clients (
            wa_number,
            display_name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) {
        console.error('Error loading tasks:', error)
        setError(error.message)
        return
      }

      // Transform data to match Task interface
      const transformedTasks: Task[] = (data || []).map((task: any) => ({
        id: task.id,
        client_name: task.clients?.display_name || task.clients?.wa_number || 'Unknown',
        wa_number: task.clients?.wa_number || '',
        type: task.type,
        urgency: task.urgency,
        status: task.status,
        summary: task.summary || 'No summary',
        created_at: task.created_at,
        entities: task.entities || {},
      }))

      setTasks(transformedTasks)
    } catch (err) {
      console.error('Unexpected error:', err)
      setError('Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'all') return true
    return task.status === filter
  })

  const unreadCount = tasks.filter(t => t.status === 'pending').length

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
        {loading ? (
          <div className="text-center py-16">
            <div className="w-12 h-12 mx-auto rounded-full border-2 border-[var(--emerald)] border-t-transparent animate-spin mb-4" />
            <p className="text-[var(--foreground-muted)]">Loading tasks...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-[var(--urgent)]/10 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-[var(--urgent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-[var(--urgent)] font-medium mb-2">Failed to load tasks</p>
            <p className="text-[var(--foreground-muted)] text-sm">{error}</p>
            <button
              onClick={loadTasks}
              className="mt-4 px-4 py-2 rounded-lg bg-[var(--emerald)] text-black font-medium hover:opacity-90"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
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
                <p className="text-[var(--foreground-muted)]">
                  {tasks.length === 0 ? 'No tasks yet. Send a WhatsApp message to get started!' : `No ${filter} tasks`}
                </p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
