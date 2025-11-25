# Build Instructions for Aria2 Integration Extension

## Prerequisites

- **Node.js**: v18.0.0 or higher
- **pnpm**: v10.22.0 (specified in package.json)

## Installation Steps

1. Install pnpm globally (if not already installed):
   ```bash
   npm install -g pnpm@10.22.0
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

## Build Process

To build the extension for production (minified):
```bash
pnpm build:minify
```

The built extension will be in the `dist/` directory.

## Build Scripts

Available build commands:
- `pnpm build` - Standard build
- `pnpm build:minify` - Production build with minification
- `pnpm build:dev` - Development build with source maps
- `pnpm package` - Create distributable zip file

## Build Tools Used

1. **esbuild** (v0.27.0) - Used to bundle JavaScript modules:
   - Bundles `src/lib/aria2-client.js` and dependencies into `lib/aria2.bundle.js`
   - Bundles `src/lib/encoding.js` and dependencies into `lib/encoding.bundle.js`
   - Only used for bundling, NOT for transpilation or minification of source files

2. **jschardet** (v3.1.4) - Character encoding detection library (npm dependency)

## Source Code Structure

- `src/extension/` - Main extension code (copied as-is to dist/)
- `src/lib/` - Library code that gets bundled with esbuild
- `scripts/build.js` - Build script

## Third-Party Libraries

The following third-party libraries are included in `src/extension/data/ariang/`:
- AriaNg v1.3.7 (complete web UI, pre-built from upstream)
- jQuery 3.3.1
- Angular 1.6.10
- Bootstrap 3.4.1
- ECharts 3.8.5
- Moment.js 2.29.4

These are included as pre-built minified files from their official distributions and are NOT modified during our build process.

## Verification

To verify the build:
1. Run `pnpm build`
2. Check that `dist/` directory contains the extension files
3. The manifest.json should show version 0.5.0

## Operating System

This extension can be built on:
- macOS
- Linux
- Windows

No OS-specific build steps required.

## Notes

- The build process does NOT transpile ES6+ code
- The build process does NOT minify source files (except when using --minify flag for production)
- Source files from `src/extension/` are copied as-is
- Only `src/lib/` modules are bundled using esbuild
