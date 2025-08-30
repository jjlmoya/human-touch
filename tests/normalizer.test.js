import { describe, it, expect } from 'vitest'
import { normalizeText, normalizeHtml } from '../src/core/normalizer.js'

describe('Text Normalization', () => {
  describe('Safe Replacements', () => {
    it('should normalize smart quotes', () => {
      const input = '"Smart" quotes and 'single' quotes'
      const result = normalizeText(input)
      expect(result.text).toBe('"Smart" quotes and \'single\' quotes')
      expect(result.changes).toBe(4)
    })

    it('should normalize various dashes', () => {
      const input = 'En–dash and Em—dash and minus−'
      const result = normalizeText(input)
      expect(result.text).toBe('En-dash and Em-dash and minus-')
      expect(result.changes).toBe(3)
    })

    it('should normalize ellipsis', () => {
      const input = 'Text with ellipsis…'
      const result = normalizeText(input)
      expect(result.text).toBe('Text with ellipsis...')
      expect(result.changes).toBe(1)
    })

    it('should normalize problematic spaces', () => {
      const input = 'Text\u00A0with\u2009various\u3000spaces'
      const result = normalizeText(input)
      expect(result.text).toBe('Text with various spaces')
      expect(result.changes).toBe(3)
    })

    it('should remove invisible characters', () => {
      const input = 'Text\u200Bwith\u200Cinvisible\uFEFFchars'
      const result = normalizeText(input)
      expect(result.text).toBe('Textwithinvisiblechars')
      expect(result.changes).toBe(3)
    })

    it('should normalize bullets to asterisks', () => {
      const input = '• First\u2023Second\u25CFThird'
      const result = normalizeText(input)
      expect(result.text).toBe('* First*Second*Third')
      expect(result.changes).toBe(3)
    })

    it('should normalize arrows to ASCII', () => {
      const input = 'Left←Right→Up↑Down↓'
      const result = normalizeText(input)
      expect(result.text).toBe('Left<-Right->Up^Down v')
      expect(result.changes).toBe(4)
    })

    it('should normalize fractions', () => {
      const input = 'Recipe: ½ cup, ¼ teaspoon, ¾ hour'
      const result = normalizeText(input)
      expect(result.text).toBe('Recipe: 1/2 cup, 1/4 teaspoon, 3/4 hour')
      expect(result.changes).toBe(3)
    })

    it('should normalize HTML entities', () => {
      const input = 'Space&nbsp;dash&mdash;ellipsis&hellip;'
      const result = normalizeText(input)
      expect(result.text).toBe('Space dash-ellipsis...')
      expect(result.changes).toBe(3)
    })

    it('should normalize full-width characters', () => {
      const input = 'Ｆｕｌｌ　ｗｉｄｔｈ！'
      const result = normalizeText(input)
      expect(result.text).toBe('Full width!')
      expect(result.changes).toBe(11)
    })
  })

  describe('Aggressive Replacements', () => {
    it('should not apply aggressive replacements by default', () => {
      const input = 'Price: €100 ±5%'
      const result = normalizeText(input, false)
      expect(result.text).toBe('Price: €100 ±5%')
      expect(result.changes).toBe(0)
    })

    it('should apply aggressive replacements when enabled', () => {
      const input = 'Price: €100 £50 ¥200 ±5% 25°C'
      const result = normalizeText(input, true)
      expect(result.text).toBe('Price: EUR100 GBP50 JPY200 +/-5% 25ºC')
      expect(result.changes).toBe(5)
    })

    it('should normalize math symbols aggressively', () => {
      const input = 'Calculation: 5×3÷2±1'
      const result = normalizeText(input, true)
      expect(result.text).toBe('Calculation: 5x3/2+/-1')
      expect(result.changes).toBe(3)
    })
  })

  describe('Hazards Detection', () => {
    it('should detect invisible characters', () => {
      const input = 'Text\u200Bwith\u200Einvisible\u202Achars'
      const result = normalizeText(input)
      expect(result.hazards.invisibles_bidi.count).toBe(3)
      expect(result.hazards.invisibles_bidi.matches).toHaveLength(3)
    })

    it('should detect consecutive &nbsp;', () => {
      const input = 'Text&nbsp;&nbsp;&nbsp;here and&nbsp; &nbsp;there'
      const result = normalizeText(input)
      expect(result.hazards.consecutive_nbsp.count).toBe(2)
    })

    it('should collapse consecutive &nbsp; during normalization', () => {
      const input = 'Text&nbsp;&nbsp;&nbsp;here'
      const result = normalizeText(input)
      expect(result.text).toBe('Text here')
      expect(result.changes).toBe(2) // 1 for collapse + 1 for &nbsp; → space
    })
  })
})

describe('HTML Normalization', () => {
  it('should normalize text content while preserving HTML structure', () => {
    const input = '<p>Text with "smart quotes" and—dashes</p>'
    const result = normalizeHtml(input)
    expect(result.html).toContain('Text with "smart quotes" and-dashes')
    expect(result.changes).toBe(3)
  })

  it('should not process script and style elements', () => {
    const input = '<script>const str = "smart quotes";</script><p>"Text"</p>'
    const result = normalizeHtml(input)
    expect(result.html).toContain('const str = "smart quotes";') // unchanged
    expect(result.html).toContain('"Text"') // changed
  })

  it('should normalize HTML attributes', () => {
    const input = '<img alt="Image with "quotes"" title=\'More "quotes"\' />'
    const result = normalizeHtml(input)
    expect(result.html).toContain('alt="Image with "quotes""')
    expect(result.html).toContain('title=\'More "quotes"\'')
  })

  it('should detect hazards in full HTML', () => {
    const input = '<div title="Smart "quotes"">Text\u200Bhere</div>'
    const result = normalizeHtml(input)
    expect(result.hazards.smart_quotes_attrs.count).toBeGreaterThan(0)
    expect(result.hazards.invisibles_bidi.count).toBe(1)
  })

  it('should handle malformed HTML gracefully', () => {
    const input = '<div>Unclosed tag with "quotes"'
    const result = normalizeHtml(input)
    expect(result.html).toContain('"quotes"')
    expect(result.changes).toBe(2)
  })
})

describe('Edge Cases', () => {
  it('should handle empty strings', () => {
    const result = normalizeText('')
    expect(result.text).toBe('')
    expect(result.changes).toBe(0)
  })

  it('should handle strings with no normalizable characters', () => {
    const input = 'Normal text with no special characters'
    const result = normalizeText(input)
    expect(result.text).toBe(input)
    expect(result.changes).toBe(0)
  })

  it('should handle very long strings', () => {
    const input = '"smart quotes" '.repeat(1000)
    const result = normalizeText(input)
    expect(result.changes).toBe(2000) // 2 replacements × 1000 repetitions
  })

  it('should handle mixed content correctly', () => {
    const input = 'Mixed: "quotes"—dash…ellipsis&nbsp;space'
    const result = normalizeText(input)
    expect(result.text).toBe('Mixed: "quotes"-dash...ellipsis space')
    expect(result.changes).toBe(5)
  })
})