import * as cheerio from 'cheerio'
import { SAFE_REPLACEMENTS, AGGRESSIVE_REPLACEMENTS } from './replacements.js'
import { detectHazards, HAZARDS } from './hazards.js'

/**
 * Default configuration for text normalization
 */
export const DEFAULT_CONFIG = {
  excludeSelectors: ['script', 'style', 'pre', 'code', '[contenteditable]'],
  contentAttributes: ['title', 'alt', 'placeholder', 'aria-label', 'content']
}

/**
 * Normalizes plain text with character replacements
 * @param {string} text - Text to normalize
 * @param {boolean} aggressive - Whether to apply aggressive replacements
 * @returns {Object} Result with normalized text, change count, and hazards
 */
export function normalizeText(text, aggressive = false) {
  let result = text
  let changes = 0
  
  // Detect hazards BEFORE normalizing
  const hazards = detectHazards(text)
  
  // Collapse consecutive &nbsp; before general normalizations
  if (hazards.consecutive_nbsp.count > 0) {
    result = result.replace(HAZARDS.consecutive_nbsp, '&nbsp;')
    changes += hazards.consecutive_nbsp.count
  }
  
  // Apply safe replacements
  for (const [regex, replacement] of SAFE_REPLACEMENTS) {
    result = result.replace(regex, (match) => {
      changes++
      return typeof replacement === 'function' ? replacement(match) : replacement
    })
  }
  
  // Apply aggressive replacements if enabled
  if (aggressive) {
    for (const [regex, replacement] of AGGRESSIVE_REPLACEMENTS) {
      result = result.replace(regex, (match) => {
        changes++
        return typeof replacement === 'function' ? replacement(match) : replacement
      })
    }
  }
  
  return { text: result, changes, hazards }
}

/**
 * Safely normalizes HTML content using cheerio
 * @param {string} html - HTML content to normalize
 * @param {Object} options - Normalization options
 * @returns {Object} Result with normalized HTML, changes, and hazards
 */
export function normalizeHtml(html, options = {}) {
  const config = { ...DEFAULT_CONFIG, ...options }
  const { aggressive = false } = options
  
  try {
    const $ = cheerio.load(html, { 
      decodeEntities: false, // Don't decode HTML entities
      lowerCaseAttributeNames: false
    })
    
    let totalChanges = 0
    let allHazards = {
      invisibles_bidi: { count: 0, matches: [] },
      smart_quotes_attrs: { count: 0, matches: [] },
      consecutive_nbsp: { count: 0, matches: [] }
    }
    
    // Detect hazards in full HTML BEFORE processing
    const fullHtmlHazards = detectHazards(html)
    
    // Process text nodes, excluding problematic elements
    const excludeSelector = config.excludeSelectors.join(', ')
    
    // Find all text nodes not in excluded elements
    $('*').contents().filter(function() {
      return this.type === 'text' && !$(this).closest(excludeSelector).length
    }).each(function() {
      const originalText = $(this).text()
      const { text: normalizedText, changes, hazards } = normalizeText(originalText, aggressive)
      
      // Accumulate hazards
      for (const [name, data] of Object.entries(hazards)) {
        allHazards[name].count += data.count
        allHazards[name].matches.push(...data.matches)
      }
      
      if (changes > 0) {
        $(this).replaceWith(normalizedText)
        totalChanges += changes
      }
    })
    
    // Normalize content attributes
    config.contentAttributes.forEach(attr => {
      $(`[${attr}]`).each(function() {
        const original = $(this).attr(attr)
        if (original) {
          const { text: normalized, changes, hazards } = normalizeText(original, aggressive)
          
          // Accumulate attribute hazards
          for (const [name, data] of Object.entries(hazards)) {
            allHazards[name].count += data.count
            allHazards[name].matches.push(...data.matches)
          }
          
          if (changes > 0) {
            $(this).attr(attr, normalized)
            totalChanges += changes
          }
        }
      })
    })
    
    // Include hazards detected in full HTML
    allHazards.smart_quotes_attrs.count += fullHtmlHazards.smart_quotes_attrs.count
    allHazards.smart_quotes_attrs.matches.push(...fullHtmlHazards.smart_quotes_attrs.matches)
    
    return {
      html: $.html(),
      changes: totalChanges,
      hazards: allHazards
    }
  } catch (error) {
    // Fallback to plain text normalization if HTML parsing fails
    console.warn(`HTML parsing failed, using fallback: ${error.message}`)
    const result = normalizeText(html, aggressive)
    return {
      html: result.text,
      changes: result.changes,
      hazards: result.hazards
    }
  }
}