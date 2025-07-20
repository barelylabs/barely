#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Check if this is first run
const setupMarker = path.join(__dirname, '..', '.setup-complete');

if (!fs.existsSync(setupMarker)) {
	console.log('\n📦 Tinybird local development detected!');
	console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
	console.log('To set up your local Tinybird environment, run:');
	console.log('\n  👉 pnpm tb:setup\n');
	console.log('This will install everything you need in one command.');
	console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}
