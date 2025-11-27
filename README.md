# ArcIntegration

A modern Firefox extension to integrate your browser with Aria2 download manager.


## Features

- 🚀 **Multi-server Management** - Manage multiple Aria2 RPC servers dynamically
- 📥 **Smart Download Capture** - Automatic download interception with flexible filtering
- 🎯 **Unified Filter System** - Single whitelist/blacklist toggle for sites and file types
- ⌨️ **Alt+Click Bypass** - Hold Alt while clicking to use browser's native download
- 🔄 **Automatic Fallback** - Seamlessly falls back to browser download when Aria2 is unavailable
- 🎨 **ArcUI Integration** - Modern Svelte-based web interface for download management
- 🌍 **Multi-language** - English, Chinese (Simplified & Traditional), German
- 📊 **Real-time Stats** - Download statistics and Aria2 status in popup
- 🔒 **Security Focused** - No data collection, secure RPC communication
- ⚡ **Performance** - Optimized logging, clean codebase

## Installation

### From Mozilla Add-ons (Recommended)

*Coming soon*

### From Source

1. **Clone the repository:**
   ```bash
   git clone https://github.com/inario-kitsune/Aria2-Integration.git
   cd Aria2-Integration
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Build the extension:**
   ```bash
   pnpm build
   ```

4. **Load in Firefox:**
   - Navigate to `about:debugging`
   - Click "This Firefox"
   - Click "Load Temporary Add-on"
   - Select `dist/manifest.json`

## Quick Start

### 1. Configure Aria2 RPC Server

Open extension settings and add your Aria2 server:
- **Name**: My Aria2 Server
- **Protocol**: ws, wss, http, or https
- **Host**: localhost (or remote server IP)
- **Port**: 6800 (default)
- **Token**: Your secret token (if configured)

### 2. Set Up Filtering (Optional)

Navigate to "Exception" settings to configure download filtering:
- **Site Filter**: Control which websites trigger automatic downloads
- **Extension Filter**: Filter by file extensions (e.g., .zip, .pdf)
- **Mode Toggle**: Switch between whitelist (allow only) and blacklist (block only)
- **Quick Add**: Use popup to quickly add current site to filter

### 3. Start Downloading

Once configured, downloads will automatically be sent to Aria2:
- Click any download link - automatically captured
- Right-click → "Download with Aria2" - manual trigger
- Hold Alt+Click - bypass and use browser download

## Development

### Build Commands

```bash
pnpm build              # Standard build
pnpm build:minify       # Production build (minified)
pnpm build:dev          # Development build (with source maps)
pnpm build:webui        # Build ArcUI only
pnpm watch              # Watch mode (auto-rebuild)
```

### Packaging

```bash
pnpm package            # Create extension package (arc-integration.zip)
pnpm package:source     # Create source package for review
pnpm package:all        # Create both packages
```

### Cleaning

```bash
pnpm clean              # Remove dist/ directory
pnpm clean:all          # Remove all build artifacts and dependencies
```

## Architecture

```
arc-integration/
├── src/
│   ├── extension/          # Main extension code
│   │   ├── common.js       # Background script
│   │   ├── config.js       # Configuration
│   │   ├── data/
│   │   │   ├── action/     # Popup UI
│   │   │   ├── options/    # Settings pages
│   │   │   ├── content/    # Content scripts
│   │   │   ├── icons/      # Extension icons
│   │   │   └── webui/      # ArcUI (built)
│   │   └── _locales/       # Translations
│   └── lib/                # Bundled libraries
│       ├── aria2-client.js # Aria2 RPC client
│       └── encoding.js     # Character encoding detection
├── webui/                  # ArcUI source (Svelte)
├── assets/                 # Logo and icon sources (SVG)
└── scripts/                # Build scripts
```

## Configuration

### Site Filtering

**Whitelist Mode** (Allow Only):
- Only sites in the list will trigger automatic downloads
- All other sites use browser's native download

**Blacklist Mode** (Block Only):
- Sites in the list will NOT trigger automatic downloads
- All other sites are captured

**Wildcard Support**:
- `example.com` - Exact match
- `*.example.com` - All subdomains

### Extension Filtering

Same whitelist/blacklist modes apply to file extensions:
- `zip` - Match .zip files
- `pdf` - Match .pdf files
- Multiple extensions supported

### Minimum File Size

Set minimum file size (in bytes) to capture. Files smaller than this will use browser download.

## Troubleshooting

### Downloads not being captured

1. Check Aria2 is running and accessible
2. Verify RPC server configuration (host, port, token)
3. Check site/extension filters aren't blocking
4. Look for filter logs in browser console

### Connection failed

1. Ensure Aria2 RPC server is running
2. Check firewall settings
3. Verify protocol (ws/wss/http/https) matches Aria2 config
4. Test connection in ArcUI interface

### Icons not showing

1. Rebuild extension: `pnpm build`
2. Reload extension in `about:debugging`
3. Check `dist/data/icons/` directory


## Links

- **Repository**: https://github.com/inario-kitsune/Aria2-Integration
- **Issues**: https://github.com/inario-kitsune/Aria2-Integration/issues
- **Aria2**: https://github.com/aria2/aria2
- **Documentation**: See BUILD_INSTRUCTIONS.md and PACKAGING.md

## License

MIT License - see LICENSE file for details

## Credits

- Original Aria2 Integration extension by RossWang
- ArcIntegration fork maintained by inario-kitsune
- Inspired by Arch Linux design philosophy
- Built with love for the open source community
