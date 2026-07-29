#!/usr/bin/env node
const { execSync } = require('child_process');
const { readFileSync } = require('fs');

const fetch = globalThis.fetch || require('node-fetch');

function log(...args) {
  console.log('[smoke-demo]', ...args);
}

async function main() {
  try {
    log('Loading backend env from artifacts/api-server/.env');
    let env = {};
    try {
      const raw = readFileSync('artifacts/api-server/.env', 'utf8');
      raw.split(/\n+/).forEach((line) => {
        const m = line.match(/^\s*([A-Z0-9_]+)=(.*)$/);
        if (m) env[m[1]] = m[2];
      });
    } catch (e) {
      // ignore
    }

    log('Running demo seed (this may take a few seconds)');
    execSync('set -a && source artifacts/api-server/.env && DEMO_MODE=true pnpm --filter @workspace/db run seed:demo', { stdio: 'inherit', shell: '/bin/bash' });

    log('Checking backend demo status...');
    const statusRes = await fetch('http://127.0.0.1:8080/api/demo/status');
    const statusJson = await statusRes.json();
    log('/api/demo/status ->', statusRes.status, JSON.stringify(statusJson));
    if (!statusJson.enabled) throw new Error('demo/status not enabled');

    log('Requesting demo login tokens...');
    const loginRes = await fetch('http://127.0.0.1:8080/api/demo/login', { method: 'POST' });
    const loginJson = await loginRes.json();
    log('/api/demo/login ->', loginRes.status);
    if (!loginJson.access_token) throw new Error('demo login did not return access_token');
    // Verify protected route via dev-only demo header (x-demo: 1)
    log('Checking protected route /api/user/stats with x-demo header...');
    const statsRes = await fetch('http://127.0.0.1:8080/api/user/stats', { headers: { 'x-demo': '1' } });
    const statsJson = await statsRes.json().catch(() => ({}));
    log('/api/user/stats ->', statsRes.status, JSON.stringify(statsJson));
    if (statsRes.status !== 200) throw new Error('/api/user/stats failed');

    log('Checking frontend root...');
    const frontRes = await fetch('http://127.0.0.1:5173/');
    log('frontend status', frontRes.status);
    if (frontRes.status !== 200) throw new Error('frontend root not 200');

    log('Smoke checks passed. Demo token length:', String(loginJson.access_token).length);
    process.exit(0);
  } catch (err) {
    console.error('[smoke-demo] ERROR:', err && (err.stack || err.message || err));
    process.exit(2);
  }
}

main();
