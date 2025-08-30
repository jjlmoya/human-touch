#!/usr/bin/env node

import { processFiles } from '../utils/file-processor.js'
import { parseArgs, showHelp, showVersion } from './args.js'
import { formatResults } from './formatter.js'

/**
 * Human Touch CLI - Command line interface
 */
async function main() {
  try {
    const options = parseArgs()
    
    if (options.help) {
      showHelp()
      process.exit(0)
    }
    
    if (options.version) {
      showVersion()
      process.exit(0)
    }
    
    // Show startup info
    console.log('🤖→👤 Human Touch - Making AI text human-readable...')
    console.log(`📁 Patterns: ${options.patterns.join(', ')}`)
    console.log(`🔧 Aggressive mode: ${options.aggressive ? 'YES' : 'NO'}`)
    console.log(`💾 Create backups: ${options.createBackup ? 'YES' : 'NO'}`)
    console.log(`⚡ Concurrency: ${options.maxConcurrency}`)
    console.log(`🚨 Fail on hazards: ${options.failOnHazards ? 'YES' : 'NO'}`)
    if (options.dryRun) console.log('🔍 DRY-RUN MODE: Files will not be modified')
    console.log()
    
    // Process files
    const result = await processFiles(options)
    
    // Format and display results
    formatResults(result, options)
    
    // Exit with appropriate code
    if (result.shouldFail) {
      console.log('\n💥 BUILD FAILED: Critical invisible/bidirectional characters found')
      console.log('   These characters can cause security and rendering issues')
      console.log('   Run without --fail-on-hazards to see details and fix')
      process.exit(1)
    }
    
    if (!result.success) {
      process.exit(1)
    }
    
  } catch (error) {
    console.error('💥 Fatal error:', error.message)
    if (process.env.DEBUG) {
      console.error(error.stack)
    }
    process.exit(1)
  }
}

// Run CLI if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}