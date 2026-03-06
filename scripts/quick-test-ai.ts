/**
 * Quick single-message test for AI extraction
 *
 * Run with: npx tsx scripts/quick-test-ai.ts "Your message here"
 */

import { config } from 'dotenv'
import { resolve } from 'path'

// Load env
config({ path: resolve(process.cwd(), '.env.local') })

import { extractTask } from '../lib/ai'

async function main() {
  const message = process.argv[2]

  if (!message) {
    console.error('Usage: npx tsx scripts/quick-test-ai.ts "Your message here"')
    process.exit(1)
  }

  console.log('\nAnalyzing message:', message)
  console.log('='.repeat(80))

  const result = await extractTask(message)

  console.log('\nResult:')
  console.log(JSON.stringify(result, null, 2))
  console.log('\n')
}

main().catch(console.error)
