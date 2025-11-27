#!/bin/bash

# Script to generate extension icons from SVG source
# Usage: ./scripts/generate-icons.sh

set -e

echo "Generating ArcIntegration icons..."

# Create output directories
mkdir -p assets/icons
mkdir -p assets/icons/disabled

# Generate normal icons
for size in 16 32 48 64 128 256; do
  echo "  Generating ${size}x${size} normal icon..."
  magick assets/logo.svg -resize ${size}x${size} assets/icons/icon-${size}.png
  cp assets/icons/icon-${size}.png src/extension/data/icons/${size}.png
done

# Generate disabled icons
for size in 16 32 48 64 128 256; do
  echo "  Generating ${size}x${size} disabled icon..."
  magick assets/logo-disabled.svg -resize ${size}x${size} assets/icons/disabled/icon-${size}.png
  cp assets/icons/disabled/icon-${size}.png src/extension/data/icons/disabled/${size}.png
done

echo "✓ All icons generated successfully!"
echo ""
echo "Icons saved to:"
echo "  - assets/icons/ (source PNG files)"
echo "  - src/extension/data/icons/ (extension icons)"
