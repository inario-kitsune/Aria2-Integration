# ArcIntegration Assets

This directory contains the design assets for the ArcIntegration browser extension.

## Logo Design

The ArcIntegration logo features a stylized letter "A" with an arc at the bottom, representing the integration between the browser and Aria2.

### Design Elements

- **Letter A**: Constructed from two triangular legs and a horizontal bar
- **Arc**: A curved line at the bottom replacing the traditional base of the letter A
- **Colors**:
  - Background: `#2c3e50` (dark blue-gray)
  - Letter A: `#3498db` (blue)
  - Arc: `#e74c3c` (red accent)

### Files

- `logo.svg` - Main logo in SVG format (active state)
- `logo-disabled.svg` - Grayscale version for disabled state
- `icons/` - Generated PNG icons in various sizes (16, 32, 48, 64, 128, 256)
- `icons/disabled/` - Grayscale PNG icons for disabled state

## Regenerating Icons

If you modify the SVG files, regenerate the PNG icons using:

```bash
./scripts/generate-icons.sh
```

This requires ImageMagick to be installed:

```bash
brew install imagemagick
```

## Icon Sizes

The extension uses the following icon sizes:

- **16x16**: Toolbar icon (small displays)
- **32x32**: Toolbar icon (standard displays)
- **48x48**: Extension management page
- **64x64**: Toolbar icon (retina displays)
- **128x128**: Extension management page (retina)
- **256x256**: High-resolution displays and app stores

## License

Same license as the main project (MIT).
