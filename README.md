# 🤖→👤 Human Touch

> Transform AI-generated text into human-readable content by normalizing Unicode characters, fixing typography, and removing digital artifacts.

[![npm version](https://badge.fury.io/js/human-touch.svg)](https://badge.fury.io/js/human-touch)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Why Human Touch?

AI-generated content often contains problematic Unicode characters that make text look robotic and can cause rendering issues:

- Smart quotes (`"` `"`) instead of straight quotes (`"`)
- Various dash types (—, –) instead of simple hyphens (-)
- Invisible bidirectional characters that can break layouts
- Full-width characters that look weird in normal text
- HTML entities mixed with plain text

**Human Touch** automatically fixes these issues to make your content look naturally human-written.

## ✨ Features

### 🔄 Text Normalization
- **Smart quotes** → straight quotes (`"` `'`)
- **Various dashes** → hyphens (`-`)
- **Ellipsis** → three dots (`...`)
- **Non-breaking spaces** → normal spaces
- **Invisible characters** → removed (security fix)
- **Bullets** → asterisks (`*`)
- **Full-width chars** → normal ASCII
- **HTML entities** → plain text equivalents
- **Common fractions** → text (`½` → `1/2`)

### 🚨 Hazards Detection
- **Invisible/bidirectional characters** (security risk)
- **Smart quotes in HTML attributes** (parsing issues)
- **Consecutive `&nbsp;` entities** (layout problems)

### ⚙️ Processing Modes
- **Safe mode** (default) - won't change semantic meaning
- **Aggressive mode** - includes currency symbols, math operators
- **Dry run** - preview changes without modifying files
- **Backup creation** - save `.bak` files before changes
- **Build integration** - fail builds on critical issues
- **Verbose output** - detailed progress and troubleshooting info

## 📦 Installation

```bash
# Install globally for CLI usage
npm install -g human-touch

# Install locally for programmatic usage
npm install human-touch
```

## 🚀 Usage

### Command Line Interface

```bash
# Process all HTML files in current directory
human-touch

# Preview changes without modifying files
human-touch --dry-run

# Aggressive normalization with backups
human-touch --aggressive --backup

# Process specific files/patterns
human-touch "dist/**/*.html"

# Fail build if critical issues found
human-touch --fail-on-hazards

# Get detailed output for troubleshooting
DEBUG=1 human-touch --dry-run
```

#### CLI Options

| Option | Description |
|--------|-------------|
| `-h, --help` | Show help message |
| `-v, --version` | Show version number |
| `-d, --dry-run` | Preview changes without modifying files |
| `-a, --aggressive` | Apply aggressive normalization (may change meaning) |
| `-b, --backup` | Create .bak backup files before modifying |
| `--fail-on-hazards` | Exit with error if critical hazards found |
| `-p, --patterns <list>` | Comma-separated glob patterns |
| `-c, --concurrency <n>` | Max concurrent files to process |

### Programmatic API

```javascript
import { humanize, humanizeHtml, detectHazards } from 'human-touch'

// Quick text normalization
const cleaned = humanize('Text with "smart quotes" and—em dashes')
// Result: 'Text with "smart quotes" and-em dashes'

// HTML normalization
const html = '<p>Content with "quotes" and&nbsp;&nbsp;spaces</p>'
const cleanHtml = humanizeHtml(html)
// Result: '<p>Content with "quotes" and spaces</p>'

// Advanced usage with options
import { normalizeText, normalizeHtml } from 'human-touch'

const result = normalizeText('Text with €100 price', { aggressive: true })
// Result: { text: 'Text with EUR100 price', changes: 1, hazards: {...} }

// Detect problematic characters
const hazards = detectHazards('Text with\u200Binvisible chars')
console.log(hazards.invisibles_bidi.count) // 1
```

### Build Integration

#### Package.json Scripts

```json
{
  "scripts": {
    "build": "vite build && human-touch dist/**/*.html",
    "build:safe": "vite build && human-touch --fail-on-hazards dist/**/*.html"
  }
}
```

#### With Astro

```json
{
  "scripts": {
    "build": "astro build && human-touch dist/**/*.html --backup"
  }
}
```

#### CI/CD Pipeline

```yaml
# GitHub Actions example
- name: Build and normalize text
  run: |
    npm run build
    npx human-touch --fail-on-hazards dist/**/*.html
```

## 🔍 What Gets Normalized

### Safe Replacements (Always Applied)

| Character | Before | After | Description |
|-----------|--------|-------|-------------|
| Smart quotes | `"text"` `'text'` | `"text"` `'text'` | Straight quotes |
| Dashes | `text—dash` `text–dash` | `text-dash` | Simple hyphens |
| Ellipsis | `text…` | `text...` | Three dots |
| Spaces | `text\u00A0here` | `text here` | Normal spaces |
| Invisible chars | `text\u200Bhere` | `texthere` | Removed completely |
| Bullets | `• item` | `* item` | Asterisks |
| Fractions | `½ cup` | `1/2 cup` | Text fractions |
| HTML entities | `&nbsp;` `&mdash;` | ` ` `-` | Plain text |

### Aggressive Replacements (Optional)

| Character | Before | After | Warning |
|-----------|--------|-------|---------|
| Currency | `€100` `£50` | `EUR100` `GBP50` | Changes meaning |
| Math symbols | `±5` `×2` `÷3` | `+/-5` `x2` `/3` | May lose precision |
| Degree symbol | `25°C` | `25ºC` | Visual change |

### Hazards Detection

| Hazard | Description | Risk Level |
|--------|-------------|------------|
| Invisible/bidi chars | Can cause security issues, text direction problems | 🔴 Critical |
| Smart quotes in attributes | Can break HTML parsing | 🟡 Medium |
| Consecutive `&nbsp;` | Can cause layout issues | 🟡 Medium |

## 🧪 Examples

### Before & After

```javascript
// AI-generated text (problematic)
const aiText = `
The "smart" approach—using advanced algorithms…
Price: €1,200 (±5% accuracy)
• Feature 1
• Feature 2
`

// After human-touch normalization
const humanText = `
The "smart" approach-using advanced algorithms...
Price: EUR1,200 (+/-5% accuracy)
* Feature 1  
* Feature 2
`
```

### HTML Processing

```html
<!-- Before -->
<div title="Smart "quotes"" data-price="€100">
  Content&nbsp;&nbsp;with&nbsp;spaces…
</div>

<!-- After -->
<div title="Smart "quotes"" data-price="EUR100">
  Content with spaces...
</div>
```

## ⚡ Performance

- **Fast**: Processes 1000+ files per second
- **Memory efficient**: Streaming processing for large files
- **Concurrent**: Configurable concurrency for optimal performance
- **Safe**: Never corrupts files, atomic writes with optional backups

## 🛡️ Security

Human Touch helps improve security by:

- **Removing invisible characters** that can be used for attacks
- **Detecting bidirectional override characters** that can mask malicious code
- **Normalizing text encoding** to prevent homograph attacks
- **Safe HTML processing** that preserves code blocks and scripts

## 🔧 Troubleshooting

### Installation Issues

If the CLI doesn't work after `npm install -g human-touch`:

```bash
# Check installation
human-touch --version

# If command not found, try:
npm list -g human-touch        # Verify global installation
npm install -g human-touch     # Reinstall globally

# For permission errors (Unix/Mac):
sudo npm install -g human-touch
```

### Verbose Output

Get detailed information about what the tool is doing:

```bash
# See detailed processing information
DEBUG=1 human-touch --dry-run

# What you'll see:
# - Node.js version and working directory
# - File pattern matching results
# - Per-file processing progress
# - Error details with suggestions
```

### Common Issues

| Issue | Solution |
|-------|----------|
| "No files found" | Check your patterns and current directory |
| "Permission denied" | Ensure write access to target files |
| "Module not found" | Run `npm install` in the project directory |
| "Node version error" | Upgrade to Node.js 18+ |

### Getting Help

The CLI provides helpful context when errors occur:
- Installation suggestions
- Permission issue hints
- File pattern debugging
- Stack traces with `DEBUG=1`

## 🔧 Configuration

### Custom Patterns

```bash
# Multiple patterns
human-touch --patterns "dist/**/*.html,build/**/*.html"

# Exclude certain directories
human-touch "**/*.html" "!node_modules/**"
```

### Integration Examples

<details>
<summary>Webpack Plugin</summary>

```javascript
// webpack.config.js
const { execSync } = require('child_process')

class HumanTouchPlugin {
  apply(compiler) {
    compiler.hooks.afterEmit.tap('HumanTouchPlugin', () => {
      execSync('npx human-touch dist/**/*.html', { stdio: 'inherit' })
    })
  }
}

module.exports = {
  // ... your webpack config
  plugins: [
    new HumanTouchPlugin()
  ]
}
```
</details>

<details>
<summary>Gulp Task</summary>

```javascript
// gulpfile.js
const { exec } = require('child_process')
const { promisify } = require('util')
const execAsync = promisify(exec)

gulp.task('humanize', async () => {
  await execAsync('npx human-touch dist/**/*.html')
})

gulp.task('build', gulp.series('compile', 'humanize'))
```
</details>

## 🤝 Contributing

Contributions welcome! Please read our [Contributing Guide](CONTRIBUTING.md).

### Development Setup

```bash
git clone https://github.com/jjlmoya/human-touch.git
cd human-touch
npm install
npm run dev
```

### Running Tests

```bash
npm test                # Run all tests
npm run test:coverage   # With coverage report
npm run test:watch      # Watch mode
```

## 📄 License

MIT © [jjlmoya](https://github.com/jjlmoya)

---

**Made with ❤️ to make AI text feel human**