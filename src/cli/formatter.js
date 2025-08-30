import path from 'path'
import { hasSignificantHazards, getTotalHazardCount } from '../core/hazards.js'

/**
 * Format and display processing results
 * @param {Object} result - Processing result from processFiles
 * @param {Object} options - CLI options
 */
export function formatResults(result, options) {
  const { stats, hazards, results } = result
  
  // Show processing progress 
  console.log('⏳ Processing completed\n')
  console.log(`🤖→👤 Human Touch - Processing ${stats.total} HTML files...`)
  
  // Main summary
  console.log('📊 SUMMARY:')
  console.log(`✅ Processed: ${stats.processed}/${stats.total}`)
  console.log(`🔄 Modified: ${stats.changed}`)
  console.log(`✏️  Total changes: ${stats.totalChanges}`)
  console.log(`❌ Errors: ${stats.errors}`)
  
  // Show hazards if found
  const totalHazardCount = getTotalHazardCount(hazards)
  if (totalHazardCount > 0) {
    console.log('\n🚨 HAZARDS DETECTED:')
    if (hazards.invisibles_bidi > 0) {
      console.log(`  🔍 Invisible/bidirectional chars: ${hazards.invisibles_bidi}`)
    }
    if (hazards.smart_quotes_attrs > 0) {
      console.log(`  📝 Smart quotes in attributes: ${hazards.smart_quotes_attrs}`)
    }
    if (hazards.consecutive_nbsp > 0) {
      console.log(`  🔗 Consecutive &nbsp; entities: ${hazards.consecutive_nbsp}`)
    }
  }
  
  // Show backup info
  if (options.createBackup && stats.changed > 0 && !options.dryRun) {
    console.log(`💾 Backups created: ${stats.changed} files (.bak)`)
  }
  
  // Show next steps for dry run
  if (options.dryRun && stats.changed > 0) {
    console.log('\n💡 To apply changes:')
    const cmd = `human-touch${options.aggressive ? ' --aggressive' : ''}`
    console.log(`   ${cmd}`)
  }
  
  // Show errors if any
  if (stats.errors > 0) {
    console.log('\n❌ ERRORS:')
    results.filter(r => r.error).forEach(r => {
      console.log(`  - ${path.basename(r.file)}: ${r.error}`)
    })
  }
  
  // Show detailed file results if requested or if hazards found
  if (process.env.VERBOSE || totalHazardCount > 0) {
    console.log('\n📄 DETAILED RESULTS:')
    results.forEach(r => {
      const filename = path.basename(r.file)
      if (r.error) {
        console.log(`  ❌ ${filename} - ERROR: ${r.error}`)
      } else if (r.changes === 0 && !hasSignificantHazards(r.hazards)) {
        console.log(`  ✅ ${filename} - OK`)
      } else {
        const status = options.dryRun ? 'PREVIEW' : 'MODIFIED'
        const hazardFlag = hasSignificantHazards(r.hazards) ? ' ⚠️ HAZARDS' : ''
        console.log(`  ✅ ${filename} - ${status} (${r.changes} changes)${hazardFlag}`)
      }
    })
  }
}

/**
 * Format processing progress (called during processing)
 * @param {Object} result - Single file processing result
 * @param {number} current - Current file number
 * @param {number} total - Total files to process
 */
export function formatProgress(result, current, total) {
  const progress = `[${current}/${total}]`
  const filename = path.basename(result.file)
  
  if (result.error) {
    console.log(`${progress} ❌ ERROR: ${filename} - ${result.error}`)
  } else if (result.changes === 0 && !hasSignificantHazards(result.hazards)) {
    console.log(`${progress} ✅ OK: ${filename}`)
  } else {
    const status = result.dryRun ? 'PREVIEW' : 'MODIFIED'
    const hazardFlag = hasSignificantHazards(result.hazards) ? ' ⚠️ HAZARDS' : ''
    console.log(`${progress} ✅ ${status}: ${filename} (${result.changes} changes)${hazardFlag}`)
  }
}