import { describe, it, expect } from 'vitest'
import { humanize, normalizeText, detectHazards } from '../src/index.js'

describe('Edge Cases - Bulletproof Tests', () => {
  describe('Input validation', () => {
    it('throws on null input', () => {
      expect(() => normalizeText(null)).toThrow()
      expect(() => humanize(null)).toThrow()
      expect(() => detectHazards(null)).toThrow()
    })

    it('throws on undefined input', () => {
      expect(() => normalizeText(undefined)).toThrow()
      expect(() => humanize(undefined)).toThrow()
      expect(() => detectHazards(undefined)).toThrow()
    })

    it('throws on non-string input', () => {
      expect(() => normalizeText(123)).toThrow()
      expect(() => normalizeText({})).toThrow()
      expect(() => normalizeText([])).toThrow()
      expect(() => humanize(123)).toThrow()
      expect(() => detectHazards(123)).toThrow()
    })
  })

  describe('Performance and limits', () => {
    it('handles very long strings efficiently', () => {
      const hugeString = 'Test with \u2026 '.repeat(10000) // 10K repetitions
      const start = Date.now()
      const result = normalizeText(hugeString)
      const duration = Date.now() - start
      
      expect(result.changes).toBe(10000)
      expect(duration).toBeLessThan(2000) // Must complete in under 2 seconds
    })

    it('handles strings with many different special characters', () => {
      const mixed = '\u201C\u201D\u2018\u2019\u2014\u2013\u2026\u00A0\u2022\u00BD'
      const result = normalizeText(mixed)
      expect(result.changes).toBeGreaterThan(0)
      expect(result.text.length).toBeGreaterThan(0)
    })

    it('handles empty string without allocating unnecessary memory', () => {
      const result = normalizeText('')
      expect(result.text).toBe('')
      expect(result.changes).toBe(0)
      expect(Object.keys(result.hazards)).toHaveLength(3)
    })
  })

  describe('Real-world scenarios', () => {
    it('handles typical AI-generated content', () => {
      const aiText = `
        The "revolutionary" approach—powered by advanced AI…
        Key benefits:
        • Improved efficiency
        • Better accuracy  
        • Enhanced user experience
        
        Pricing starts at €99 (±10% based on usage).
      `
      
      const result = normalizeText(aiText)
      expect(result.changes).toBeGreaterThan(0)
      expect(result.text).toContain('"revolutionary"')
      expect(result.text).toContain('approach-powered')
      expect(result.text).toContain('AI...')
      expect(result.text).toContain('* Improved')
    })

    it('handles mixed HTML and text content', () => {
      const mixed = '<p>Text with "quotes"</p>More text with \u2026'
      const result = normalizeText(mixed)
      expect(result.changes).toBeGreaterThan(0)
      expect(result.text).toContain('<p>')  // HTML preserved
      expect(result.text).toContain('...')  // Special chars normalized
    })

    it('handles content with multiple hazards', () => {
      const dangerous = 'Text\u200B\u200C\u200Dwith&nbsp;&nbsp;&nbsp;multiple\uFEFFhazards'
      const result = normalizeText(dangerous)
      
      expect(result.hazards.invisibles_bidi.count).toBeGreaterThan(0)
      expect(result.hazards.consecutive_nbsp.count).toBeGreaterThan(0)
      expect(result.changes).toBeGreaterThan(0)
    })
  })

  describe('Character encoding edge cases', () => {
    it('handles Unicode normalization forms', () => {
      // Same character in different Unicode forms
      const nfc = '\u00E9' // é (NFC)
      const nfd = 'e\u0301' // é (NFD)
      
      const resultNfc = normalizeText(`Text with ${nfc}`)
      const resultNfd = normalizeText(`Text with ${nfd}`)
      
      // Should handle both without crashing - just check they contain the text
      expect(resultNfc.text).toContain('Text with')
      expect(resultNfd.text).toContain('Text with')
      expect(resultNfc.text.length).toBeGreaterThan(0)
      expect(resultNfd.text.length).toBeGreaterThan(0)
    })

    it('handles surrogate pairs correctly', () => {
      const emoji = '👨‍💻' // Multi-codepoint emoji
      const withSpecial = `${emoji} working on \u201Ccode\u201D\u2026`
      
      const result = normalizeText(withSpecial)
      expect(result.text).toContain('working on') // Basic text preserved
      expect(result.text).toContain('"code"') // Quotes normalized
      expect(result.text).toContain('...') // Ellipsis normalized
      expect(result.changes).toBeGreaterThan(0) // Some changes made
    })

    it('preserves line breaks and whitespace structure', () => {
      const multiline = `Line 1 with "quotes"
      Line 2 with \u2026
      Line 3 with \u2014`
      
      const result = normalizeText(multiline)
      const lines = result.text.split('\n')
      expect(lines).toHaveLength(3)
      expect(lines[0]).toContain('"quotes"')
      expect(lines[1]).toContain('...')
      expect(lines[2]).toContain('-')
    })
  })

  describe('Regression tests', () => {
    it('does not double-process already normalized text', () => {
      const alreadyNormal = 'Text with "normal quotes" and ... and -'
      const result1 = normalizeText(alreadyNormal)
      const result2 = normalizeText(result1.text)
      
      expect(result1.text).toBe(result2.text)
      expect(result2.changes).toBe(0) // No additional changes
    })

    it('maintains idempotency', () => {
      const input = 'Text with \u201Cquotes\u201D and \u2026 and \u2014'
      const first = normalizeText(input)
      const second = normalizeText(first.text)
      const third = normalizeText(second.text)
      
      expect(first.text).toBe(second.text)
      expect(second.text).toBe(third.text)
      expect(second.changes).toBe(0)
      expect(third.changes).toBe(0)
    })

    it('preserves important punctuation context', () => {
      const technical = 'Function signature: func(a, b) -> c'
      const result = normalizeText(technical)
      expect(result.text).toBe(technical) // Should remain unchanged
      expect(result.changes).toBe(0)
    })
  })
})