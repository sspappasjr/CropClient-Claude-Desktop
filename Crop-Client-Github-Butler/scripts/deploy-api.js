// DEPLOY-API — Deploy CropClient API to production server
// Butler skill script — reusable for any version
// Created: March 2, 2026
//
// This skill handles the PUSH side of deployment:
//   alpha (local) → git push → server git pull + iisreset
//
// USAGE:
//   node deploy-api.js                  (defaults to current version)
//   node deploy-api.js --version 2.0    (specify version)
//   node deploy-api.js --dry-run        (show what would happen, don't do it)
//
// PREREQUISITES:
//   - Alpha repo already has the latest files (run api-deploy bat first)
//   - Git credentials configured
//   - For server step: RDP access to 184.168.20.205
//
// TOKEN CHAIN:
//   1. VERIFY   — check alpha has the right files
//   2. COMMIT   — git add + commit in alpha
//   3. PUSH     — git push to GitHub
//   4. STATUS   — confirm push succeeded
//   5. NOTIFY   — remind to run server-deploy on the server
//
// web.config PAIR RULE:
//   web.config = production (IIS requires this exact name)
//   web(version).config = exact copy as version snapshot
//   They MUST always stay in sync.

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// --- CONFIG (update per version) ---
const VERSION = '2.0';
const ALPHA = 'C:\\AICode\\crop-client-services';
const ALPHA_API = path.join(ALPHA, 'api-server');
const SERVER_FILE = `APIServer${VERSION}.js`;
const WEB_CONFIG = 'web.config';
const WEB_VERSION = `web${VERSION}.config`;
const API_PORT = 3101;
const SERVER_IP = '184.168.20.205';
const DOMAIN = 'api.cropclient.com';

// --- Parse args ---
const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');

function run(cmd, cwd) {
  console.log('  > ' + cmd);
  if (DRY_RUN) { console.log('  [DRY RUN — skipped]'); return { ok: true }; }
  try {
    const out = execSync(cmd, { cwd, encoding: 'utf8', timeout: 60000 });
    if (out.trim()) console.log('  ' + out.trim());
    return { ok: true, output: out };
  } catch (e) {
    console.log('  ERROR: ' + e.message);
    return { ok: false, error: e.message };
  }
}

function fileExists(filepath) {
  return fs.existsSync(filepath);
}

async function deployAPI() {
  console.log(`\n=== DEPLOY-API v${VERSION} ===`);
  if (DRY_RUN) console.log('*** DRY RUN MODE — no changes will be made ***');
  console.log('');

  // Token 1: VERIFY
  console.log(`[1/5] VERIFY — checking alpha files`);
  const checks = [
    path.join(ALPHA_API, SERVER_FILE),
    path.join(ALPHA_API, WEB_CONFIG),
    path.join(ALPHA_API, WEB_VERSION)
  ];
  let allGood = true;
  for (const f of checks) {
    if (fileExists(f)) {
      console.log(`  [OK] ${path.basename(f)}`);
    } else {
      console.log(`  [MISSING] ${f}`);
      allGood = false;
    }
  }
  // Verify web.config pair is in sync
  if (fileExists(checks[1]) && fileExists(checks[2])) {
    const wc = fs.readFileSync(checks[1], 'utf8');
    const wv = fs.readFileSync(checks[2], 'utf8');
    if (wc === wv) {
      console.log(`  [OK] web.config and ${WEB_VERSION} are in sync`);
    } else {
      console.log(`  [WARN] web.config and ${WEB_VERSION} are NOT in sync!`);
      allGood = false;
    }
  }
  if (!allGood) { console.log('\nVERIFY FAILED — fix issues before deploying.'); return; }
  console.log('');

  // Token 2: COMMIT
  console.log('[2/5] COMMIT — staging and committing');
  run('git add .', ALPHA);
  const msg = `Deploy v${VERSION} — APIServer${VERSION} to production`;
  run(`git commit -m "${msg}"`, ALPHA);
  console.log('');

  // Token 3: PUSH
  console.log('[3/5] PUSH — pushing to GitHub');
  const push = run('git push', ALPHA);
  if (!push.ok) { console.log('PUSH FAILED — check git credentials.'); return; }
  console.log('');

  // Token 4: STATUS
  console.log('[4/5] STATUS — verifying push');
  run('git log --oneline -1', ALPHA);
  run('git status --short', ALPHA);
  console.log('');

  // Token 5: NOTIFY
  console.log('[5/5] NOTIFY');
  console.log('  ==========================================');
  console.log(`  GitHub is updated with v${VERSION}`);
  console.log('  ==========================================');
  console.log('');
  console.log('  NEXT — Run on the server:');
  console.log(`    RDP to ${SERVER_IP}`);
  console.log(`    Double-click: server-deploy${VERSION}.bat`);
  console.log('    Or run:');
  console.log('      cd /d C:\\Crop-Client-Services\\api-server');
  console.log('      git pull');
  console.log('      iisreset');
  console.log('');
  console.log('  THEN VERIFY:');
  console.log(`    https://${DOMAIN}/ping`);
  console.log(`    https://${DOMAIN}/tools`);
  console.log('  ==========================================');
}

deployAPI();
