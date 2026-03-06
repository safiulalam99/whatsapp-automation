'use client'

type FilterStatus = 'all' | 'pending' | 'in_progress' | 'done'

interface TaskFiltersProps {
  activeFilter: FilterStatus
  onFilterChange: (filter: FilterStatus) => void
}

const filters: { label: string; value: FilterStatus }[] = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Done', value: 'done' },
]

export function TaskFilters({ activeFilter, onFilterChange }: TaskFiltersProps) {
  return (
    <div className="sticky top-16 z-40 backdrop-blur-xl bg-[var(--background)]/80 border-b border-white/5">
      <div className="mx-auto max-w-lg px-4 py-3">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {filters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => onFilterChange(filter.value)}
              className={`
                px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap
                transition-all duration-200
                ${
                  activeFilter === filter.value
                    ? 'bg-[var(--emerald)] text-black shadow-lg shadow-[var(--emerald-glow)]'
                    : 'bg-[var(--surface)] text-[var(--foreground-muted)] hover:bg-[var(--surface-elevated)] hover:text-[var(--foreground)]'
                }
              `}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
