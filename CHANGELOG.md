# Changelog

All notable changes to this project will be documented in this file.

## [0.6.0](https://github.com/inario-kitsune/Aria2-Integration/releases/tag/v0.6.0) (2025-11-27)

### 🎨 Brand Refresh - ArcIntegration

#### Rebranding
* **Project renamed to ArcIntegration** - Now part of the Arc series (ArcUI, arc-core, arc-cli)
* **New Arch Linux-inspired logo** - Minimalist "A" design with curved horizontal bar and arc cutout
* **Updated branding across all files** - Extension name, descriptions, and documentation

#### Visual Identity
* **New icon design** - Arch Linux blue (#1793D1) with white logo on circular background
* **Generated icons in all sizes** - 16, 32, 48, 64, 128, 256px for normal and disabled states
* **SVG source files** - Vector graphics for easy regeneration (assets/logo.svg)
* **Icon generation script** - Automated PNG generation from SVG sources

### 🔧 UI/UX Enhancements

#### Unified Filter System
* **Single filter mode toggle** - Replaced dual blacklist/whitelist with unified system
* **Item-by-item management** - Add/remove buttons replace textarea for site and extension filters
* **Improved filter UI** - Mode toggle buttons for whitelist/blacklist switching
* **Quick site blocking** - Popup allows one-click site filtering with wildcard support
* **Referer-based filtering** - Block downloads from subdomains when parent domain is blocked

#### Settings Cleanup
* **Removed obsolete features** - Aggressive Mode, Shutdown Aria2c, Remember window location, Aria2 Auto Start
* **User-Agent always enabled** - Simplified settings by making UA transmission default
* **About page cleanup** - Removed AriaNg references and outdated links
* **Version synchronization** - Display version dynamically from manifest

### 🐛 Bug Fixes

#### Filter System
* **Fixed popup blocking** - Site filter mode now properly saves to storage
* **Fixed wildcard matching** - Corrected pattern from `.*` to `[^.]*` for subdomain matching
* **Fixed settings display** - Added missing filter fields to config.command.guess
* **Fixed cross-subdomain blocking** - Downloads from download.app.com now blocked when www.app.com is blocked

#### Code Quality
* **Syntax error fix** - Resolved "return not in function" error from aggressive mode removal
* **Improved error logging** - Converted console.log to console.error with meaningful context
* **Removed sensitive data logging** - No longer logs URLs, cookies, or request headers

### 🧹 Code Cleanup

#### Logging System
* **Removed 22 verbose debug logs** - Cleaned up trace logging from popup and settings
* **Removed 4 sensitive data logs** - No longer logs cookies, headers, or full storage objects
* **Improved 11 error logs** - Better error messages with proper console.error usage
* **Kept 19 critical logs** - Maintained important logs for troubleshooting filters and errors

#### Documentation
* **New PACKAGING.md** - Complete guide for creating distribution packages
* **Updated BUILD_INSTRUCTIONS.md** - Added icon generation, packaging scripts, and ArcUI info
* **Updated README.md** - Comprehensive documentation with Arc series branding
* **Logo design documentation** - assets/README.md explains design and regeneration

### 🚀 Build System Improvements

#### Automatic Synchronization
* **Manifest sync from package.json** - Version and homepage_url automatically synced during build
* **Build script enhancements** - syncVersion() function handles multiple fields

#### Packaging Scripts
* **Updated package names** - arc-integration.zip and arc-integration-source.zip
* **New package:all command** - Creates both extension and source packages
* **Updated source packaging** - Includes assets/ directory with logo sources
* **New clean:all command** - Removes all build artifacts and dependencies

#### Icon Generation
* **generate-icons.sh script** - Automated icon generation from SVG to PNG
* **Multiple sizes supported** - Generates all 6 sizes for normal and disabled states
* **ImageMagick integration** - Uses magick command for high-quality conversion

### 📦 Package Information

* **Package name**: arc-integration
* **Version**: 0.6.0
* **Description**: ArcIntegration - Browser extension to integrate with Aria2
* **Extension package**: ~236 KB
* **Source package**: ~345 KB

### 🔄 Migration Notes

No breaking changes for users upgrading from 0.5.0. All settings and configurations are preserved.

Developers should note:
- Project renamed but maintains same functionality
- New logo and icon assets in assets/ directory
- Package names changed to arc-integration-*
- Additional documentation files added

---

## [0.5.0](https://github.com/inario-kitsune/Aria2-Integration/releases/tag/v0.5.0) (2025-11-25)

### Major Changes

#### 🏗️ Project Restructure
* **Reorganized project structure** from `App/` to `src/extension/` for better maintainability
* **Set up modern build system** with pnpm and esbuild bundling
* **Created modular codebase** with separate `src/lib/` for reusable components

#### 🚀 Dynamic RPC Server Management
* **Replaced fixed 3-server limit** with dynamic add/delete server system
* **Server management UI** with add, edit, and delete capabilities
* **Active server tracking** with server selection in download panel
* **JSON-based storage** for unlimited server configurations

#### 🎨 UI/UX Improvements
* **Upgraded AriaNg** from v1.1.1 to v1.3.7
* **Modernized UI design** across all settings pages
* **Simplified navigation** in options menu
* **Fixed download panel height constraints** to ensure buttons remain visible
* **Removed redundant Save/SaveAs buttons** (functionality replaced by Alt+Click)

#### 📥 Enhanced Download Features
* **Alt+Click bypass** - Hold Alt key to use browser's native download instead of Aria2
* **Automatic fallback** - Falls back to browser download when Aria2 connection fails
* **Retry logic** - Waits 3 seconds and retries once before fallback
* **Whitelist/Blacklist filtering** - Advanced URL pattern matching for download interception
* **Content script injection** for Alt key detection on all pages

#### 🔧 Code Quality & Architecture
* **Created Aria2Client class** for better WebSocket/HTTP connection management
* **Improved error handling** with user-friendly notifications
* **Removed deprecated features**: Sound notifications, old exception filters
* **Fixed redundant WebSocket connection attempts**
* **Updated configuration system** for better compatibility

#### 🌍 Internationalization
* **Updated translations** for all new features (English, Chinese, German, Traditional Chinese)
* **Fixed translation syntax errors** (Chinese quotation marks)
* **Added new translation keys** for server management and error messages

#### 📝 Documentation
* **Comprehensive README** with installation, development, and configuration guides
* **Updated repository links** to fork repository
* **Added package.json metadata** (repository, homepage, bugs)

### Breaking Changes

* Configuration structure changed from fixed `s2`/`s3` to dynamic `rpcServers` array
* Removed sound notification feature completely
* Removed old exception filter implementation
* Navigation structure simplified (removed nav-group)

### Migration Notes

Existing users upgrading from 0.4.5:
- Server configurations will need to be re-entered in the new RPC Servers section
- Sound notification settings will be removed (feature deprecated)
- Old exception filters will be replaced with new whitelist/blacklist system

---

## [0.4.5](https://github.com/RossWang/Aria2-Integration/compare/0.4.4...0.4.5) (2019-06-14)


### Bug Fixes

* fix a issue with Aggressive Mode ([8cc77c1](https://github.com/RossWang/Aria2-Integration/commit/8cc77c1))


### Features

* update AriaNg to 1.1.1 ([15451d1](https://github.com/RossWang/Aria2-Integration/commit/15451d1))



## [0.4.4](https://github.com/RossWang/Aria2-Integration/compare/0.4.3...0.4.4) (2019-04-05)



## [0.4.3](https://github.com/RossWang/Aria2-Integration/compare/0.4.2...0.4.3) (2019-04-05)


### Bug Fixes

* Fix a file name parsing issue ([098091f](https://github.com/RossWang/Aria2-Integration/commit/098091f)), closes [#53](https://github.com/RossWang/Aria2-Integration/issues/53)



## [0.4.2](https://github.com/RossWang/Aria2-Integration/compare/0.4.1...0.4.2) (2019-03-19)


### Bug Fixes

* Fix a display issue ([4398338](https://github.com/RossWang/Aria2-Integration/commit/4398338))


### Features

* Update AriaNg to Version 1.0.1 ([9d42f8e](https://github.com/RossWang/Aria2-Integration/commit/9d42f8e))
* Update jschardet to Version 2.1.0 ([9370b78](https://github.com/RossWang/Aria2-Integration/commit/9370b78))



## [0.4.1](https://github.com/RossWang/Aria2-Integration/compare/0.4.0...0.4.1) (2018-12-22)


### Bug Fixes

* Fix an encoding issue ([#8](https://github.com/RossWang/Aria2-Integration/issues/8)) ([5210146](https://github.com/RossWang/Aria2-Integration/commit/5210146))



# [0.4.0](https://github.com/RossWang/Aria2-Integration/compare/0.3.6...0.4.0) (2018-12-20)


### Bug Fixes

* automatically close browser action popup ([#47](https://github.com/RossWang/Aria2-Integration/issues/47)) ([2a7a4cd](https://github.com/RossWang/Aria2-Integration/commit/2a7a4cd))
* Download url not urlencoding parentheses ([a8fbdf3](https://github.com/RossWang/Aria2-Integration/commit/a8fbdf3)), closes [#36](https://github.com/RossWang/Aria2-Integration/issues/36)
* Fix a file name encoding issue ([989912b](https://github.com/RossWang/Aria2-Integration/commit/989912b)), closes [#8](https://github.com/RossWang/Aria2-Integration/issues/8)
* Fix link in about page ([311701f](https://github.com/RossWang/Aria2-Integration/commit/311701f)), closes [#38](https://github.com/RossWang/Aria2-Integration/issues/38)
* It will no longer trigger notification from other sources ([cf9660e](https://github.com/RossWang/Aria2-Integration/commit/cf9660e)), closes [#42](https://github.com/RossWang/Aria2-Integration/issues/42)


### Features

* Downloads trigger from context menu can now display the file name ([#45](https://github.com/RossWang/Aria2-Integration/issues/45)) ([383280e](https://github.com/RossWang/Aria2-Integration/commit/383280e))
* update AriaNg to 1.0.0 ([ccb10aa](https://github.com/RossWang/Aria2-Integration/commit/ccb10aa))



## [0.3.6](https://github.com/RossWang/Aria2-Integration/compare/0.3.5...0.3.6) (2018-07-17)


### Bug Fixes

* filter setting cannot be saved([#31](https://github.com/RossWang/Aria2-Integration/issues/31)) ([6957f35](https://github.com/RossWang/Aria2-Integration/commit/6957f35))
* Fix a file name encoding issue on baidupcs.com ([#8](https://github.com/RossWang/Aria2-Integration/issues/8)) ([b675908](https://github.com/RossWang/Aria2-Integration/commit/b675908))


### Features

* Add Aria2 Status in About Page ([#22](https://github.com/RossWang/Aria2-Integration/issues/22)) ([a253dd9](https://github.com/RossWang/Aria2-Integration/commit/a253dd9))
* Optionally Skip Confirmation Window ([#30](https://github.com/RossWang/Aria2-Integration/issues/30)) ([b1eaa3e](https://github.com/RossWang/Aria2-Integration/commit/b1eaa3e))



## [0.3.5](https://github.com/RossWang/Aria2-Integration/compare/0.3.4...0.3.5) (2018-06-27)


### Bug Fixes

* filter setting cannot be saved([#31](https://github.com/RossWang/Aria2-Integration/issues/31)) ([1a37956](https://github.com/RossWang/Aria2-Integration/commit/1a37956))



## [0.3.4](https://github.com/RossWang/Aria2-Integration/compare/0.3.3...0.3.4) (2018-03-10)


### Bug Fixes

* Fix an issue that prevents triggering the download([#22](https://github.com/RossWang/Aria2-Integration/issues/22)) ([3bedcd2](https://github.com/RossWang/Aria2-Integration/commit/3bedcd2))


### Features

* update AriaNg to 0.4.0 ([3fafaf1](https://github.com/RossWang/Aria2-Integration/commit/3fafaf1))



## [0.3.3](https://github.com/RossWang/Aria2-Integration/compare/0.3.2...0.3.3) (2018-02-24)


### Bug Fixes

* Fix a mistake that make https and wss protocols unusable ([9db649e](https://github.com/RossWang/Aria2-Integration/commit/9db649e)), closes [#20](https://github.com/RossWang/Aria2-Integration/issues/20)


### Features

* Context menu now has sub-menu to select the RPC server. ([06687f9](https://github.com/RossWang/Aria2-Integration/commit/06687f9))



## [0.3.2](https://github.com/RossWang/Aria2-Integration/compare/0.3.1...0.3.2) (2018-01-24)


### Bug Fixes

* Fix "Save" and "Save as" buttons. ([1728fc2](https://github.com/RossWang/Aria2-Integration/commit/1728fc2))
* parameterized-uri --> false(force) ([ec035d4](https://github.com/RossWang/Aria2-Integration/commit/ec035d4)), closes [#12](https://github.com/RossWang/Aria2-Integration/issues/12)



## [0.3.1](https://github.com/RossWang/Aria2-Integration/compare/0.3.0...0.3.1) (2018-01-22)


### Bug Fixes

* Fix a problem that prevents the download from Context Menu when "Display Download Panel" in settings turn off. ([2e76e0b](https://github.com/RossWang/Aria2-Integration/commit/2e76e0b))



# [0.3.0](https://github.com/RossWang/Aria2-Integration/compare/0.2.4...0.3.0) (2018-01-22)


### Bug Fixes

* RSS will not trigger the download anymore ([ab6ff78](https://github.com/RossWang/Aria2-Integration/commit/ab6ff78)), closes [#15](https://github.com/RossWang/Aria2-Integration/issues/15)


### Features

* Exception Support ([01f8902](https://github.com/RossWang/Aria2-Integration/commit/01f8902))
* Incognito Download Support ([1bc9483](https://github.com/RossWang/Aria2-Integration/commit/1bc9483))
* Simple Multiple Server Support ([19d4b4f](https://github.com/RossWang/Aria2-Integration/commit/19d4b4f)), closes [#2](https://github.com/RossWang/Aria2-Integration/issues/2)
* User Agent Support ([bd335a7](https://github.com/RossWang/Aria2-Integration/commit/bd335a7))
* User-Agent Settings ([2eb03df](https://github.com/RossWang/Aria2-Integration/commit/2eb03df))



## [0.2.4](https://github.com/RossWang/Aria2-Integration/compare/0.2.3...0.2.4) (2017-12-13)


### Bug Fixes

* Fix a font-size issue on Linux ([feecd9b](https://github.com/RossWang/Aria2-Integration/commit/feecd9b)), closes [#9](https://github.com/RossWang/Aria2-Integration/issues/9)
* Verify the file name before download. ([463db18](https://github.com/RossWang/Aria2-Integration/commit/463db18)), closes [#10](https://github.com/RossWang/Aria2-Integration/issues/10)



## [0.2.3](https://github.com/RossWang/Aria2-Integration/compare/0.2.2...0.2.3) (2017-12-02)


### Bug Fixes

* Fix a mistake about the download completed sound ([1f386ed](https://github.com/RossWang/Aria2-Integration/commit/1f386ed))



## [0.2.2](https://github.com/RossWang/Aria2-Integration/compare/0.2.1...0.2.2) (2017-11-22)


### Bug Fixes

* Fix A File Name Parsing Issue ([98c07f5](https://github.com/RossWang/Aria2-Integration/commit/98c07f5))


### Features

* 'Authorization' Header Support For Auto Observer ([3cff2a2](https://github.com/RossWang/Aria2-Integration/commit/3cff2a2))
* Add an option to disable Download Panel for the context menu downloads. ([b4e6a40](https://github.com/RossWang/Aria2-Integration/commit/b4e6a40)), closes [#7](https://github.com/RossWang/Aria2-Integration/issues/7)
* Add download complete notification ([628bfc5](https://github.com/RossWang/Aria2-Integration/commit/628bfc5))
* Close notifications after two seconds ([3acedbc](https://github.com/RossWang/Aria2-Integration/commit/3acedbc))
* Display Changelog After Update ([71ffefd](https://github.com/RossWang/Aria2-Integration/commit/71ffefd))



## [0.2.1](https://github.com/RossWang/Aria2-Integration/compare/0.2.0...0.2.1) (2017-11-17)


### Bug Fixes

* fix "AriaNg's RPC config lost after clear browser history" ([b5e8dd8](https://github.com/RossWang/Aria2-Integration/commit/b5e8dd8)), closes [#4](https://github.com/RossWang/Aria2-Integration/issues/4)


### Features

* Add cookie support for context menu download ([6437d01](https://github.com/RossWang/Aria2-Integration/commit/6437d01)), closes [#5](https://github.com/RossWang/Aria2-Integration/issues/5)
* Add WebSocket Support ([3ed829f](https://github.com/RossWang/Aria2-Integration/commit/3ed829f))



# [0.2.0](https://github.com/RossWang/Aria2-Integration/compare/426de63...0.2.0) (2017-11-01)


### Bug Fixes

* exclude xhtml ([426de63](https://github.com/RossWang/Aria2-Integration/commit/426de63))
* fix for addons.mozilla.org ([7c03ef3](https://github.com/RossWang/Aria2-Integration/commit/7c03ef3))



