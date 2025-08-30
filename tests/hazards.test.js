import { describe, it, expect } from 'vitest'
import { detectHazards, hasSignificantHazards, getTotalHazardCount } from '../src/core/hazards.js'

describe('Hazards Detection', () => {
  describe('Invisible/Bidirectional Characters', () => {
    it('should detect zero-width characters', () => {
      const text = 'Text\u200Bwith\u200Czero\u200Dwidth'
      const hazards = detectHazards(text)
      expect(hazards.invisibles_bidi.count).toBe(3)
      expect(hazards.invisibles_bidi.matches[0].text).toBe('\u200B')
      expect(hazards.invisibles_bidi.matches[0].index).toBe(4)
    })

    it('should detect bidirectional override characters', () => {
      const text = 'Text\u202Awith\u202Bbidi\u202Cchars'
      const hazards = detectHazards(text)
      expect(hazards.invisibles_bidi.count).toBe(3)
    })

    it('should detect word joiner and similar', () => {
      const text = 'Text\u2060with\uFEFFword\u2061joiner'
      const hazards = detectHazards(text)
      expect(hazards.invisibles_bidi.count).toBe(3)
    })
  })

  describe('Smart Quotes in Attributes', () => {
    it('should detect smart quotes in title attributes', () => {
      const html = '<div title="Text with "smart quotes"">Content</div>'
      const hazards = detectHazards(html)
      expect(hazards.smart_quotes_attrs.count).toBe(1)
    })

    it('should detect smart quotes in alt attributes', () => {
      const html = '<img alt="Image "description"" src="test.jpg">'
      const hazards = detectHazards(html)
      expect(hazards.smart_quotes_attrs.count).toBe(1)
    })

    it('should detect smart quotes in data attributes', () => {
      const html = '<span data-tooltip="Tooltip "text"" data-info="More "info"">Test</span>'
      const hazards = detectHazards(html)
      expect(hazards.smart_quotes_attrs.count).toBe(2)
    })

    it('should detect smart quotes in content attributes', () => {
      const html = '<meta name="description" content="Page with "smart quotes"">'
      const hazards = detectHazards(html)
      expect(hazards.smart_quotes_attrs.count).toBe(1)
    })

    it('should not detect quotes in regular text content', () => {
      const html = '<p>Text with "smart quotes" in content</p>'
      const hazards = detectHazards(html)
      expect(hazards.smart_quotes_attrs.count).toBe(0)
    })
  })

  describe('Consecutive &nbsp; Entities', () => {
    it('should detect consecutive &nbsp; entities', () => {
      const html = 'Text&nbsp;&nbsp;&nbsp;with multiple'
      const hazards = detectHazards(html)
      expect(hazards.consecutive_nbsp.count).toBe(1)
      expect(hazards.consecutive_nbsp.matches[0].text).toBe('&nbsp;&nbsp;&nbsp;')
    })

    it('should detect &nbsp; with spaces in between', () => {
      const html = 'Text&nbsp; &nbsp; &nbsp;spaced'
      const hazards = detectHazards(html)
      expect(hazards.consecutive_nbsp.count).toBe(1)
    })

    it('should detect multiple occurrences', () => {
      const html = 'First&nbsp;&nbsp;pair and&nbsp;&nbsp;&nbsp;triple'
      const hazards = detectHazards(html)
      expect(hazards.consecutive_nbsp.count).toBe(2)
    })

    it('should not detect single &nbsp;', () => {
      const html = 'Text&nbsp;with single'
      const hazards = detectHazards(html)
      expect(hazards.consecutive_nbsp.count).toBe(0)
    })
  })

  describe('Multiple Hazards', () => {
    it('should detect all types of hazards in one text', () => {
      const html = '<div title="Smart "quotes"" data-info="More\u200Binfo">Content&nbsp;&nbsp;here</div>'
      const hazards = detectHazards(html)
      
      expect(hazards.invisibles_bidi.count).toBe(1)
      expect(hazards.smart_quotes_attrs.count).toBe(1)
      expect(hazards.consecutive_nbsp.count).toBe(1)
    })

    it('should provide accurate positions for all hazards', () => {
      const text = 'Start\u200Bmiddle&nbsp;&nbsp;end'
      const hazards = detectHazards(text)
      
      expect(hazards.invisibles_bidi.matches[0].index).toBe(5)
      expect(hazards.consecutive_nbsp.matches[0].index).toBe(12)
    })
  })

  describe('Helper Functions', () => {
    it('should correctly identify significant hazards', () => {
      const hazardsWithInvisible = {
        invisibles_bidi: { count: 1 },
        smart_quotes_attrs: { count: 0 },
        consecutive_nbsp: { count: 0 }
      }
      expect(hasSignificantHazards(hazardsWithInvisible)).toBe(true)

      const hazardsWithSmartQuotes = {
        invisibles_bidi: { count: 0 },
        smart_quotes_attrs: { count: 1 },
        consecutive_nbsp: { count: 0 }
      }
      expect(hasSignificantHazards(hazardsWithSmartQuotes)).toBe(true)

      const noHazards = {
        invisibles_bidi: { count: 0 },
        smart_quotes_attrs: { count: 0 },
        consecutive_nbsp: { count: 0 }
      }
      expect(hasSignificantHazards(noHazards)).toBe(false)
    })

    it('should calculate total hazard count correctly', () => {
      const hazards = {
        invisibles_bidi: { count: 2 },
        smart_quotes_attrs: { count: 1 },
        consecutive_nbsp: { count: 3 }
      }
      expect(getTotalHazardCount(hazards)).toBe(6)
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty strings', () => {
      const hazards = detectHazards('')
      expect(hazards.invisibles_bidi.count).toBe(0)
      expect(hazards.smart_quotes_attrs.count).toBe(0)
      expect(hazards.consecutive_nbsp.count).toBe(0)
    })

    it('should handle strings with no hazards', () => {
      const hazards = detectHazards('Normal text with no hazards')
      expect(getTotalHazardCount(hazards)).toBe(0)
      expect(hasSignificantHazards(hazards)).toBe(false)
    })

    it('should handle very long strings with many hazards', () => {
      const text = '\u200B'.repeat(100) + '&nbsp;&nbsp;'.repeat(50)
      const hazards = detectHazards(text)
      expect(hazards.invisibles_bidi.count).toBe(100)
      expect(hazards.consecutive_nbsp.count).toBeGreaterThan(0)
    })
  })
})