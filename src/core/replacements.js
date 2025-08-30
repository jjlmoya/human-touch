/**
 * Character replacement patterns for human-touch text normalization
 */

// Safe replacements - always applied, won't change semantic meaning
export const SAFE_REPLACEMENTS = [
  // Smart quotes → straight quotes
  [/[\u201C\u201D]/g, '"'],
  [/[\u2018\u2019\u201A\u02BB\u02BC]/g, "'"],
  [/[\u201E]/g, '"'],
  
  // Various dashes → hyphen
  [/[\u2010\u2013\u2014\u2212]/g, '-'],  // hyphen, en-dash, em-dash, minus
  
  // Ellipsis → three dots
  [/\u2026/g, '...'],
  
  // Problematic spaces → normal space (expanded)
  [/[\u00A0\u2007\u2009\u2002\u2003\u2004\u2005\u2006\u2008\u200A\u202F\u1680\u3000]/g, ' '],
  
  // Invisible/bidi characters → remove (expanded)
  [/[\u200B\u200C\u200D\u2060\u2061\u2062\u2063\u2064\u2065\u2066\u2067\u2068\u2069\uFEFF\u200E\u200F\u202A\u202B\u202C\u202D\u202E]/g, ''],
  
  // Bullets → asterisk (expanded)
  [/[\u2022\u2023\u25E6\u00B7\u25AA\u25AB\u25CF\u25A0\u25A1\u2043]/g, '*'],
  
  // Basic arrows → ASCII
  [/\u2192/g, '->'],  // rightwards arrow
  [/\u2190/g, '<-'],  // leftwards arrow
  [/\u2191/g, '^'],   // upwards arrow
  [/\u2193/g, 'v'],   // downwards arrow
  
  // Check marks and crosses → text (before multiplication)
  [/\u2713/g, '[ok]'],  // check mark
  [/\u2714/g, '[OK]'],  // heavy check mark
  [/\u274C/g, '[x]'],   // cross mark
  [/\u2717/g, '[X]'],   // ballot x
  [/\u2718/g, '[X]'],   // heavy ballot x
  
  // Multiplication alternatives → x
  [/[\u2715\u2716]/g, 'x'],
  
  // HTML entities in plain text (expanded)
  [/&nbsp;/g, ' '],
  [/&ensp;/g, ' '],
  [/&emsp;/g, ' '],
  [/&thinsp;/g, ' '],
  [/&mdash;/g, '-'],
  [/&ndash;/g, '-'],
  [/&hellip;/g, '...'],
  [/&lsquo;/g, "'"],
  [/&rsquo;/g, "'"],
  [/&ldquo;/g, '"'],
  [/&rdquo;/g, '"'],
  [/&bull;/g, '*'],
  [/&middot;/g, '*'],
  
  // Full-width characters → normal ASCII
  [/[\uFF01-\uFF5E]/g, (match) => String.fromCharCode(match.charCodeAt(0) - 0xFEE0)],
  
  // Common fractions → text
  [/\u00BD/g, '1/2'],
  [/\u00BC/g, '1/4'],
  [/\u00BE/g, '3/4'],
  [/\u2153/g, '1/3'],
  [/\u2154/g, '2/3'],
  [/\u2155/g, '1/5'],
  [/\u2156/g, '2/5'],
  [/\u2157/g, '3/5'],
  [/\u2158/g, '4/5'],
  [/\u2159/g, '1/6'],
  [/\u215A/g, '5/6'],
  [/\u215B/g, '1/8'],
  [/\u215C/g, '3/8'],
  [/\u215D/g, '5/8'],
  [/\u215E/g, '7/8']
]

// Aggressive replacements - may change semantic meaning, use with caution
export const AGGRESSIVE_REPLACEMENTS = [
  // En-dash in ranges (loses typographic meaning)
  [/\u2013/g, '-'],
  
  // Mathematical symbols
  [/\u00D7/g, 'x'],
  [/\u00F7/g, '/'],
  [/\u00B1/g, '+/-'],
  [/\u00B0/g, 'º'],
  
  // Arrows → ASCII
  [/\u2192/g, '->'],
  [/\u2190/g, '<-'],
  [/\u2191/g, '^'],
  [/\u2193/g, 'v'],
  
  // Currency symbols → codes (changes content)
  [/\u20AC/g, 'EUR'],
  [/\u00A3/g, 'GBP'],
  [/\u00A5/g, 'JPY'],
  [/\u00A2/g, 'cent'],
  
  // French quotes
  [/[\u00AB\u00BB]/g, '"'],
  [/[\u2039\u203A]/g, "'"]
]