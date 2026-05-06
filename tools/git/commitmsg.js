#!/usr/bin/env node
const fs = require('fs');

const msgFile = process.argv[2];
if (!msgFile) process.exit(0);
const msg = fs.readFileSync(msgFile, 'utf8').trim();
if (!msg) {
  console.error('✖ Empty commit message');
  process.exit(1);
}

// Simple conventional-commit style check
const re = /^(feat|fix|chore|docs|refactor|test|perf|ci|style|revert)(\([\w\-\s]+\))?:\s.+/;
if (!re.test(msg)) {
  console.error('\n✖ Commit message does not follow the convention:');
  console.error("  type(scope?): subject — example: 'feat(auth): add login route'");
  process.exit(1);
}

// Limit subject to 72 chars
const firstLine = msg.split('\n')[0];
if (firstLine.length > 72) {
  console.error('\n✖ Commit subject too long (max 72 chars):', firstLine.length);
  process.exit(1);
}

process.exit(0);
