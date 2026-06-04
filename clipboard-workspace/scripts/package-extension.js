/**
 * Package script for Chrome Extension integration.
 *
 * 1. Runs `npm run build:extension` to ensure workspace is up-to-date.
 * 2. Zips the `extension/` directory into a distributable file.
 *
 * Usage: npm run package
 */

import { execSync } from "child_process";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { readFileSync, existsSync, rmSync } from "fs";
import AdmZip from "adm-zip";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const EXT_DIR = resolve(ROOT, "extension");

// 1. Build the extension first
console.log("📦 Running build:extension...");
execSync("npm run build:extension", { cwd: ROOT, stdio: "inherit" });

// 2. Read version from manifest
const manifestPath = resolve(EXT_DIR, "manifest.json");
const manifestStr = readFileSync(manifestPath, "utf-8");
const manifest = JSON.parse(manifestStr);
const version = manifest.version || "1.0.0";

const zipFileName = `clipboard-workspace-v${version}.zip`;
const zipFilePath = resolve(ROOT, zipFileName);

// Clean previous zip if it exists
if (existsSync(zipFilePath)) {
  rmSync(zipFilePath, { force: true });
}

console.log(`\n🗜️ Packaging extension into ${zipFileName}...`);

// 3. Create zip file
const zip = new AdmZip();

// Add the extension folder contents to the root of the zip
zip.addLocalFolder(EXT_DIR);

zip.writeZip(zipFilePath);

console.log("✅ Packaging complete!");
console.log(`   → ${zipFilePath}`);
console.log("\nYou can now distribute this .zip file or load it into any browser.\n");
