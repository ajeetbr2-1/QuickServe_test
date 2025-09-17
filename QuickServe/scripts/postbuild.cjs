// Copy runtime config (config.js) into the built output so it's served in production.
// Works cross-platform on Vercel and local machines.

const fs = require('fs');
const path = require('path');

const root = process.cwd();
const src = path.join(root, 'config.js');
const outDir = path.join(root, 'dist');
const dest = path.join(outDir, 'config.js');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function copyFile(from, to) {
  fs.copyFileSync(from, to);
  console.log(`[postbuild] Copied ${path.relative(root, from)} -> ${path.relative(root, to)}`);
}

try {
  if (!fs.existsSync(src)) {
    console.warn('[postbuild] Skipped: config.js not found at project root.');
    process.exit(0);
  }
  ensureDir(outDir);
  copyFile(src, dest);
} catch (err) {
  console.error('[postbuild] Failed to copy config.js:', err);
  process.exit(1);
}

