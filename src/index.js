/**
 * Human Touch - Transform AI-generated text into human-readable content
 * 
 * Main library exports for programmatic usage
 */

export { 
  normalizeText, 
  normalizeHtml, 
  DEFAULT_CONFIG 
} from './core/normalizer.js'

export { 
  detectHazards, 
  hasSignificantHazards, 
  getTotalHazardCount,
  HAZARDS 
} from './core/hazards.js'

export { 
  SAFE_REPLACEMENTS, 
  AGGRESSIVE_REPLACEMENTS 
} from './core/replacements.js'

export { 
  processFiles, 
  processFile 
} from './utils/file-processor.js'

// Convenience function for quick text normalization
export function humanize(text, options = {}) {
  const { aggressive = false } = options
  return normalizeText(text, aggressive).text
}

// Convenience function for HTML normalization
export function humanizeHtml(html, options = {}) {
  return normalizeHtml(html, options).html
}