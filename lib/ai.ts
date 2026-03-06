/**
 * AI Task Extraction using OpenRouter API
 *
 * Uses Claude 3.5 Haiku to analyze WhatsApp messages and extract:
 * - Business intent vs casual conversation
 * - Task type (invoice, vat_query, doc_request, payment, general, ignore)
 * - Urgency level
 * - Extracted entities (amounts, dates, references)
 * - Suggested reply in same language
 *
 * Handles English, Arabic, and transliterated/mixed text.
 */

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1'
// Claude 3.5 Haiku model ID for OpenRouter
const MODEL = 'anthropic/claude-3.5-haiku'

/**
 * Get OpenRouter API key from environment
 * Evaluated lazily to allow env vars to be set after module load
 */
function getApiKey(): string | undefined {
  return process.env.OPENROUTER_API_KEY
}

/**
 * Extracted task data structure
 */
export interface ExtractedTask {
  should_create_task: boolean
  type: 'invoice' | 'vat_query' | 'doc_request' | 'payment' | 'general' | 'ignore'
  urgency: 'low' | 'normal' | 'high' | 'urgent'
  summary: string
  entities: {
    amount?: number
    currency?: string
    invoice_ref?: string
    due_date?: string
    document_type?: string
    [key: string]: any
  }
  reply_draft: string
}

/**
 * System prompt that enforces JSON-only responses and defines extraction rules
 */
const SYSTEM_PROMPT = `You are an AI assistant for Ledgr, an accounting/bookkeeping WhatsApp bot.

Your job is to analyze incoming WhatsApp messages and determine:
1. Is this a business request that needs action, or casual conversation?
2. If business, what type of task and how urgent?
3. What entities (amounts, dates, references) are mentioned?
4. What would be an appropriate reply?

CRITICAL: You must ONLY respond with valid JSON. No markdown, no explanations, just raw JSON.

TASK TYPES:
- invoice: Request for invoice, bill, or receipt
- vat_query: Questions about VAT, tax certificates, tax returns
- doc_request: Request for other documents (contracts, statements, reports)
- payment: Payment confirmations, payment issues, requesting payment info
- general: Other business queries (account questions, service requests)
- ignore: Casual conversation with no action needed

URGENCY LEVELS:
- urgent: Words like "URGENT", "ASAP", "immediately", "emergency", "today", "now"
- high: "soon", "tomorrow", "this week", "needed by [specific date]"
- normal: General requests without time pressure
- low: "when you can", "no rush", future inquiries

CASUAL MESSAGE INDICATORS (should_create_task: false):
- Greetings: "hi", "hello", "hey", "سلام", "مرحبا", "صباح الخير"
- Thanks: "thanks", "thank you", "شكرا", "thx"
- Acknowledgments: "ok", "okay", "got it", "تمام", "ماشي", "حاضر"
- Social: "how are you", "see you", "talk later", "كيف حالك"
- Short responses without context: single words or emojis

However, if a greeting is followed by a business request, treat as business.

LANGUAGE HANDLING:
- Detect language of input (English, Arabic, mixed/transliterated)
- reply_draft should be in the SAME language as input
- summary should always be in English
- Handle Arabic numerals (٠-٩) and Latin numerals (0-9)
- Handle mixed scripts (e.g., "ممكن invoice من فضلك")

ENTITY EXTRACTION:
- amount: Extract numbers mentioned in financial context
- currency: AED, USD, SAR, etc. Default to AED if in UAE context
- invoice_ref: Invoice numbers, reference codes
- due_date: Any mentioned dates or deadlines
- document_type: Type of document requested

IMPORTANT: In the entities object, ONLY include fields that have actual values. Do NOT include fields with null or undefined values. Omit them completely from the JSON.

REPLY DRAFT GUIDELINES:
- Professional but friendly tone
- In same language as input
- For tasks: Acknowledge and set expectation
- For casual: Brief, friendly response
- If unclear request: Ask for clarification

OUTPUT FORMAT (JSON only, no markdown):
{
  "should_create_task": boolean,
  "type": "invoice" | "vat_query" | "doc_request" | "payment" | "general" | "ignore",
  "urgency": "low" | "normal" | "high" | "urgent",
  "summary": "One sentence in English describing the request",
  "entities": {
    // Only include fields with actual values, omit fields with no data
    "amount": 5000,
    "currency": "AED",
    "document_type": "invoice"
    // Do NOT include: "invoice_ref": null or "due_date": undefined
  },
  "reply_draft": "Suggested reply in same language as input"
}

Example - invoice request with amount:
{"should_create_task":true,"type":"invoice","urgency":"normal","summary":"Customer requesting invoice","entities":{"amount":1000,"currency":"AED","document_type":"invoice"},"reply_draft":"I'll send you the invoice shortly."}

Example - casual greeting:
{"should_create_task":false,"type":"ignore","urgency":"low","summary":"Casual greeting","entities":{},"reply_draft":"Hello! How can I help you?"}`

