/**
 * Test script for AI task extraction
 *
 * Run with: npx tsx scripts/test-ai.ts
 */

// Load environment variables from .env.local BEFORE importing modules
import { config } from 'dotenv'
import { resolve } from 'path'

// Load env first
const result = config({ path: resolve(process.cwd(), '.env.local') })

// Verify it loaded
if (!process.env.OPENROUTER_API_KEY) {
  console.error('Failed to load OPENROUTER_API_KEY from .env.local')
  console.error('Loaded env vars:', Object.keys(process.env).filter(k => k.includes('OPENROUTER')))
  process.exit(1)
}

// Now import the module
import { extractTask, extractTasksBatch } from '../lib/ai'

// Test messages covering different scenarios
const testMessages = [
  {
    name: 'English invoice request',
    text: 'Hi can you send me the invoice for last month',
  },
  {
    name: 'Arabic invoice request',
    text: 'السلام عليكم، ممكن الفاتورة؟',
  },
  {
    name: 'Casual acknowledgment',
    text: 'ok thanks see you tomorrow',
  },
  {
    name: 'Urgent request',
    text: 'URGENT - client needs tax cert by tomorrow morning!!',
  },
  {
    name: 'Arabic problem report',
    text: 'مرحبا، عندي مشكلة مع الحساب',
  },
  {
    name: 'Mixed language invoice',
    text: 'مرحبا ممكن invoice من فضلك',
  },
  {
    name: 'Payment query',
    text: 'Did you receive my payment of AED 5000?',
  },
  {
    name: 'VAT certificate request',
    text: 'I need the VAT certificate for Q4 2024',
  },
  {
    name: 'Simple greeting',
    text: 'Hey how are you',
  },
  {
    name: 'Document request with deadline',
    text: 'Can I get the contract by end of this week please',
  },
]

/**
 * Format entity object for display
 */
function formatEntities(entities: any): string {
  const keys = Object.keys(entities)
  if (keys.length === 0) return '(none)'

  return keys
    .map(key => {
      const value = entities[key]
      return `${key}: ${JSON.stringify(value)}`
    })
    .join(', ')
}

/**
 * Run individual tests
 */
async function runIndividualTests() {
  console.log('=' .repeat(80))
  console.log('INDIVIDUAL MESSAGE TESTS')
  console.log('='.repeat(80))
  console.log()

  for (const test of testMessages) {
    console.log(`📝 Test: ${test.name}`)
    console.log(`   Input: "${test.text}"`)
    console.log()

    try {
      const result = await extractTask(test.text)

      console.log(`   ✓ Extracted successfully`)
      console.log(`     - Create Task: ${result.should_create_task ? 'YES' : 'NO'}`)
      console.log(`     - Type: ${result.type}`)
      console.log(`     - Urgency: ${result.urgency}`)
      console.log(`     - Summary: ${result.summary}`)
      console.log(`     - Entities: ${formatEntities(result.entities)}`)
      console.log(`     - Reply: "${result.reply_draft}"`)
      console.log()

    } catch (error) {
      console.error(`   ✗ Failed:`, error instanceof Error ? error.message : error)
      console.log()
    }

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500))
  }
}

/**
 * Run batch test
 */
async function runBatchTest() {
  console.log('=' .repeat(80))
  console.log('BATCH PROCESSING TEST')
  console.log('='.repeat(80))
  console.log()

  const messages = testMessages.map(t => t.text)
  console.log(`Processing ${messages.length} messages in batch...`)
  console.log()

  try {
    const results = await extractTasksBatch(messages)

    console.log(`✓ Batch completed: ${results.length} results`)
    console.log()

    // Summary statistics
    const stats = {
      total: results.length,
      tasks_created: results.filter(r => r.should_create_task).length,
      ignored: results.filter(r => !r.should_create_task).length,
      by_type: {} as Record<string, number>,
      by_urgency: {} as Record<string, number>,
    }

    results.forEach(r => {
      stats.by_type[r.type] = (stats.by_type[r.type] || 0) + 1
      stats.by_urgency[r.urgency] = (stats.by_urgency[r.urgency] || 0) + 1
    })

    console.log('Summary Statistics:')
    console.log(`  Total messages: ${stats.total}`)
    console.log(`  Tasks created: ${stats.tasks_created}`)
    console.log(`  Ignored: ${stats.ignored}`)
    console.log()
    console.log('  By Type:')
    Object.entries(stats.by_type).forEach(([type, count]) => {
      console.log(`    - ${type}: ${count}`)
    })
    console.log()
    console.log('  By Urgency:')
    Object.entries(stats.by_urgency).forEach(([urgency, count]) => {
      console.log(`    - ${urgency}: ${count}`)
    })
    console.log()

  } catch (error) {
    console.error('✗ Batch processing failed:', error)
    console.log()
  }
}

/**
 * Main test runner
 */
async function main() {
  console.log('\n')
  console.log('╔════════════════════════════════════════════════════════════════════════════╗')
  console.log('║                    LEDGR AI EXTRACTION SYSTEM TEST                         ║')
  console.log('╚════════════════════════════════════════════════════════════════════════════╝')
  console.log('\n')

  // Check if API key is configured
  if (!process.env.OPENROUTER_API_KEY) {
    console.error('❌ ERROR: OPENROUTER_API_KEY not found in environment')
    console.error('   Please set it in .env.local file')
    process.exit(1)
  }

  console.log('✓ OpenRouter API key configured')
  console.log('✓ Using model: anthropic/claude-3.5-haiku')
  console.log('\n')

  try {
    // Run individual tests
    await runIndividualTests()

    // Run batch test
    await runBatchTest()

    console.log('='.repeat(80))
    console.log('ALL TESTS COMPLETED')
    console.log('='.repeat(80))
    console.log()

  } catch (error) {
    console.error('Test suite failed:', error)
    process.exit(1)
  }
}

// Run tests
main().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})
