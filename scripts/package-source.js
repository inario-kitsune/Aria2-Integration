#!/usr/bin/env node

/**
 * Package source code for Mozilla Add-ons review submission
 *
 * This script creates a zip file containing only the source code needed
 * for Mozilla reviewers to build and verify the extension.
 *
 * Includes:
 * - Source code (src/)
 * - Build scripts (scripts/)
 * - Configuration files (package.json, etc.)
 * - Documentation (README.md, BUILD_INSTRUCTIONS.md, etc.)
 *
 * Excludes:
 * - node_modules/
 * - dist/
 * - sample/
 * - .git/
 * - *.zip files
 * - IDE and OS files
 */

import { execSync } from "child_process";
import { existsSync, rmSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "..");
const outputFile = join(rootDir, "arc-integration-source.zip");

// Files and directories to include in the source package
const includePatterns = [
  "src/",
  "scripts/",
  "webui/",
  "assets/",
  "package.json",
  "pnpm-lock.yaml",
  "README.md",
  "BUILD_INSTRUCTIONS.md",
  "PACKAGING.md",
  "CHANGELOG.md",
  "LICENSE",
  "THIRDPARTY.md",
  ".gitignore",
  ".gitmodules",
];

console.log("Packaging source code for Mozilla Add-ons review...\n");

// Remove existing source package if it exists
if (existsSync(outputFile)) {
  console.log("Removing existing source package...");
  rmSync(outputFile);
}

try {
  // Create zip file with included patterns
  console.log("Creating source package...");
  console.log("\nIncluded files and directories:");
  includePatterns.forEach((pattern) => console.log(`  - ${pattern}`));

  // Build the zip command with exclusions
  const excludePatterns = [
    "*.DS_Store",
    "__MACOSX/*",
    "webui/node_modules/*",
    "webui/dist/*",
  ];

  const excludeArgs = excludePatterns
    .map((pattern) => `-x "${pattern}"`)
    .join(" ");
  const zipCommand = `cd "${rootDir}" && zip -r arc-integration-source.zip ${includePatterns.join(" ")} ${excludeArgs}`;

  execSync(zipCommand, { stdio: "inherit" });

  console.log("\n✓ Source package created successfully!");
  console.log(`\nOutput: ${outputFile}`);
  console.log("\nThis package is ready for Mozilla Add-ons review submission.");
  console.log(
    "Reviewers can extract and build using the instructions in BUILD_INSTRUCTIONS.md",
  );
} catch (err) {
  console.error("\n✗ Failed to create source package:", err.message);
  process.exit(1);
}
