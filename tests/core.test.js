import { describe, it, expect } from 'vitest'
import { normalizeText } from '../src/core/normalizer.js'
import { detectHazards } from '../src/core/hazards.js'

describe('Core Functionality - Production Ready', () => {
  describe('normalizeText()', () => {
    it('handles empty string without crashing', () => {
      const result = normalizeText('')
      expect(result.text).toBe('')
      expect(result.changes).toBe(0)
      expect(result.hazards).toBeDefined()
    })

    it('handles normal text without changes', () => {
      const input = 'Normal text without special characters'
      const result = normalizeText(input)
      expect(result.text).toBe(input)
      expect(result.changes).toBe(0)
    })

    it('normalizes ellipsis correctly', () => {
      const input = 'Text with ellipsis\u2026'
      const result = normalizeText(input)
      expect(result.text).toBe('Text with ellipsis...')
      expect(result.changes).toBe(1)
    })

    it('normalizes em dash correctly', () => {
      const input = 'Text with em\u2014dash'
      const result = normalizeText(input)
      expect(result.text).toBe('Text with em-dash')
      expect(result.changes).toBe(1)
    })

    it('normalizes en dash correctly', () => {
      const input = 'Text with en\u2013dash'
      const result = normalizeText(input)
      expect(result.text).toBe('Text with en-dash')
      expect(result.changes).toBe(1)
    })

    it('normalizes smart quotes correctly', () => {
      const input = 'Text with \u201Cleft\u201D and \u2018single\u2019'
      const result = normalizeText(input)
      expect(result.text).toBe('Text with "left" and \'single\'')
      expect(result.changes).toBe(4)
    })

    it('removes invisible characters', () => {
      const input = 'Text\u200Bwith\u200Cinvisible\uFEFFchars'
      const result = normalizeText(input)
      expect(result.text).toBe('Textwithinvisiblechars')
      expect(result.changes).toBe(3)
    })

    it('normalizes non-breaking spaces', () => {
      const input = 'Text\u00A0with\u00A0spaces'
      const result = normalizeText(input)
      expect(result.text).toBe('Text with spaces')
      expect(result.changes).toBe(2)
    })

    it('normalizes bullets to asterisks', () => {
      const input = '\u2022 First bullet'
      const result = normalizeText(input)
      expect(result.text).toBe('* First bullet')
      expect(result.changes).toBe(1)
    })

    it('normalizes fractions', () => {
      const input = 'Recipe needs \u00BD cup'
      const result = normalizeText(input)
      expect(result.text).toBe('Recipe needs 1/2 cup')
      expect(result.changes).toBe(1)
    })

    it('collapses consecutive &nbsp; entities', () => {
      const input = 'Text&nbsp;&nbsp;&nbsp;here'
      const result = normalizeText(input)
      expect(result.text).toBe('Text here')
      expect(result.changes).toBe(2) // 1 for collapse + 1 for &nbsp; → space
    })

    it('applies aggressive mode when enabled', () => {
      const input = 'Price: \u20AC100'
      const safe = normalizeText(input, false)
      const aggressive = normalizeText(input, true)
      
      expect(safe.text).toBe('Price: \u20AC100') // unchanged
      expect(safe.changes).toBe(0)
      
      expect(aggressive.text).toBe('Price: EUR100') // changed
      expect(aggressive.changes).toBe(1)
    })

    it('handles very long strings without performance issues', () => {
      const input = 'Text with \u2026 '.repeat(1000)
      const start = Date.now()
      const result = normalizeText(input)
      const duration = Date.now() - start
      
      expect(result.changes).toBe(1000)
      expect(duration).toBeLessThan(1000) // Should complete in under 1 second
    })

    it('handles null and undefined gracefully', () => {
      expect(() => normalizeText(null)).toThrow()
      expect(() => normalizeText(undefined)).toThrow()
    })
  })

  describe('detectHazards()', () => {
    it('detects invisible characters', () => {
      const text = 'Text\u200Bwith\u200Cinvisible'
      const hazards = detectHazards(text)
      
      expect(hazards.invisibles_bidi.count).toBe(2)
      expect(hazards.invisibles_bidi.matches).toHaveLength(2)
      expect(hazards.invisibles_bidi.matches[0].text).toBe('\u200B')
      expect(hazards.invisibles_bidi.matches[0].index).toBe(4)
    })

    it('detects consecutive &nbsp; entities', () => {
      const text = 'Text&nbsp;&nbsp;here'
      const hazards = detectHazards(text)
      
      expect(hazards.consecutive_nbsp.count).toBe(1)
      expect(hazards.consecutive_nbsp.matches[0].text).toBe('&nbsp;&nbsp;')
    })

    it('detects smart quotes in HTML attributes', () => {
      const html = '<div title="Text with \u201Cquotes\u201D">Content</div>'
      const hazards = detectHazards(html)
      
      expect(hazards.smart_quotes_attrs.count).toBe(1)
    })

    it('returns zero counts for clean text', () => {
      const text = 'Clean text with no hazards'
      const hazards = detectHazards(text)
      
      expect(hazards.invisibles_bidi.count).toBe(0)
      expect(hazards.smart_quotes_attrs.count).toBe(0)
      expect(hazards.consecutive_nbsp.count).toBe(0)
    })

    it('handles empty string', () => {
      const hazards = detectHazards('')
      
      expect(hazards.invisibles_bidi.count).toBe(0)
      expect(hazards.smart_quotes_attrs.count).toBe(0)
      expect(hazards.consecutive_nbsp.count).toBe(0)
    })

    it('handles null and undefined', () => {
      expect(() => detectHazards(null)).toThrow()
      expect(() => detectHazards(undefined)).toThrow()
    })
  })
})