/**
 * Extract task information from a WhatsApp message
 *
 * @param messageText - The text content of the WhatsApp message
 * @returns ExtractedTask object with analysis results
 * @throws Error if API call fails or response is invalid
 */
export async function extractTask(messageText: string): Promise<ExtractedTask> {
  const apiKey = getApiKey()
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not configured')
  }

  if (!messageText || messageText.trim().length === 0) {
    // Empty message - return ignore task
    return {
      should_create_task: false,
      type: 'ignore',
      urgency: 'low',
      summary: 'Empty message',
      entities: {},
      reply_draft: 'Hi! How can I help you?',
    }
  }

  try {
    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://ledgr.app', // Optional: for rankings
        'X-Title': 'Ledgr WhatsApp Bot', // Optional: for rankings
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT,
          },
          {
            role: 'user',
            content: `Analyze this WhatsApp message:\n\n"${messageText}"`,
          },
        ],
        temperature: 0.3, // Lower temperature for more consistent extraction
        max_tokens: 1000,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('OpenRouter API error:', response.status, errorText)
      throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()

    // Extract the assistant's response
    const content = data.choices?.[0]?.message?.content
    if (!content) {
      throw new Error('No content in OpenRouter response')
    }

    // Parse JSON response
    // Some models might wrap in markdown code blocks, so clean that up
    let jsonText = content.trim()
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '')
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```\s*/, '').replace(/\s*```$/, '')
    }

    const extracted: ExtractedTask = JSON.parse(jsonText)

    // Validate the response structure
    if (typeof extracted.should_create_task !== 'boolean') {
      throw new Error('Invalid response: missing should_create_task')
    }

    const validTypes = ['invoice', 'vat_query', 'doc_request', 'payment', 'general', 'ignore']
    if (!validTypes.includes(extracted.type)) {
      throw new Error(`Invalid response: invalid type "${extracted.type}"`)
    }

    const validUrgencies = ['low', 'normal', 'high', 'urgent']
    if (!validUrgencies.includes(extracted.urgency)) {
      throw new Error(`Invalid response: invalid urgency "${extracted.urgency}"`)
    }

    // Ensure entities object exists
    if (!extracted.entities || typeof extracted.entities !== 'object') {
      extracted.entities = {}
    }

    return extracted

  } catch (error) {
    console.error('Failed to extract task from message:', error)

    // If JSON parsing failed or API error, return a safe fallback
    if (error instanceof SyntaxError) {
      console.error('JSON parsing error, using fallback')
    }

    // Fallback: treat as general business query
    return {
      should_create_task: true,
      type: 'general',
      urgency: 'normal',
      summary: 'Business query requiring review',
      entities: {},
      reply_draft: 'Thank you for your message. We will review it and get back to you shortly.',
    }
  }
}

/**
 * Batch extract tasks from multiple messages
 * Useful for processing message history
 *
 * @param messages - Array of message texts
 * @returns Array of ExtractedTask objects
 */
export async function extractTasksBatch(messages: string[]): Promise<ExtractedTask[]> {
  const results = await Promise.allSettled(
    messages.map(msg => extractTask(msg))
  )

  return results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value
    } else {
      console.error(`Failed to extract task from message ${index}:`, result.reason)
      // Return fallback for failed extractions
      return {
        should_create_task: false,
        type: 'ignore',
        urgency: 'low',
        summary: 'Failed to process message',
        entities: {},
        reply_draft: 'Sorry, I could not process your message. Please try again.',
      }
    }
  })
}
