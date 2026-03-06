import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { generateConversationSummary } from '@/lib/ai'
import { WhapiWebhookPayload, extractWANumber } from '@/lib/whapi'

/**
 * Whapi Webhook Endpoint
 *
 * Receives incoming WhatsApp messages from Whapi.Cloud
 * Flow:
 * 1. Validate webhook (can add signature validation later)
 * 2. Extract message details
 * 3. Save ALL messages (including casual ones)
 * 4. Generate conversation summary per client using AI
 * 5. Update client record with summary, status, urgency
 * 6. Create follow-up reminders if needed
 * 7. Always return 200 to prevent retries
 */
export async function POST(request: NextRequest) {
  console.log('🔔 Webhook received')

  try {
    // Parse webhook payload
    const payload: WhapiWebhookPayload = await request.json()
    console.log('📦 Payload:', JSON.stringify(payload, null, 2))

    // Extract messages
    const messages = payload.messages || []

    if (messages.length === 0) {
      console.log('⚠️ No messages in payload')
      return NextResponse.json({ success: true, message: 'No messages to process' })
    }

    const supabase = createServerClient()

    // Process each message
    for (const message of messages) {
      // Skip outbound messages (sent by us)
      if (message.from_me) {
        console.log('⏭️ Skipping outbound message')
        continue
      }

      // Skip non-text messages for now (can handle later)
      if (message.type !== 'text' || !message.text?.body) {
        console.log(`⏭️ Skipping ${message.type} message (no text body)`)
        continue
      }

      // Skip empty or placeholder messages
      if (message.text.body.trim() === '' || message.text.body === '...') {
        console.log('⏭️ Skipping empty/placeholder message')
        continue
      }

      const waNumber = extractWANumber(message.from)
      const messageBody = message.text.body
      const clientName = message.from_name || waNumber

      console.log(`📱 Processing message from ${clientName} (${waNumber})`)
      console.log(`💬 Message: "${messageBody}"`)

      // For now, we'll use a hardcoded tenant_id for testing
      // In production, you'd look this up based on the Whapi channel
      const DEMO_TENANT_ID = '00000000-0000-0000-0000-000000000000'

      // 0. Ensure demo tenant exists (bypass RLS with service role key)
      const { data: existingTenant } = await supabase
        .from('tenants')
        .select('id')
        .eq('id', DEMO_TENANT_ID)
        .single()

      if (!existingTenant) {
        console.log('🔧 Creating demo tenant...')
        const { error: tenantError } = await supabase
          .from('tenants')
          .insert({
            id: DEMO_TENANT_ID,
            user_id: null, // Allow null for demo tenant
            wa_number: 'demo',
            plan: 'starter',
          })

        if (tenantError) {
          console.error('❌ Error creating tenant:', tenantError)
          continue
        }
        console.log('✅ Demo tenant created')
      }

      // 1. Upsert client
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .upsert(
          {
            tenant_id: DEMO_TENANT_ID,
            wa_number: waNumber,
            display_name: clientName,
          },
          {
            onConflict: 'tenant_id,wa_number',
            ignoreDuplicates: false,
          }
        )
        .select()
        .single()

      if (clientError) {
        console.error('❌ Error upserting client:', clientError)
        continue
      }

      console.log('✅ Client upserted:', client.id)

      // 2. Save message (ALL messages, including casual ones)
      const { data: savedMessage, error: messageError } = await supabase
        .from('messages')
        .insert({
          tenant_id: DEMO_TENANT_ID,
          client_id: client.id,
          direction: 'in',
          body: messageBody,
          raw_payload: message as any,
        })
        .select()
        .single()

      if (messageError) {
        console.error('❌ Error saving message:', messageError)
        continue
      }

      console.log('✅ Message saved:', savedMessage.id)

      // 3. Fetch ALL messages for this client to generate conversation summary
      const { data: allMessages, error: fetchError } = await supabase
        .from('messages')
        .select('body, direction, created_at')
        .eq('client_id', client.id)
        .order('created_at', { ascending: true })

      if (fetchError) {
        console.error('❌ Error fetching messages:', fetchError)
        continue
      }

      // Filter out null bodies and cast direction properly
      const validMessages = (allMessages || [])
        .filter((msg): msg is { body: string; direction: string; created_at: string } =>
          msg.body !== null && msg.body.trim() !== ''
        )
        .map(msg => ({
          body: msg.body,
          direction: msg.direction as 'in' | 'out',
          created_at: msg.created_at
        }))

      console.log(`📚 Generating conversation summary from ${validMessages.length} messages...`)

      // 4. Generate conversation summary using AI
      const conversationSummary = await generateConversationSummary(validMessages)
      console.log('✨ Conversation Summary:', JSON.stringify(conversationSummary, null, 2))

      // 5. Update client record with conversation data
      const { error: updateError } = await supabase
        .from('clients')
        .update({
          conversation_summary: conversationSummary.summary,
          conversation_status: conversationSummary.conversation_status,
          last_message_at: new Date().toISOString(),
          needs_action: conversationSummary.needs_action,
          urgency: conversationSummary.urgency,
          message_count: validMessages.length,
        })
        .eq('id', client.id)

      if (updateError) {
        console.error('❌ Error updating client:', updateError)
        continue
      }

      console.log('✅ Client updated with conversation summary')

      // 6. Create follow-up reminder if needed
      if (conversationSummary.follow_up_needed && conversationSummary.follow_up_message) {
        const dueDate = conversationSummary.follow_up_date
          ? new Date(conversationSummary.follow_up_date)
          : new Date(Date.now() + 24 * 60 * 60 * 1000) // Default: 24 hours from now

        const { data: followUp, error: followUpError } = await supabase
          .from('follow_ups')
          .insert({
            tenant_id: DEMO_TENANT_ID,
            client_id: client.id,
            message: conversationSummary.follow_up_message,
            due_date: dueDate.toISOString(),
            status: 'pending',
          })
          .select()
          .single()

        if (followUpError) {
          console.error('❌ Error creating follow-up:', followUpError)
        } else {
          console.log('✅ Follow-up reminder created:', followUp.id)
          console.log(`📅 Due: ${dueDate.toLocaleString()}`)
        }
      }
    }

    // Always return 200 to prevent Whapi retries
    return NextResponse.json({
      success: true,
      processed: messages.length
    })

  } catch (error) {
    console.error('❌ Webhook error:', error)

    // Still return 200 to prevent retries
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

// GET endpoint for testing
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Ledgr webhook endpoint is running',
    timestamp: new Date().toISOString()
  })
}
