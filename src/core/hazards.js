/**
 * Hazards detection - problematic characters that can cause issues
 */

// Critical hazards that can break rendering or pose security risks
export const HAZARDS = {
  // Invisible/bidirectional characters - ALWAYS problematic
  invisibles_bidi: /[\u200B\u200C\u200D\u2060\u2061\u2062\u2063\u2064\u2065\u2066\u2067\u2068\u2069\uFEFF\u200E\u200F\u202A\u202B\u202C\u202D\u202E]/g,
  
  // Smart quotes in critical HTML attributes
  smart_quotes_attrs: /(?:content|data-[^=]*|alt|title)=["'][^"']*[\u201C\u201D\u2018\u2019\u201A\u02BB\u02BC\u201E][^"']*["']/gi,
  
  // Consecutive &nbsp; entities
  consecutive_nbsp: /(?:&nbsp;\s*){2,}/gi
}

/**
 * Detects hazards in text content
 * @param {string} text - Text to analyze
 * @returns {Object} Hazards found with counts and positions
 */
export function detectHazards(text) {
  const hazards = {}
  
  for (const [name, regex] of Object.entries(HAZARDS)) {
    const matches = [...text.matchAll(regex)]
    hazards[name] = {
      count: matches.length,
      matches: matches.map(m => ({
        text: m[0],
        index: m.index
      }))
    }
  }
  
  return hazards
}

/**
 * Checks if hazards are significant enough to warrant attention
 * @param {Object} hazards - Hazards object from detectHazards
 * @returns {boolean} True if there are significant hazards
 */
export function hasSignificantHazards(hazards) {
  return hazards.invisibles_bidi.count > 0 || 
         hazards.smart_quotes_attrs.count > 0 || 
         hazards.consecutive_nbsp.count > 0
}

/**
 * Gets total hazard count across all categories
 * @param {Object} hazards - Hazards object from detectHazards
 * @returns {number} Total number of hazards found
 */
export function getTotalHazardCount(hazards) {
  return Object.values(hazards).reduce((total, hazard) => total + hazard.count, 0)
}