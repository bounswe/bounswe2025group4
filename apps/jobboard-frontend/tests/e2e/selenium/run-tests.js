/**
 * Dynamic Test Runner for Selenium E2E Tests
 *
 * Automatically discovers and runs all test files in the specs/ directory.
 * Test files must:
 * - End with .test.ts or .test.js
 * - Export a 'testName' string
 * - Export a 'runTest()' async function that returns boolean
 *
 * Usage:
 *   node tests/e2e/selenium/run-tests.js                    # Run all tests
 *   node tests/e2e/selenium/run-tests.js workplace          # Run tests matching pattern
 *   node tests/e2e/selenium/run-tests.js 01-workplace       # Run specific test
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readdir, stat } from 'fs/promises';
import { config } from './config/test.config.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Recursively find all test files in a directory
 */
async function findTestFiles(dir, pattern = null) {
  const testFiles = [];

  async function scanDirectory(currentDir) {
    try {
      const entries = await readdir(currentDir);

      for (const entry of entries) {
        const fullPath = join(currentDir, entry);
        const stats = await stat(fullPath);

        if (stats.isDirectory()) {
          // Recursively scan subdirectories
          await scanDirectory(fullPath);
        } else if (stats.isFile() && entry.endsWith('.test.ts')) {
          // Check if file matches pattern (if provided)
          if (!pattern || fullPath.includes(pattern)) {
            testFiles.push(fullPath);
          }
        }
      }
    } catch (error) {
      console.error(`Error scanning directory ${currentDir}:`, error.message);
    }
  }

  await scanDirectory(dir);
  return testFiles.sort(); // Sort for consistent execution order
}

/**
 * Load and execute a test file
 */
async function runTestFile(testFilePath) {
  try {
    // Convert Windows path to file URL
    const fileUrl = `file:///${testFilePath.replace(/\\/g, '/')}`;

    // Dynamic import of the test module
    const testModule = await import(fileUrl);

    // Validate test module exports
    if (!testModule.testName || typeof testModule.testName !== 'string') {
      console.error(`⚠ Test file ${testFilePath} does not export 'testName'`);
      return { name: testFilePath, passed: false, skipped: true };
    }

    if (!testModule.runTest || typeof testModule.runTest !== 'function') {
      console.error(`⚠ Test file ${testFilePath} does not export 'runTest()' function`);
      return { name: testModule.testName, passed: false, skipped: true };
    }

    // Run the test
    const startTime = Date.now();
    const passed = await testModule.runTest();
    const duration = Date.now() - startTime;

    return {
      name: testModule.testName,
      passed,
      skipped: false,
      duration,
      file: testFilePath,
    };
  } catch (error) {
    console.error(`\n❌ Error loading/running test file: ${testFilePath}`);
    console.error('Error:', error.message);
    console.error();

    return {
      name: testFilePath,
      passed: false,
      skipped: false,
      error: error.message,
    };
  }
}

/**
 * Format duration in human-readable format
 */
function formatDuration(ms) {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
  return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
}

/**
 * Main test runner
 */
