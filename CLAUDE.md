# CLAUDE.md - Human Touch Library

## 🔒 MANDATORY REQUIREMENT
**CRITICAL**: Every time you make changes to this library, you MUST update the README.md file to reflect:
- New features added
- Bug fixes implemented  
- Breaking changes
- CLI improvements
- API changes
- Installation/usage updates

This is a PUBLIC library that people depend on. The README.md is their primary documentation.

## Library Commands

### Testing
```bash
npm test           # Run tests with vitest
npm run test:run   # Run tests once
npm run test:coverage # Run with coverage
```

### Publishing
```bash
npm run release    # Bump version and publish to npm
```

### Build/Lint
The library doesn't have explicit lint/typecheck commands configured. Consider adding them for better development experience.

## Current Library Status
- **Type**: ESM module (type: "module")
- **Main entry**: src/index.js
- **CLI entry**: src/cli/index.js  
- **Dependencies**: cheerio, glob, p-limit
- **Node requirement**: >=18.0.0

## Key Features to Document
- Unicode character normalization
- Smart quotes fixing
- Invisible/bidirectional character detection
- HTML processing with selector exclusions
- CLI with dry-run, backup, and concurrency options
- Hazard detection and reporting
- File pattern matching with glob

## When Making Changes
1. ✅ Update code
2. ✅ Update tests if needed
3. 🚨 **MANDATORY**: Update README.md with changes
4. ✅ Run tests
5. ✅ Use `npm run release` to publish

## README.md Sections to Keep Updated
- Installation instructions
- CLI usage examples
- Programmatic API examples
- Configuration options
- Feature list
- Version history/changelog section