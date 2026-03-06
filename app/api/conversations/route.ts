import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

/**
 * Get all conversations (people who messaged)
 * Uses service role to bypass RLS for MVP (no auth yet)
 */
export async function GET() {
  try {
    const supabase = createServerClient()
    const DEMO_TENANT_ID = '00000000-0000-0000-0000-000000000000'

    const { data: clients, error } = await supabase
      .from('clients')
      .select(`
        id,
        wa_number,
        display_name,
        conversation_summary,
        conversation_status,
        last_message_at,
        needs_action,
        urgency,
        message_count
      `)
      .eq('tenant_id', DEMO_TENANT_ID)
      .order('last_message_at', { ascending: false, nullsFirst: false })

    if (error) {
      console.error('Error fetching conversations:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ conversations: clients || [] })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    )
  }
}
