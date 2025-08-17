#!/usr/bin/env node

/**
 * Script to package privakit and install it in the test app
 * This allows testing the library as if it were installed from npm
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const testAppDir = path.join(__dirname, 'test-app');

console.log('🔧 Packaging privakit for local testing...\n');

try {
  // Step 1: Build the library
  console.log('📦 Building privakit...');
  process.chdir(rootDir);
  execSync('npm run build', { stdio: 'inherit' });
  
  // Step 2: Pack the library
  console.log('\n📦 Creating package tarball...');
  const packResult = execSync('npm pack', { encoding: 'utf-8' });
  
  // Extract just the tarball filename from the output
  const lines = packResult.trim().split('\n');
  const tarballName = lines[lines.length - 1].trim(); // Last line should be the tarball name
  console.log(`📦 Created tarball: ${tarballName}`);
  
  const tarballPath = path.join(rootDir, tarballName);
  
  // Verify the tarball exists
  if (!fs.existsSync(tarballPath)) {
    throw new Error(`Tarball not found: ${tarballPath}`);
  }
  
  // Step 3: Install in test app
  console.log('\n📦 Installing in test app...');
  process.chdir(testAppDir);
  
  // Remove existing privakit installation if any
  try {
    execSync('npm uninstall privakit', { stdio: 'pipe' });
  } catch (e) {
    // Ignore if package wasn't installed
  }
  
  // Install from local tarball
  execSync(`npm install "${tarballPath}"`, { stdio: 'inherit' });
  
  // Step 4: Clean up
  console.log('\n🧹 Cleaning up...');
  fs.unlinkSync(tarballPath);
  
  console.log('\n✅ Successfully packaged and installed privakit in test app!');
  console.log('🚀 You can now run "npm run dev" in the test-app directory to start testing.');
  
} catch (error) {
  console.error('\n❌ Error during packaging/installation:', error.message);
  process.exit(1);
}