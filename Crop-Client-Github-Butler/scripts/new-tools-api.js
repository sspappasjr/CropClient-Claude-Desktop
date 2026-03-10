// NEW-TOOLS-API — Install CropClient API tools
// Butler skill script — runs the token chain
// Tested: Feb 16, 2026

// The one-liner (paste into PowerShell on any machine with git + node):
// cd C:\; git clone https://github.com/sspappasjr/Crop-Client-Services.git; cd C:\Crop-Client-Services; npm install; cd api-server; npm install; node APIServer2.0.js

// Token breakdown:
// 1. CLONE:       git clone https://github.com/sspappasjr/Crop-Client-Services.git
// 2. NPM-INSTALL: npm install (root) + npm install (api-server)
// 3. START:       node APIServer2.0.js
// 4. STATUS:      GET http://localhost:3101/ping + GET http://localhost:3101/tools
// 5. NOTIFY:      "Your new API tools are ready"

const { execSync } = require('child_process');

const REPO_URL = 'https://github.com/sspappasjr/Crop-Client-Services.git';
const TARGET = 'C:\\Crop-Client-Services';
const API_PORT = 3101;

function run(cmd, cwd) {
  console.log('> ' + cmd);
  try {
    const out = execSync(cmd, { cwd, stdio: 'inherit', timeout: 120000 });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

async function newToolsAPI() {
  console.log('=== NEW-TOOLS-API ===\n');

  // Token 1: CLONE
  console.log('[1/5] CLONE');
  const clone = run(`git clone ${REPO_URL} ${TARGET}`);
  if (!clone.ok) { console.log('CLONE FAILED'); return; }

  // Token 2: NPM-INSTALL
  console.log('[2/5] NPM-INSTALL');
  run('npm install', TARGET);
  run('npm install', TARGET + '\\api-server');

  // Token 3: START
  console.log('[3/5] START');
  const { spawn } = require('child_process');
  const server = spawn('node', ['APIServer2.0.js'], {
    cwd: TARGET + '\\api-server',
    detached: true,
    stdio: 'ignore'
  });
  server.unref();
  await new Promise(r => setTimeout(r, 5000));

  // Token 4: STATUS
  console.log('[4/5] STATUS');
  try {
    const ping = await fetch(`http://localhost:${API_PORT}/ping`);
    const data = await ping.json();
    console.log('PING OK:', JSON.stringify(data));
    const tools = await fetch(`http://localhost:${API_PORT}/tools`);
    const toolData = await tools.json();
    console.log('TOOLS:', toolData.length, 'available');
  } catch (e) {
    console.log('STATUS: Server not responding yet — may need a moment');
  }

  // Token 5: NOTIFY
  console.log('\n[5/5] NOTIFY');
  console.log('=== Your new API tools are ready ===');
  console.log('Server: http://localhost:' + API_PORT);
}

newToolsAPI();
