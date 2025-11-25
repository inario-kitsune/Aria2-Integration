# Aria2 Download Manager Integration

A modernized Firefox extension to integrate with Aria2 download manager.

Fork of the original [Aria2 Integration](https://addons.mozilla.org/firefox/addon/aria2-integration/) with enhanced features and updated UI.

## Features

- 🚀 Dynamic RPC server management (add/remove multiple servers)
- 📥 Automatic download interception with whitelist/blacklist filtering
- ⌨️ Alt+Click to bypass and use browser's native download
- 🔄 Automatic fallback to browser download when Aria2 is unavailable
- 🎨 Integrated AriaNg web UI (v1.3.7)
- 🌍 Multi-language support (English, Chinese, German, Traditional Chinese)
- 📊 Real-time download statistics in popup
- ⚙️ Flexible configuration options

## Installation

### From Source

1. Clone this repository:
   ```bash
   git clone git@github.com:inario-kitsune/Aria2-Integration.git
   cd Aria2-Integration
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Build the extension:
   ```bash
   pnpm build
   ```

4. Load in Firefox:
   - Navigate to `about:debugging`
   - Click "This Firefox"
   - Click "Load Temporary Add-on"
   - Select `dist/manifest.json`

## Development

- `pnpm build` - Build extension for production
- `pnpm build:dev` - Build with source maps
- `pnpm build:minify` - Build with minification
- `pnpm watch` - Watch mode for development
- `pnpm package` - Create distributable zip file
- `pnpm clean` - Clean build artifacts

## Configuration

### RPC Server Setup

1. Open extension settings
2. Navigate to "RPC Servers" section
3. Add your Aria2 RPC server details:
   - Server name
   - Protocol (ws/wss/http/https)
   - Host and port
   - Secret token (if configured)

### Download Filtering

Configure whitelist/blacklist rules in the "Exception" settings:
- **Whitelist**: Only intercept downloads matching these patterns
- **Blacklist**: Never intercept downloads matching these patterns
- Use Alt+Click on any link to temporarily bypass interception

## Reference

- [Aria2](https://github.com/aria2/aria2) - The ultra fast download utility
- [AriaNg](https://github.com/mayswind/AriaNg) - Modern web frontend for Aria2
- [Original Extension](https://addons.mozilla.org/firefox/addon/aria2-integration/)

## License

MIT License - see LICENSE file for details

## Credits

- Original extension by RossWang
- Fork maintained by inario-kitsune
