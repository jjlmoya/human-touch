import { describe, it, expect } from 'vitest'
import { humanize, humanizeHtml, normalizeText, normalizeHtml, detectHazards } from '../src/index.js'

describe('Public API - Production Ready', () => {
  describe('humanize() - convenience function', () => {
    it('is exported and callable', () => {
      expect(typeof humanize).toBe('function')
    })

    it('normalizes text and returns only the result', () => {
      const input = 'Text with \u2026'
      const result = humanize(input)
      expect(typeof result).toBe('string')
      expect(result).toBe('Text with ...')
    })

    it('accepts options parameter', () => {
      const input = 'Price: \u20AC100'
      const safe = humanize(input)
      const aggressive = humanize(input, { aggressive: true })
      
      expect(safe).toBe('Price: \u20AC100')
      expect(aggressive).toBe('Price: EUR100')
    })

    it('handles empty string', () => {
      expect(humanize('')).toBe('')
    })
  })

  describe('humanizeHtml() - convenience function', () => {
    it('is exported and callable', () => {
      expect(typeof humanizeHtml).toBe('function')
    })

    it('normalizes HTML and returns only the result', () => {
      const input = '<p>Text with \u2026</p>'
      const result = humanizeHtml(input)
      expect(typeof result).toBe('string')
      expect(result).toContain('Text with ...')
    })

    it('preserves HTML structure', () => {
      const input = '<div class="test">Content with \u2014</div>'
      const result = humanizeHtml(input)
      expect(result).toContain('<div class="test">')
      expect(result).toContain('Content with -')
      expect(result).toContain('</div>')
    })
  })

  describe('Full API exports', () => {
    it('exports all required functions', () => {
      expect(typeof normalizeText).toBe('function')
      expect(typeof normalizeHtml).toBe('function')
      expect(typeof detectHazards).toBe('function')
      expect(typeof humanize).toBe('function')
      expect(typeof humanizeHtml).toBe('function')
    })

    it('normalizeText returns complete object', () => {
      const result = normalizeText('Text with \u2026')
      expect(result).toHaveProperty('text')
      expect(result).toHaveProperty('changes')
      expect(result).toHaveProperty('hazards')
      expect(typeof result.text).toBe('string')
      expect(typeof result.changes).toBe('number')
      expect(typeof result.hazards).toBe('object')
    })

    it('normalizeHtml returns complete object', () => {
      const result = normalizeHtml('<p>Text with \u2026</p>')
      expect(result).toHaveProperty('html')
      expect(result).toHaveProperty('changes')
      expect(result).toHaveProperty('hazards')
      expect(typeof result.html).toBe('string')
      expect(typeof result.changes).toBe('number')
      expect(typeof result.hazards).toBe('object')
    })

    it('detectHazards returns proper structure', () => {
      const result = detectHazards('test')
      expect(result).toHaveProperty('invisibles_bidi')
      expect(result).toHaveProperty('smart_quotes_attrs')
      expect(result).toHaveProperty('consecutive_nbsp')
      
      expect(result.invisibles_bidi).toHaveProperty('count')
      expect(result.invisibles_bidi).toHaveProperty('matches')
      expect(Array.isArray(result.invisibles_bidi.matches)).toBe(true)
    })
  })

  describe('Error handling', () => {
    it('handles malformed HTML gracefully', () => {
      const malformed = '<div><p>Unclosed tags with \u2026'
      expect(() => humanizeHtml(malformed)).not.toThrow()
      const result = humanizeHtml(malformed)
      expect(result).toContain('...')
    })

    it('handles extremely long strings', () => {
      const longString = 'a'.repeat(100000) + '\u2026'
      expect(() => humanize(longString)).not.toThrow()
      const result = humanize(longString)
      expect(result.endsWith('...')).toBe(true)
    })

    it('handles strings with only special characters', () => {
      const special = '\u2026\u2014\u201C\u201D\u00A0'
      const result = humanize(special)
      expect(result).toBe('...-"" ')
    })
  })
})