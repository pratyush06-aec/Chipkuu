/**
 * Build script for Chrome Extension integration.
 *
 * 1. Runs `vite build` to produce the React app in `dist/`
 * 2. Copies the built files into `extension/workspace/`
 *
 * Usage: node scripts/build-extension.js
 */

import { execSync } from "child_process";
import { cpSync, rmSync, existsSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const DIST = resolve(ROOT, "dist");
const EXT_WORKSPACE = resolve(ROOT, "extension", "workspace");

console.log("📦 Building React app...");
execSync("npx vite build", { cwd: ROOT, stdio: "inherit" });

console.log("\n📂 Copying build to extension/workspace/...");

// Clean previous workspace build
if (existsSync(EXT_WORKSPACE)) {
  rmSync(EXT_WORKSPACE, { recursive: true, force: true });
}

mkdirSync(EXT_WORKSPACE, { recursive: true });

// Copy dist → extension/workspace
cpSync(DIST, EXT_WORKSPACE, { recursive: true });

console.log("✅ Extension workspace ready!");
console.log(`   → ${EXT_WORKSPACE}`);
console.log("\n🔄 Reload the extension in chrome://extensions to see changes.\n");
