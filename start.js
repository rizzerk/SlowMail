#!/usr/bin/env node
const { execFileSync } = require('child_process');
const path = require('path');

const expoBin = path.join(__dirname, 'node_modules', '.bin', 'expo');
try {
  execFileSync('node', [expoBin, 'start', '--port', '8081'], { stdio: 'inherit', cwd: __dirname });
} catch (e) {}
