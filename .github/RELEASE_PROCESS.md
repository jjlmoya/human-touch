# 🚀 Release Process

## Automated Release Pipeline

### How to Release

1. **Make your changes** and commit them to main branch
2. **Choose release type**:
   ```bash
   npm run release:patch  # Bug fixes (1.0.1 -> 1.0.2)
   npm run release:minor  # New features (1.0.1 -> 1.1.0)  
   npm run release:major  # Breaking changes (1.0.1 -> 2.0.0)
   ```
3. **Push happens automatically** - the script pushes both commits and tags
4. **GitHub Actions takes over**:
   - Runs tests on multiple Node.js versions
   - Generates changelog from git commits
   - Creates GitHub release with changelog
   - Publishes to NPM automatically

### What Happens Automatically

✅ **On every push/PR**: Tests run on Node.js 18, 20, 21
✅ **On tag push**: Full release pipeline triggers
✅ **Changelog generation**: From git commits since last tag
✅ **GitHub release**: With pretty changelog
✅ **NPM publish**: Automatic with proper access
✅ **CLI testing**: Verifies global installation works

### Required Setup

1. **NPM_TOKEN**: Add to GitHub repository secrets
   ```bash
   # Create token at https://www.npmjs.com/settings/tokens
   # Add to: Settings > Secrets and variables > Actions
   ```

2. **GitHub Token**: Auto-provided by Actions (no setup needed)

### Release Checklist

- [ ] All tests passing locally
- [ ] README.md updated (MANDATORY for public library)
- [ ] Version bump appropriate for changes
- [ ] Commit messages are descriptive (used for changelog)

### Manual Override

If you need to publish manually:
```bash
npm run test:run    # Ensure tests pass
npm publish         # Direct publish (skips GitHub Actions)
```

### Rollback

If a release goes wrong:
```bash
npm unpublish human-touch@1.0.x --force  # Within 24h only
git tag -d vX.X.X                        # Delete local tag
git push origin :vX.X.X                  # Delete remote tag
```