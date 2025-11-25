/**
 * Postinstall script to ensure chromedriver binary is installed
 * 
 * This script checks if chromedriver.exe exists, and if not, runs the install script.
 * This is needed because pnpm may block chromedriver's install script by default.
 */

import { access, constants } from 'fs/promises';
import { execSync } from 'child_process';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');
const chromedriverPath = join(projectRoot, 'node_modules', 'chromedriver', 'lib', 'chromedriver', 'chromedriver.exe');

try {
  // Check if chromedriver binary exists
  await access(chromedriverPath, constants.F_OK);
  console.log('✓ ChromeDriver binary already installed');
} catch (error) {
  // ChromeDriver binary doesn't exist, install it
  console.log('⚠ ChromeDriver binary not found, installing...');
  try {
    const installScript = join(projectRoot, 'node_modules', 'chromedriver', 'install.js');
    execSync(`node "${installScript}"`, { 
      stdio: 'inherit',
      cwd: projectRoot 
    });
    console.log('✓ ChromeDriver binary installed successfully');
  } catch (installError) {
    console.warn('⚠ Failed to install ChromeDriver automatically. You may need to run:');
    console.warn('  node node_modules/chromedriver/install.js');
    console.warn('Or approve chromedriver scripts with: pnpm approve-builds chromedriver');
  }
}

