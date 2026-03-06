/**
 * Whapi.Cloud API Integration
 *
 * Base URL: https://gate.whapi.cloud
 * Auth: Bearer token in Authorization header
 *
 * Key endpoints:
 * - POST /messages/text - Send text message
 * - Webhooks receive messages on configured URL
 */

const WHAPI_BASE_URL = 'https://gate.whapi.cloud'

/**
 * Whapi webhook payload structure (incoming messages)
 */
export interface WhapiWebhookPayload {
  messages: WhapiMessage[]
  event: {
    type: string
    event: 'post' | 'put'
  }
  channel_id: string
}

export interface WhapiMessage {
  id: string
  from_me: boolean
  type: 'text' | 'voice' | 'image' | 'document' | 'video' | 'audio' | 'sticker'
  chat_id: string
  timestamp: number
  source: 'mobile' | 'web'
  from: string           // Sender WA number (e.g., "971501234567")
  from_name?: string
  text?: {
    body: string
  }
  voice?: {
    id: string
    link: string
    seconds: number
  }
  image?: {
    id: string
    link: string
    caption?: string
  }
  document?: {
    id: string
    link: string
    filename?: string
  }
}

/**
 * Send a text message via Whapi
 *
 * @param to - WhatsApp number in international format without + (e.g., "971501234567")
 * @param body - Message text
 * @param typingTime - Optional: simulate typing delay in seconds (0-10)
 * @returns Response with message ID
 */
export async function sendMessage(
  to: string,
  body: string,
  typingTime: number = 0
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const token = process.env.WHAPI_TOKEN

  if (!token) {
    throw new Error('WHAPI_TOKEN is not configured')
  }

  try {
    const response = await fetch(`${WHAPI_BASE_URL}/messages/text`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        to,
        body,
        typing_time: typingTime,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Whapi send message failed:', error)
      return {
        success: false,
        error: `Whapi API error: ${response.status} ${error}`,
      }
    }

    const data = await response.json()

    return {
      success: true,
      messageId: data.id || data.message_id,
    }
  } catch (error) {
    console.error('Failed to send Whapi message:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Extract clean WhatsApp number from Whapi format
 *
 * @param from - Whapi format (e.g., "971501234567@s.whatsapp.net")
 * @returns Clean number (e.g., "971501234567")
 */
export function extractWANumber(from: string): string {
  return from.split('@')[0]
}

/**
 * Validate Whapi webhook signature
 *
 * @param payload - Raw webhook payload
 * @param signature - Signature from webhook header
 * @returns true if signature is valid
 */
export async function validateWebhookSignature(
  payload: string,
  signature: string
): Promise<boolean> {
  const secret = process.env.WHAPI_WEBHOOK_SECRET

  if (!secret) {
    console.warn('WHAPI_WEBHOOK_SECRET not configured - skipping signature validation')
    return true // Allow in development
  }

  try {
    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )

    const signatureBuffer = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(payload)
    )

    const computedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')

    return computedSignature === signature
  } catch (error) {
    console.error('Webhook signature validation error:', error)
    return false
  }
}
