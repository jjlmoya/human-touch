import fs from 'fs'
import path from 'path'

/**
 * Parse command line arguments
 * @returns {Object} Parsed options
 */
export function parseArgs() {
  const args = process.argv.slice(2)
  
  const options = {
    patterns: ['**/*.html'],
    maxConcurrency: 8,
    createBackup: false,
    aggressive: false,
    dryRun: false,
    failOnHazards: false,
    help: false,
    version: false
  }
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    
    switch (arg) {
      case '--help':
      case '-h':
        options.help = true
        break
        
      case '--version':
      case '-v':
        options.version = true
        break
        
      case '--dry-run':
      case '-d':
        options.dryRun = true
        break
        
      case '--backup':
      case '-b':
        options.createBackup = true
        break
        
      case '--aggressive':
      case '-a':
        options.aggressive = true
        break
        
      case '--fail-on-hazards':
        options.failOnHazards = true
        break
        
      case '--patterns':
      case '-p':
        if (i + 1 < args.length) {
          options.patterns = args[++i].split(',')
        }
        break
        
      case '--concurrency':
      case '-c':
        if (i + 1 < args.length) {
          const concurrency = parseInt(args[++i], 10)
          if (concurrency > 0) {
            options.maxConcurrency = concurrency
          }
        }
        break
        
      default:
        if (arg.startsWith('--patterns=')) {
          options.patterns = arg.split('=')[1].split(',')
        } else if (arg.startsWith('--concurrency=')) {
          const concurrency = parseInt(arg.split('=')[1], 10)
          if (concurrency > 0) {
            options.maxConcurrency = concurrency
          }
        } else if (!arg.startsWith('-')) {
          // Treat as pattern if no flag prefix
          options.patterns = [arg]
        }
        break
    }
  }
  
  return options
}

/**
 * Show help information
 */
export function showHelp() {
  console.log(`
🤖→👤 Human Touch - Transform AI text into human-readable content

USAGE:
  human-touch [options] [patterns...]

OPTIONS:
  -h, --help              Show this help message
  -v, --version           Show version number
  -d, --dry-run           Show what would be changed without modifying files
  -a, --aggressive        Apply aggressive normalization (may change meaning)
  -b, --backup            Create .bak backup files before modifying
  --fail-on-hazards       Exit with error code if critical hazards found
  -p, --patterns <list>   Comma-separated glob patterns (default: **/*.html)
  -c, --concurrency <n>   Max concurrent files to process (default: 8)

EXAMPLES:
  human-touch                           # Process all HTML files
  human-touch --dry-run                 # Preview changes without modifying
  human-touch --aggressive --backup     # Aggressive mode with backups
  human-touch "dist/**/*.html"          # Process specific pattern
  human-touch --fail-on-hazards         # Fail build on critical issues

WHAT IT DOES:
  ✅ Smart quotes → straight quotes
  ✅ Various dashes → hyphens  
  ✅ Ellipsis → three dots
  ✅ Non-breaking spaces → normal spaces
  ✅ Invisible/bidirectional chars → removed
  ✅ Bullets → asterisks
  ✅ HTML entities → plain text
  ✅ Full-width chars → normal ASCII
  ✅ Common fractions → text (1/2, 3/4, etc.)

HAZARDS DETECTION:
  🚨 Invisible/bidirectional characters (security risk)
  🚨 Smart quotes in HTML attributes  
  🚨 Consecutive &nbsp; entities

For more info: https://github.com/jjlmoya/human-touch
`)
}

/**
 * Show version information
 */
export function showVersion() {
  try {
    const packagePath = path.join(process.cwd(), 'package.json')
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'))
    console.log(`human-touch v${packageJson.version}`)
  } catch (error) {
    console.log('human-touch v1.0.0')
  }
}