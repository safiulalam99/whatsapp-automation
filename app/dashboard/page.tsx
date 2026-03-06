'use client'

/**
 * Ledgr Dashboard - Minimal Placeholder
 *
 * All old UI components have been deleted.
 * Waiting for proper design mockups before rebuilding.
 *
 * Backend functionality (webhook, AI, database) is intact and working.
 */

export default function DashboardPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
      <div className="text-center px-8 max-w-md">
        {/* Logo */}
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-[var(--emerald)] flex items-center justify-center">
          <span className="text-3xl font-bold text-white">L</span>
        </div>

        {/* Status */}
        <h1 className="text-display mb-4">Ledgr</h1>
        <p className="text-body text-[var(--text-secondary)] mb-8">
          UI is being redesigned from scratch.
          <br />
          Backend is working perfectly.
        </p>

        {/* Info */}
        <div className="surface rounded-xl p-6 text-left space-y-4">
          <div>
            <p className="text-caption uppercase text-[var(--text-tertiary)] mb-1">Status</p>
            <p className="text-body">
              ✅ Webhook receiving messages
              <br />
              ✅ AI processing & summarization
              <br />
              ✅ Database saving conversations
              <br />
              🎨 UI rebuilding with proper design
            </p>
          </div>

          <div>
            <p className="text-caption uppercase text-[var(--text-tertiary)] mb-1">Next</p>
            <p className="text-body">
              Creating design mockups based on FUNCTIONAL_SPEC.md
            </p>
          </div>
        </div>

        {/* API Health Check */}
        <a
          href="/api/conversations"
          target="_blank"
          className="inline-block mt-6 px-6 py-3 rounded-xl bg-[var(--emerald)] hover:bg-[var(--emerald-hover)] text-white font-medium transition-colors"
        >
          View API Data (Test)
        </a>
      </div>
    </div>
  )
}
