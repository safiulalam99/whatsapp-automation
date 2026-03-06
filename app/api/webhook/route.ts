import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { extractTask } from '@/lib/ai'
import { WhapiWebhookPayload, extractWANumber } from '@/lib/whapi'

/**
 * Whapi Webhook Endpoint
 *
 * Receives incoming WhatsApp messages from Whapi.Cloud
 * Flow:
 * 1. Validate webhook (can add signature validation later)
 * 2. Extract message details
 * 3. Run AI extraction
 * 4. Save to Supabase if task should be created
 * 5. Always return 200 to prevent retries
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
        console.log(`⏭️ Skipping ${message.type} message`)
        continue
      }

      const waNumber = extractWANumber(message.from)
      const messageBody = message.text.body
      const clientName = message.from_name || waNumber

      console.log(`📱 Processing message from ${clientName} (${waNumber})`)
      console.log(`💬 Message: "${messageBody}"`)

      // Run AI extraction
      console.log('🤖 Running AI extraction...')
      const extracted = await extractTask(messageBody, clientName)
      console.log('✨ AI Result:', JSON.stringify(extracted, null, 2))

      // Skip if AI says don't create task
      if (!extracted.should_create_task) {
        console.log('⏭️ AI determined this is not actionable - skipping task creation')
        continue
      }

      // For now, we'll use a hardcoded tenant_id for testing
      // In production, you'd look this up based on the Whapi channel
      const DEMO_TENANT_ID = '00000000-0000-0000-0000-000000000000'

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

      // 2. Save message
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

      // 3. Create task
      const { data: task, error: taskError } = await supabase
        .from('tasks')
        .insert({
          tenant_id: DEMO_TENANT_ID,
          client_id: client.id,
          message_id: savedMessage.id,
          type: extracted.type,
          status: 'pending',
          urgency: extracted.urgency,
          summary: extracted.summary,
          entities: extracted.entities,
          reply_draft: extracted.reply_draft,
        })
        .select()
        .single()

      if (taskError) {
        console.error('❌ Error creating task:', taskError)
        continue
      }

      console.log('✅ Task created:', task.id)
      console.log(`📋 Summary: ${task.summary}`)
      console.log(`🔥 Urgency: ${task.urgency}`)
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
