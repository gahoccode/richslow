/**
 * Rate-Limited API Tests
 *
 * ⚠️ WARNING: These tests may be slow and hit vnstock API rate limits
 *
 * These endpoints have been separated because they:
 * - Take 30-60 seconds to complete (Industry Benchmark)
 * - May return HTTP 500 errors when rate limited
 * - Are not critical for core facade layer validation
 * - Slow down the main test suite significantly
 *
 * Run these tests separately when you need to validate rate-limited endpoints:
 *   bun run frontend/tests/facade-rate-limited.test.js
 *
 * Expected behavior:
 * - Industry Benchmark: 30-60 seconds (vnstock API has rate limits)
 * - May intermittently fail with 500 Internal Server Error
 * - Passing these tests confirms the facade layer correctly wraps the endpoints
 */

// Import facade API
import { api } from '../lib/api/facade.ts';

// Test configuration
const TEST_TICKER = 'VCB'; // Use VCB (Vietcombank) as test ticker
const MAX_RETRIES = 2; // Number of retries for rate-limited requests
const RETRY_DELAY_MS = 5000; // Wait 5 seconds between retries

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

// Helper function for logging
function log(level, message, data = null) {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

  let color;
  switch (level) {
    case 'success':
      color = COLORS.green;
      break;
    case 'error':
      color = COLORS.red;
      break;
    case 'info':
      color = COLORS.cyan;
      break;
    case 'warn':
      color = COLORS.yellow;
      break;
    default:
      color = COLORS.reset;
  }

  console.log(`${color}${prefix} ${message}${COLORS.reset}`);
  if (data) {
    console.log(JSON.stringify(data, null, 2));
  }
}

// Sleep function for retry delays
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Test runner with retry logic
async function runTest(name, testFn, retries = MAX_RETRIES) {
  let attempt = 0;
  let lastError = null;

  while (attempt <= retries) {
    try {
      if (attempt > 0) {
        log('warn', `Retry attempt ${attempt}/${retries} for: ${name}`);
        await sleep(RETRY_DELAY_MS);
      } else {
        log('info', `Testing: ${name}`);
      }

      const startTime = Date.now();
      const result = await testFn();
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);

      log('success', `✓ ${name} - PASSED (${duration}s)`);
      return { name, status: 'passed', result, duration };
    } catch (error) {
      lastError = error;

      // Check if it's a rate limit error
      const isRateLimitError =
        error.message.includes('500') ||
        error.message.includes('Internal Server Error') ||
        error.message.includes('rate limit');

      if (isRateLimitError && attempt < retries) {
        log('warn', `Rate limit detected, will retry...`);
        attempt++;
        continue;
      }

      // Max retries reached or non-rate-limit error
      log('error', `✗ ${name} - FAILED (attempt ${attempt + 1}/${retries + 1})`);
      log('error', error.message);
      return { name, status: 'failed', error: error.message, attempts: attempt + 1 };
    }
  }

  // Should never reach here, but just in case
  return {
    name,
    status: 'failed',
    error: lastError?.message || 'Unknown error',
    attempts: retries + 1,
  };
}

// Test suite - Rate-Limited Endpoints
const tests = [
  // Industry API Tests
  {
    name: 'Company Industry Benchmark API',
    test: async () => {
      const data = await api.industry.getCompanyBenchmark(TEST_TICKER);
      if (!data) throw new Error('No data returned');
      if (!data.industry_name) throw new Error('Missing industry_name field');
      log('info', `Industry: ${data.industry_name}`);
      log('info', `Companies analyzed: ${data.companies_analyzed || 0}`);
      return data;
    },
  },
  {
    name: 'Industry Benchmark by ID API',
    test: async () => {
      // Use industry ID 8355 (Banks - from VCB's industry)
      const industryId = 8355;
      const data = await api.industry.getBenchmarkById(industryId);
      if (!data) throw new Error('No data returned');
      if (!data.industry_name) throw new Error('Missing industry_name field');
      log('info', `Industry: ${data.industry_name}`);
      log('info', `Companies analyzed: ${data.companies_analyzed || 0}`);
      return data;
    },
  },
  {
    name: 'Industry Benchmark by Name API',
    test: async () => {
      const industryName = 'Ngân hàng';
      const data = await api.industry.getBenchmarkByName(industryName);
      if (!data) throw new Error('No data returned');
      if (!data.industry_name) throw new Error('Missing industry_name field');
      log('info', `Industry: ${data.industry_name}`);
      log('info', `Companies analyzed: ${data.companies_analyzed || 0}`);
      return data;
    },
  },
];

// Main test execution
async function main() {
  console.log('\n' + '='.repeat(80));
  log('warn', '⚠️  RATE-LIMITED API TESTS');
  log('info', 'These tests may take 1-3 minutes and may fail due to rate limits');
  log('info', `Test Ticker: ${TEST_TICKER}`);
  console.log('='.repeat(80) + '\n');

  const results = [];
  for (const test of tests) {
    const result = await runTest(test.name, test.test);
    results.push(result);
    console.log(''); // Blank line between tests
  }

  // Summary
  console.log('='.repeat(80));
  log('info', 'Test Summary');
  console.log('='.repeat(80));

  const passed = results.filter((r) => r.status === 'passed').length;
  const failed = results.filter((r) => r.status === 'failed').length;
  const total = results.length;

  log('info', `Total Tests: ${total}`);
  log('success', `Passed: ${passed}`);
  if (failed > 0) {
    log('error', `Failed: ${failed}`);
  }

  // Show timing statistics
  const timings = results
    .filter((r) => r.duration)
    .map((r) => parseFloat(r.duration));
  if (timings.length > 0) {
    const totalTime = timings.reduce((a, b) => a + b, 0);
    const avgTime = totalTime / timings.length;
    log('info', `Total time: ${totalTime.toFixed(2)}s`);
    log('info', `Average time per test: ${avgTime.toFixed(2)}s`);
  }

  if (failed > 0) {
    console.log('\nFailed Tests:');
    results
      .filter((r) => r.status === 'failed')
      .forEach((r) => {
        log('error', `  - ${r.name}: ${r.error}`);
        if (r.attempts > 1) {
          log('warn', `    (Failed after ${r.attempts} attempts)`);
        }
      });
  }

  console.log('\n' + '='.repeat(80));
  if (failed === 0) {
    log('success', '✓ All rate-limited tests passed!');
  } else {
    log(
      'warn',
      `⚠️  Some tests failed. This may be due to vnstock API rate limits.`
    );
    log('warn', '   Try running again in a few minutes.');
    process.exit(1);
  }
  console.log('='.repeat(80) + '\n');
}

// Run tests
main().catch((error) => {
  log('error', 'Fatal error running tests');
  console.error(error);
  process.exit(1);
});
