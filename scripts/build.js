#!/usr/bin/env node

import * as esbuild from "esbuild";
import {
  mkdirSync,
  existsSync,
  cpSync,
  rmSync,
  writeFileSync,
  readFileSync,
} from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "..");

// Directories
const srcExtension = join(rootDir, "src/extension");
const distDir = join(rootDir, "dist");
const distLib = join(distDir, "lib");

const isWatch = process.argv.includes("--watch");
const isMinify = process.argv.includes("--minify");
const isSourcemap = process.argv.includes("--sourcemap");

// Sync fields from package.json to manifest.json
function syncVersion() {
  const packageJson = JSON.parse(
    readFileSync(join(rootDir, "package.json"), "utf-8"),
  );
  const manifestPath = join(srcExtension, "manifest.json");
  const manifest = JSON.parse(readFileSync(manifestPath, "utf-8"));

  let changed = false;

  // Sync version
  if (manifest.version !== packageJson.version) {
    console.log(
      `Syncing version: ${manifest.version} -> ${packageJson.version}`,
    );
    manifest.version = packageJson.version;
    changed = true;
  }

  // Sync homepage_url
  if (packageJson.homepage && manifest.homepage_url !== packageJson.homepage) {
    console.log(
      `Syncing homepage_url: ${manifest.homepage_url} -> ${packageJson.homepage}`,
    );
    manifest.homepage_url = packageJson.homepage;
    changed = true;
  }

  if (changed) {
    writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
    console.log("✓ Manifest synced with package.json");
  }
}

// Clean and create dist directory
function prepareDist() {
  if (existsSync(distDir)) {
    rmSync(distDir, { recursive: true });
  }
  mkdirSync(distDir, { recursive: true });
  mkdirSync(distLib, { recursive: true });
}

// Copy extension files to dist
function copyExtension() {
  console.log("Copying extension files to dist...");

  // Copy src/extension to dist
  cpSync(srcExtension, distDir, { recursive: true });

  // Remove old lib files that are no longer needed (if any exist)
  const oldLibFiles = ["aria.js", "polygoat.js", "jschardet.min.js"];
  for (const file of oldLibFiles) {
    const filePath = join(distLib, file);
    if (existsSync(filePath)) {
      rmSync(filePath);
    }
  }

  // Copy Svelte Web UI build to dist
  const webuiDist = join(rootDir, "webui/dist");
  const webuiTarget = join(distDir, "data/webui");
  if (existsSync(webuiDist)) {
    console.log("Copying Svelte Web UI...");
    cpSync(webuiDist, webuiTarget, { recursive: true });
    console.log("✓ Svelte Web UI copied");
  } else {
    console.warn(
      "⚠ Warning: webui/dist not found, run 'pnpm build:webui' first",
    );
  }

  console.log("✓ Extension files copied");
}

// Common build options
const commonOptions = {
  bundle: true,
  target: ["firefox57", "chrome58"],
  minify: isMinify,
  sourcemap: isSourcemap,
  define: {
    "process.env.NODE_ENV": '"production"',
  },
};

// Build configurations
const builds = [
  {
    entryPoints: [join(rootDir, "src/lib/aria2-client.js")],
    outfile: join(distLib, "aria2.bundle.js"),
    format: "iife",
    globalName: "Aria2Module",
    footer: {
      js: "var Aria2Client = Aria2Module.Aria2Client; var createAria2Client = Aria2Module.createAria2Client;",
    },
  },
  {
    entryPoints: [join(rootDir, "src/lib/encoding.js")],
    outfile: join(distLib, "encoding.bundle.js"),
    format: "iife",
    globalName: "EncodingModule",
    footer: {
      js: "var decodeFilename = EncodingModule.decodeFilename; var detectEncoding = EncodingModule.detectEncoding;",
    },
  },
];

// Main build function
async function build() {
  console.log("Building extension...\n");

  try {
    // Step 1: Sync version
    syncVersion();

    // Step 2: Prepare dist directory
    prepareDist();

    // Step 3: Copy extension files
    copyExtension();

    // Step 4: Build JS bundles
    console.log("\nBuilding JavaScript bundles...");
    for (const config of builds) {
      await esbuild.build({
        ...commonOptions,
        ...config,
      });
      console.log(`✓ Built ${config.outfile.split("/").pop()}`);
    }

    console.log("\n✓ Build completed successfully!");
    console.log(`\nExtension ready in: ${distDir}`);
    console.log(
      "To load in Firefox: about:debugging -> This Firefox -> Load Temporary Add-on -> select dist/manifest.json",
    );
  } catch (err) {
    console.error("\n✗ Build failed:", err);
    process.exit(1);
  }
}

// Watch mode - builds to src/extension/lib for development
async function watch() {
  console.log("Watch mode: Building to src/extension/lib for development...\n");

  const devLibDir = join(srcExtension, "lib");
  if (!existsSync(devLibDir)) {
    mkdirSync(devLibDir, { recursive: true });
  }

  const devBuilds = builds.map((config) => ({
    ...config,
    outfile: config.outfile.replace(distLib, devLibDir),
  }));

  for (const config of devBuilds) {
    const ctx = await esbuild.context({
      ...commonOptions,
      ...config,
    });
    await ctx.watch();
    console.log(`Watching ${config.entryPoints[0].split("/").pop()}`);
  }

  console.log("\nDevelopment build ready in: src/extension");
  console.log(
    "Load in Firefox: about:debugging -> This Firefox -> Load Temporary Add-on -> select src/extension/manifest.json",
  );
}

// Run
if (isWatch) {
  watch();
} else {
  build();
}
