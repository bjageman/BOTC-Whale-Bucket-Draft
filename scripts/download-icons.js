import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ICONS_DIR = path.join(__dirname, '../public/icons');
const TEMP_ZIP = path.join(__dirname, '../temp-botc-icons.zip');
const TEMP_EXTRACT_DIR = path.join(__dirname, '../temp-botc-icons-extract');
const ZIP_URL = 'https://github.com/tomozbot/botc-icons/archive/refs/heads/main.zip';

function cleanup() {
  console.log('[Icons] Cleaning up temporary files...');
  if (fs.existsSync(TEMP_ZIP)) {
    fs.unlinkSync(TEMP_ZIP);
  }
  if (fs.existsSync(TEMP_EXTRACT_DIR)) {
    fs.rmSync(TEMP_EXTRACT_DIR, { recursive: true, force: true });
  }
}

function main() {
  // 1. Check if icons already exist
  if (fs.existsSync(ICONS_DIR)) {
    const files = fs.readdirSync(ICONS_DIR).filter(file => file.endsWith('.svg'));
    if (files.length > 100) {
      console.log(`[Icons] Found ${files.length} icons in public/icons. Skipping download.`);
      process.exit(0);
    }
  }

  console.log('[Icons] Icons not found or incomplete. Downloading from botc-icons (approx. 72MB)...');

  // Ensure directories
  if (!fs.existsSync(ICONS_DIR)) {
    fs.mkdirSync(ICONS_DIR, { recursive: true });
  }

  try {
    // 2. Download ZIP file using curl
    console.log('[Icons] Downloading zip archive...');
    execSync(`curl -sL "${ZIP_URL}" -o "${TEMP_ZIP}"`);

    console.log('[Icons] Download complete. Extracting SVG icons...');
    // 3. Extract SVG folder only
    if (fs.existsSync(TEMP_EXTRACT_DIR)) {
      fs.rmSync(TEMP_EXTRACT_DIR, { recursive: true, force: true });
    }
    fs.mkdirSync(TEMP_EXTRACT_DIR, { recursive: true });

    execSync(`unzip -q -o "${TEMP_ZIP}" "botc-icons-main/SVG/*" -d "${TEMP_EXTRACT_DIR}"`);

    const svgSrcDir = path.join(TEMP_EXTRACT_DIR, 'botc-icons-main/SVG');
    if (!fs.existsSync(svgSrcDir)) {
      throw new Error('SVG directory not found in extracted files.');
    }

    // 4. Move files to public/icons, normalizing filenames
    const files = fs.readdirSync(svgSrcDir);
    let count = 0;
    for (const filename of files) {
      if (filename.endsWith('.svg')) {
        const srcPath = path.join(svgSrcDir, filename);
        // Normalize filename to lowercase alphanumeric
        const normalizedName = filename.toLowerCase().replace(/[^a-z0-9.]/g, '');
        const destPath = path.join(ICONS_DIR, normalizedName);
        fs.copyFileSync(srcPath, destPath);
        count++;
      }
    }

    console.log(`[Icons] Successfully extracted and normalized ${count} icons to public/icons.`);
  } catch (error) {
    console.error('[Icons] Process failed:', error.message);
    process.exit(1);
  } finally {
    cleanup();
  }
}

main();
