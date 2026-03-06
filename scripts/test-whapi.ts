/**
 * Test script for Whapi.Cloud integration
 *
 * Usage:
 *   1. Add WHAPI_TOKEN to .env.local
 *   2. Run: npx tsx scripts/test-whapi.ts <phone_number> "<message>"
 *
 * Example:
 *   npx tsx scripts/test-whapi.ts 971501234567 "Hello from Ledgr test!"
 */

import { config } from 'dotenv'
import { resolve } from 'path'
import { sendMessage } from '../lib/whapi'

// Load .env.local
config({ path: resolve(process.cwd(), '.env.local') })

async function main() {
  const args = process.argv.slice(2)

  if (args.length < 2) {
    console.error('❌ Usage: npx tsx scripts/test-whapi.ts <phone_number> "<message>"')
    console.error('   Example: npx tsx scripts/test-whapi.ts 971501234567 "Test message"')
    process.exit(1)
  }

  const [phoneNumber, message] = args

  console.log('🧪 Testing Whapi integration...')
  console.log(`📱 To: ${phoneNumber}`)
  console.log(`💬 Message: "${message}"`)
  console.log('')

  // Check if token is configured
  if (!process.env.WHAPI_TOKEN) {
    console.error('❌ WHAPI_TOKEN is not set in .env.local')
    console.error('   Add it to test the integration')
    process.exit(1)
  }

  console.log('🚀 Sending message...')

  try {
    const result = await sendMessage(phoneNumber, message, 2)

    if (result.success) {
      console.log('✅ Message sent successfully!')
      console.log(`📬 Message ID: ${result.messageId}`)
    } else {
      console.error('❌ Failed to send message')
      console.error(`   Error: ${result.error}`)
      process.exit(1)
    }
  } catch (error) {
    console.error('❌ Unexpected error:', error)
    process.exit(1)
  }
}

main()