async function main() {
  const args = process.argv.slice(2);
  const pattern = args[0] || null;

  console.log('\n╔════════════════════════════════════════════════════╗');
  console.log('║      Selenium E2E Test Suite - Dynamic Runner    ║');
  console.log('╚════════════════════════════════════════════════════╝\n');

  console.log('Configuration:');
  console.log(`  Base URL:  ${config.baseUrl}`);
  console.log(`  API URL:   ${config.apiUrl}`);
  console.log(`  Headless:  ${config.headless}`);
  console.log(`  Browser:   ${config.browserWidth}x${config.browserHeight}`);
  if (pattern) {
    console.log(`  Filter:    "${pattern}"`);
  }
  console.log();

  // Find all test files
  const specsDir = join(__dirname, 'specs');
  console.log(`Discovering test files in: ${specsDir}`);

  const testFiles = await findTestFiles(specsDir, pattern);

  if (testFiles.length === 0) {
    console.log('\n⚠ No test files found!');
    if (pattern) {
      console.log(`Try running without the filter "${pattern}"`);
    }
    console.log('\nTest files must:');
    console.log('  - Be located in specs/ directory');
    console.log('  - End with .test.ts');
    console.log('  - Export "testName" and "runTest()" function');
    console.log();
    process.exit(1);
  }

  console.log(`Found ${testFiles.length} test file(s):\n`);
  testFiles.forEach((file, index) => {
    const relativePath = file.replace(__dirname, '').replace(/\\/g, '/');
    console.log(`  ${index + 1}. ${relativePath}`);
  });
  console.log();

  // Run all tests
  console.log('╔════════════════════════════════════════════════════╗');
  console.log('║              Running Tests                        ║');
  console.log('╚════════════════════════════════════════════════════╝\n');

  const testResults = [];
  const startTime = Date.now();

  for (let i = 0; i < testFiles.length; i++) {
    const testFile = testFiles[i];
    console.log(`\n[${ i + 1}/${testFiles.length}] Running test...`);
    console.log('─'.repeat(60));

    const result = await runTestFile(testFile);
    testResults.push(result);

    console.log('─'.repeat(60));
    if (result.skipped) {
      console.log(`⊘ SKIPPED: ${result.name}`);
    } else if (result.passed) {
      console.log(`✓ PASSED: ${result.name} (${formatDuration(result.duration)})`);
    } else {
      console.log(`✗ FAILED: ${result.name}`);
    }
    console.log();
  }

  const totalDuration = Date.now() - startTime;

  // Print summary
  console.log('\n╔════════════════════════════════════════════════════╗');
  console.log('║              Test Results Summary                 ║');
  console.log('╚════════════════════════════════════════════════════╝\n');

  const passed = testResults.filter((r) => r.passed && !r.skipped);
  const failed = testResults.filter((r) => !r.passed && !r.skipped);
  const skipped = testResults.filter((r) => r.skipped);

  // Detailed results
  if (passed.length > 0) {
    console.log('✓ Passed Tests:');
    passed.forEach((r) => {
      console.log(`  ✓ ${r.name} (${formatDuration(r.duration)})`);
    });
    console.log();
  }

  if (failed.length > 0) {
    console.log('✗ Failed Tests:');
    failed.forEach((r) => {
      console.log(`  ✗ ${r.name}`);
      if (r.error) {
        console.log(`    Error: ${r.error}`);
      }
    });
    console.log();
  }

  if (skipped.length > 0) {
    console.log('⊘ Skipped Tests:');
    skipped.forEach((r) => {
      console.log(`  ⊘ ${r.name}`);
    });
    console.log();
  }

  // Summary statistics
  console.log('─'.repeat(60));
  console.log(`Total Tests:    ${testResults.length}`);
  console.log(`Passed:         ${passed.length} ✓`);
  console.log(`Failed:         ${failed.length} ✗`);
  console.log(`Skipped:        ${skipped.length} ⊘`);
  console.log(`Total Duration: ${formatDuration(totalDuration)}`);
  console.log('─'.repeat(60));

  // Screenshots notice
  if (failed.length > 0) {
    console.log('\n💡 Tip: Check screenshots/ directory for failure screenshots');
  }

  // Exit with appropriate code
  const exitCode = failed.length > 0 ? 1 : 0;

  if (exitCode === 0) {
    console.log('\n🎉 All tests passed!\n');
  } else {
    console.log(`\n❌ ${failed.length} test(s) failed.\n`);
  }

  process.exit(exitCode);
}

/**
 * Handle uncaught errors
 */
process.on('unhandledRejection', (error) => {
  console.error('\n❌ Unhandled Promise Rejection:');
  console.error(error);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('\n❌ Uncaught Exception:');
  console.error(error);
  process.exit(1);
});

// Run the test suite
main().catch((error) => {
  console.error('\n❌ Fatal error in test runner:');
  console.error(error);
  process.exit(1);
});
