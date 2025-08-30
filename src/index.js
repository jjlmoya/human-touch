/**
 * Human Touch - Transform AI-generated text into human-readable content
 * 
 * Main library exports for programmatic usage
 */

// Import functions first
import { 
  normalizeText, 
  normalizeHtml, 
  DEFAULT_CONFIG 
} from './core/normalizer.js'

import { 
  detectHazards, 
  hasSignificantHazards, 
  getTotalHazardCount,
  HAZARDS 
} from './core/hazards.js'

import { 
  SAFE_REPLACEMENTS, 
  AGGRESSIVE_REPLACEMENTS 
} from './core/replacements.js'

import { 
  processFiles, 
  processFile 
} from './utils/file-processor.js'

// Re-export everything
export { 
  normalizeText, 
  normalizeHtml, 
  DEFAULT_CONFIG,
  detectHazards, 
  hasSignificantHazards, 
  getTotalHazardCount,
  HAZARDS,
  SAFE_REPLACEMENTS, 
  AGGRESSIVE_REPLACEMENTS,
  processFiles, 
  processFile 
}

// Convenience function for quick text normalization
export function humanize(text, options = {}) {
  const { aggressive = false } = options
  return normalizeText(text, aggressive).text
}

// Convenience function for HTML normalization
export function humanizeHtml(html, options = {}) {
  return normalizeHtml(html, options).html
}