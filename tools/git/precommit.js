#!/usr/bin/env node
const { execSync, spawnSync } = require('child_process');
const path = require('path');

function getStagedFiles() {
  const out = execSync('git diff --cached --name-only --no-renames', { encoding: 'utf8' }).trim();
  if (!out) return [];
  return out.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
}

function main() {
  const staged = getStagedFiles();
  // Reject node_modules or .env
  const forbidden = staged.find(f => {
    const normalized = f.replace(/\\/g, '/');
    return normalized.split('/').includes('node_modules') || path.basename(normalized).startsWith('.env');
  });
  if (forbidden) {
    console.error('\n✖ Commit blocked: trying to add forbidden file or folder:', forbidden);
    console.error('  - Do not commit node_modules or .env. Use .gitignore and secrets store.');
    process.exit(1);
  }

  // Only run quick related tests for staged backend source files.
  const backendFiles = staged
    .map(f => f.replace(/\\/g, '/'))
    .filter(f => f.startsWith('backend/') && /\.(js|jsx|ts|tsx)$/.test(f))
    .map(f => f.replace(/^backend\//, ''));

  if (backendFiles.length === 0) {
    process.exit(0);
  }

  // Allow skipping tests via env var SKIP_PRECOMMIT_TESTS=true
  if (process.env.SKIP_PRECOMMIT_TESTS === 'true') {
    console.log('→ SKIP_PRECOMMIT_TESTS=true, skipping pre-commit tests');
    process.exit(0);
  }

  // Run related tests in backend (fast)
  try {
    const args = ['test', '--', '--findRelatedTests', ...backendFiles];
    console.log('→ Running quick related tests for staged files in backend...');
    const res = spawnSync('npm', ['--prefix', 'backend', ...args], { stdio: 'inherit' });
    process.exit(res.status);
  } catch (err) {
    console.error('✖ Error running pre-commit tests:', err);
    process.exit(1);
  }
}

main();
