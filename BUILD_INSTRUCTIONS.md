# Build Instructions for ArcIntegration

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

## Automatic Manifest Synchronization

The build script automatically synchronizes the following fields from `package.json` to `src/extension/manifest.json`:

- **version**: Extension version number
- **homepage_url**: Project homepage URL

This ensures consistency between package metadata and the browser extension manifest. You only need to update these values in `package.json`, and they will automatically sync during the build process.

## Build Scripts

Available build commands:
- `pnpm build` - Standard build
- `pnpm build:minify` - Production build with minification
- `pnpm build:dev` - Development build with source maps
- `pnpm build:webui` - Build only the ArcUI web interface
- `pnpm watch` - Watch mode for development (auto-rebuild on changes)
- `pnpm clean` - Remove dist directory
- `pnpm clean:all` - Remove all build artifacts and dependencies

## Packaging Scripts

- `pnpm package` - Create distributable extension zip file (`arc-integration.zip`)
- `pnpm package:source` - Create source code package for Mozilla review (`arc-integration-source.zip`)
- `pnpm package:all` - Create both extension and source packages

## Build Tools Used

1. **esbuild** (v0.27.0) - Used to bundle JavaScript modules:
   - Bundles `src/lib/aria2-client.js` and dependencies into `lib/aria2.bundle.js`
   - Bundles `src/lib/encoding.js` and dependencies into `lib/encoding.bundle.js`
   - Only used for bundling, NOT for transpilation or minification of source files

2. **jschardet** (v3.1.4) - Character encoding detection library (npm dependency)

3. **Vite** (v5.0.0) - Build tool for webui:
   - Used to build the ArcUI web interface (webui/)
   - Bundles Svelte components into static HTML/CSS/JS

## Source Code Structure

- `src/extension/` - Main extension code (copied as-is to dist/)
- `src/lib/` - Library code that gets bundled with esbuild
- `webui/` - ArcUI web interface source code (Svelte-based)
  - Built using Vite and output to `webui/dist/`
  - Then copied to `dist/data/ariang/` during main build
- `scripts/build.js` - Main build script

## ArcUI Web Interface

The extension includes a custom-built web interface called **ArcUI**:
- Built with Svelte and Vite
- Source code in `webui/` directory
- Provides modern UI for managing Aria2 downloads
- Compiled to static files during build process

## Build Stages

The build process consists of two stages:

1. **WebUI Build** (`pnpm build:webui`):
   - Changes directory to `webui/`
   - Installs webui dependencies
   - Runs Vite build to compile Svelte components
   - Output: `webui/dist/` containing built web interface

2. **Extension Build** (main build):
   - Syncs version and homepage from `package.json` to `manifest.json`
   - Bundles library code with esbuild
   - Copies extension files to `dist/`
   - Copies built webui from `webui/dist/` to `dist/data/webui/`

## Verification

To verify the build:
1. Run `pnpm build`
2. Check that `dist/` directory contains the extension files
3. Check that `dist/data/webui/` contains the built ArcUI files
4. The manifest.json should show the current version from package.json
5. Icons should be present in `dist/data/icons/` (both normal and disabled states)

## Operating System

This extension can be built on:
- macOS
- Linux
- Windows

No OS-specific build steps required.

## Logo and Icons

The extension logo is designed as an SVG and converted to PNG icons:
- Source SVG files are in `assets/logo.svg` and `assets/logo-disabled.svg`
- Icons are generated in multiple sizes: 16, 32, 48, 64, 128, 256 pixels
- Both normal (colored) and disabled (grayscale) states are provided
- To regenerate icons from SVG, run `./scripts/generate-icons.sh` (requires ImageMagick)

## Notes

- The build process does NOT transpile ES6+ code
- The build process does NOT minify source files (except when using --minify flag for production)
- Source files from `src/extension/` are copied as-is
- Only `src/lib/` modules are bundled using esbuild
- Version number is automatically synced from `package.json` to `manifest.json`
