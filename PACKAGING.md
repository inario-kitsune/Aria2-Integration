# Packaging Guide for ArcIntegration

This document describes how to create distribution packages for the ArcIntegration browser extension.

## Package Types

### 1. Extension Package (`arc-integration.zip`)

The distributable extension package ready for installation or submission to Mozilla Add-ons.

**Command:**
```bash
pnpm package
```

**Contents:**
- Compiled extension code
- Bundled JavaScript libraries
- Built ArcUI web interface
- Icons and assets
- Manifest and locale files

**Output:** `arc-integration.zip` (~236 KB)

**Use for:**
- Installing in Firefox for testing
- Submitting to Mozilla Add-ons (AMO)
- Distribution to end users

---

### 2. Source Code Package (`arc-integration-source.zip`)

The source code package required by Mozilla Add-ons for review.

**Command:**
```bash
pnpm package:source
```

**Contents:**
- Complete source code (`src/` directory)
- Build scripts (`scripts/` directory)
- WebUI source code (`webui/` directory)
- Logo and icon assets (`assets/` directory)
- Configuration files (`package.json`, `pnpm-lock.yaml`)
- Documentation (`README.md`, `BUILD_INSTRUCTIONS.md`, etc.)

**Excludes:**
- `node_modules/`
- `dist/`
- Built files
- IDE and OS files

**Output:** `arc-integration-source.zip` (~343 KB)

**Use for:**
- Mozilla Add-ons source code review
- Archiving source code snapshots
- Sharing buildable source with developers

---

### 3. Complete Package (Both)

Create both packages in one command:

**Command:**
```bash
pnpm package:all
```

This runs both `pnpm package` and `pnpm package:source` sequentially.

---

## Packaging Workflow

### For Release

1. **Update version** in `package.json`:
   ```json
   "version": "0.6.0"
   ```

2. **Update CHANGELOG.md** with release notes

3. **Build and package**:
   ```bash
   pnpm package:all
   ```

4. **Verify packages**:
   ```bash
   ls -lh *.zip
   unzip -l arc-integration.zip | head -30
   unzip -l arc-integration-source.zip | head -30
   ```

5. **Test the extension package**:
   - Open Firefox: `about:debugging`
   - Click "This Firefox"
   - Click "Load Temporary Add-on"
   - Select `arc-integration.zip`
   - Test all functionality

6. **Submit to Mozilla Add-ons**:
   - Upload `arc-integration.zip` as the extension
   - Upload `arc-integration-source.zip` as the source code
   - Provide build instructions from `BUILD_INSTRUCTIONS.md`

---

## Build System Details

### Automatic Synchronization

The build system automatically syncs these fields from `package.json` to `manifest.json`:
- `version` → `version`
- `homepage` → `homepage_url`

This ensures version consistency across all files.

### File Structure

```
arc-integration.zip
├── manifest.json              # Extension manifest
├── config.js                  # Extension configuration
├── common.js                  # Background script
├── lib/                       # Bundled libraries
│   ├── aria2.bundle.js
│   ├── encoding.bundle.js
│   └── tools.js
├── _locales/                  # Internationalization
│   ├── en/messages.json
│   └── zh_CN/messages.json
├── data/
│   ├── icons/                 # Extension icons
│   │   ├── 16.png
│   │   ├── 32.png
│   │   ├── 48.png
│   │   ├── 64.png
│   │   ├── 128.png
│   │   ├── 256.png
│   │   └── disabled/          # Grayscale icons
│   ├── webui/                 # ArcUI web interface
│   │   ├── index.html
│   │   ├── webui.js
│   │   └── webui.css
│   ├── action/                # Popup UI
│   ├── options/               # Settings pages
│   └── content/               # Content scripts
```

---

## Cleaning Up

Remove build artifacts:
```bash
pnpm clean              # Remove dist/ only
pnpm clean:all          # Remove all build artifacts and dependencies
```

Remove package files:
```bash
rm -f *.zip
```

---

## Troubleshooting

### Package is too large
- Ensure `webui/node_modules/` is excluded (should be automatic)
- Check for stray files in `src/extension/`
- Verify no `.DS_Store` or other OS files are included

### Source package missing files
- Check `scripts/package-source.js` for include patterns
- Ensure all necessary files are in the include list
- Verify files are not in `.gitignore` if they should be included

### Version mismatch
- Version is automatically synced from `package.json` during build
- If manifest version is wrong, check that build script ran successfully
- Run `pnpm build` to trigger version sync

---

## Mozilla Add-ons Submission Checklist

Before submitting to AMO:

- [ ] Updated version in `package.json`
- [ ] Updated `CHANGELOG.md`
- [ ] Ran `pnpm package:all`
- [ ] Tested extension package locally
- [ ] Verified manifest version matches package.json
- [ ] Source package includes all necessary files
- [ ] `BUILD_INSTRUCTIONS.md` is up to date
- [ ] All code changes are committed to git
- [ ] Created git tag for release version

---

## Quick Reference

| Task | Command |
|------|---------|
| Build extension | `pnpm build` |
| Build for production | `pnpm build:minify` |
| Create extension package | `pnpm package` |
| Create source package | `pnpm package:source` |
| Create both packages | `pnpm package:all` |
| Clean build files | `pnpm clean` |
| Clean everything | `pnpm clean:all` |
| Watch mode (dev) | `pnpm watch` |
