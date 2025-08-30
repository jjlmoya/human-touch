import fs from 'fs/promises'
import path from 'path'
import { glob } from 'glob'
import pLimit from 'p-limit'
import { normalizeHtml } from '../core/normalizer.js'
import { hasSignificantHazards } from '../core/hazards.js'

/**
 * Default options for file processing
 */
export const DEFAULT_PROCESS_OPTIONS = {
  patterns: ['**/*.html'],
  maxConcurrency: 8,
  createBackup: false,
  aggressive: false,
  dryRun: false,
  failOnHazards: false,
  excludeSelectors: ['script', 'style', 'pre', 'code', '[contenteditable]']
}

/**
 * Processes a single HTML file
 * @param {string} filePath - Path to file to process
 * @param {Object} options - Processing options
 * @returns {Promise<Object>} Processing result
 */
export async function processFile(filePath, options = {}) {
  const config = { ...DEFAULT_PROCESS_OPTIONS, ...options }
  const { dryRun, createBackup, aggressive } = config
  
  try {
    const content = await fs.readFile(filePath, 'utf-8')
    const result = normalizeHtml(content, { aggressive, excludeSelectors: config.excludeSelectors })
    
    // Return early if no changes and no significant hazards
    if (result.changes === 0 && !hasSignificantHazards(result.hazards)) {
      return { 
        file: filePath, 
        changes: 0, 
        processed: true, 
        hazards: result.hazards 
      }
    }
    
    // In dry-run mode, don't modify files
    if (dryRun) {
      return { 
        file: filePath, 
        changes: result.changes, 
        processed: false, 
        dryRun: true,
        hazards: result.hazards
      }
    }
    
    // Create backup if requested
    if (createBackup && result.changes > 0) {
      const backupPath = `${filePath}.bak`
      await fs.copyFile(filePath, backupPath)
    }
    
    // Write normalized file
    if (result.changes > 0) {
      await fs.writeFile(filePath, result.html, 'utf-8')
    }
    
    return { 
      file: filePath, 
      changes: result.changes, 
      processed: true,
      hazards: result.hazards
    }
    
  } catch (error) {
    return { 
      file: filePath, 
      error: error.message, 
      processed: false, 
      changes: 0,
      hazards: { 
        invisibles_bidi: { count: 0 }, 
        smart_quotes_attrs: { count: 0 }, 
        consecutive_nbsp: { count: 0 } 
      }
    }
  }
}

/**
 * Processes multiple files matching patterns
 * @param {Object} options - Processing options
 * @returns {Promise<Object>} Processing summary with results
 */
export async function processFiles(options = {}) {
  const config = { ...DEFAULT_PROCESS_OPTIONS, ...options }
  
  // Find all matching files
  const allFiles = []
  for (const pattern of config.patterns) {
    const files = await glob(pattern, { nodir: true })
    allFiles.push(...files)
  }
  
  const uniqueFiles = [...new Set(allFiles)].sort()
  
  if (uniqueFiles.length === 0) {
    return {
      success: false,
      message: 'No files found matching patterns',
      stats: { processed: 0, changed: 0, errors: 0, totalChanges: 0 },
      hazards: { invisibles_bidi: 0, smart_quotes_attrs: 0, consecutive_nbsp: 0 }
    }
  }
  
  // Process files with concurrency limit
  const limit = pLimit(config.maxConcurrency)
  const results = []
  let processed = 0
  let changed = 0
  let totalChanges = 0
  let errors = 0
  let totalHazards = {
    invisibles_bidi: 0,
    smart_quotes_attrs: 0,
    consecutive_nbsp: 0
  }
  
  const processPromises = uniqueFiles.map(file => 
    limit(async () => {
      const result = await processFile(file, config)
      
      // Accumulate hazards
      if (result.hazards) {
        totalHazards.invisibles_bidi += result.hazards.invisibles_bidi.count
        totalHazards.smart_quotes_attrs += result.hazards.smart_quotes_attrs.count
        totalHazards.consecutive_nbsp += result.hazards.consecutive_nbsp.count
      }
      
      // Update counters
      processed++
      if (result.error) {
        errors++
      } else if (result.changes > 0) {
        changed++
        totalChanges += result.changes
      }
      
      return result
    })
  )
  
  const allResults = await Promise.all(processPromises)
  
  // Check for critical hazards that should fail build
  const shouldFail = config.failOnHazards && totalHazards.invisibles_bidi > 0
  
  return {
    success: !shouldFail && errors === 0,
    shouldFail,
    results: allResults,
    stats: {
      total: uniqueFiles.length,
      processed: processed - errors,
      changed,
      errors,
      totalChanges
    },
    hazards: totalHazards
  }
}