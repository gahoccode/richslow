/**
 * Test Script for API Facade Layer
 *
 * This script validates that the facade layer correctly wraps the generated
 * OpenAPI client and provides a clean, backward-compatible API surface.
 *
 * Run this test with the backend server running:
 * Backend: uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
 * Test: bun run frontend/test-facade-client.js
 */

// Import facade API
import { api } from './lib/api/facade.ts';

// Test configuration
const TEST_TICKER = 'VCB'; // Use VCB (Vietcombank) as test ticker
const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
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

// Test runner
async function runTest(name, testFn) {
  try {
    log('info', `Testing: ${name}`);
    const result = await testFn();
    log('success', `✓ ${name} - PASSED`);
    return { name, status: 'passed', result };
  } catch (error) {
    log('error', `✗ ${name} - FAILED`);
    log('error', error.message);
    return { name, status: 'failed', error: error.message };
  }
}

// Test suite
const tests = [
  // Company API Tests
  {
    name: 'Company Overview API',
    test: async () => {
      const data = await api.company.getOverview(TEST_TICKER);
      if (!data) throw new Error('No data returned');
      if (!data.short_name) throw new Error('Missing short_name field');
      log('info', `Company: ${data.short_name}`);
      return data;
    },
  },
  {
    name: 'Company Profile API',
    test: async () => {
      const data = await api.company.getProfile(TEST_TICKER);
      if (!data) throw new Error('No data returned');
      log('info', `Profile ticker: ${data.ticker || 'N/A'}`);
      return data;
    },
  },
  {
    name: 'Company Shareholders API',
    test: async () => {
      const data = await api.company.getShareholders(TEST_TICKER);
      if (!Array.isArray(data)) throw new Error('Expected array');
      log('info', `Found ${data.length} shareholders`);
      return data;
    },
  },
  {
    name: 'Company Officers API',
    test: async () => {
      const data = await api.company.getOfficers(TEST_TICKER);
      if (!Array.isArray(data)) throw new Error('Expected array');
      log('info', `Found ${data.length} officers`);
      return data;
    },
  },
  {
    name: 'Company Subsidiaries API',
    test: async () => {
      const data = await api.company.getSubsidiaries(TEST_TICKER);
      if (!Array.isArray(data)) throw new Error('Expected array');
      log('info', `Found ${data.length} subsidiaries`);
      return data;
    },
  },
  {
    name: 'Dividend History API',
    test: async () => {
      const data = await api.company.getDividends(TEST_TICKER);
      if (!Array.isArray(data)) throw new Error('Expected array');
      log('info', `Found ${data.length} dividend events`);
      return data;
    },
  },
  {
    name: 'Insider Deals API',
    test: async () => {
      const data = await api.company.getInsiderDeals(TEST_TICKER);
      if (!Array.isArray(data)) throw new Error('Expected array');
      log('info', `Found ${data.length} insider deals`);
      return data;
    },
  },
  {
    name: 'Corporate Events API',
    test: async () => {
      const data = await api.company.getEvents(TEST_TICKER);
      if (!Array.isArray(data)) throw new Error('Expected array');
      log('info', `Found ${data.length} events`);
      return data;
    },
  },
  {
    name: 'Company News API',
    test: async () => {
      const data = await api.company.getNews(TEST_TICKER);
      if (!Array.isArray(data)) throw new Error('Expected array');
      log('info', `Found ${data.length} news items`);
      return data;
    },
  },
  {
    name: 'Company Ratio API',
    test: async () => {
      const data = await api.company.getRatio(TEST_TICKER);
      if (!Array.isArray(data)) throw new Error('Expected array');
      log('info', `Found ${data.length} ratio periods`);
      if (data.length > 0) {
        const latest = data[0];
        log('info', `Latest ratio: Year ${latest.year_report}, PE ${latest.pe || 'N/A'}`);
      }
      return data;
    },
  },

  // Statements API Tests
  {
    name: 'Financial Statements API (Year)',
    test: async () => {
      const data = await api.statements.getStatements(TEST_TICKER, {
        period: 'year',
        years: 3,
      });
      if (!data) throw new Error('No data returned');
      if (!Array.isArray(data.income_statements)) throw new Error('Missing income_statements');
      log('info', `Found ${data.years?.length || 0} years of data`);
      return data;
    },
  },
  {
    name: 'Financial Statements API (Quarter)',
    test: async () => {
      const data = await api.statements.getStatements(TEST_TICKER, {
        period: 'quarter',
        years: 2,
      });
      if (!data) throw new Error('No data returned');
      if (!Array.isArray(data.income_statements)) throw new Error('Missing income_statements');
      log('info', `Found ${data.years?.length || 0} quarters of data`);
      return data;
    },
  },

  // Prices API Tests
  {
    name: 'Stock Prices API',
    test: async () => {
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];
      const data = await api.prices.getStockPrices(TEST_TICKER, startDate, endDate);
      if (!Array.isArray(data)) throw new Error('Expected array');
      log('info', `Found ${data.length} price records`);
      if (data.length > 0) {
        log('info', `Latest close: ${data[data.length - 1].close || 'N/A'}`);
      }
      return data;
    },
  },
  {
    name: 'Exchange Rates API',
    test: async () => {
      const data = await api.prices.getExchangeRates();
      if (!Array.isArray(data)) throw new Error('Expected array');
      log('info', `Found ${data.length} exchange rates`);
      return data;
    },
  },
  {
    name: 'Gold SJC API',
    test: async () => {
      const data = await api.prices.getGoldSJC();
      if (!Array.isArray(data)) throw new Error('Expected array');
      log('info', `Found ${data.length} SJC gold products`);
      return data;
    },
  },
  {
    name: 'Gold BTMC API',
    test: async () => {
      const data = await api.prices.getGoldBTMC();
      if (!Array.isArray(data)) throw new Error('Expected array');
      log('info', `Found ${data.length} BTMC gold products`);
      return data;
    },
  },

  // Quarterly Ratios API Test
  {
    name: 'Quarterly Ratios API',
    test: async () => {
      const data = await api.ratios.getQuarterlyRatios(TEST_TICKER);
      if (!Array.isArray(data)) throw new Error('Expected array');
      log('info', `Found ${data.length} quarterly ratios`);
      if (data.length > 0) {
        const latest = data[0];
        const period = latest.quarter ? `Q${latest.quarter}/${latest.year || 'N/A'}` : `Year ${latest.year_report || 'N/A'}`;
        log('info', `Latest period: ${period}`);
      }
      return data;
    },
  },

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
    name: 'Industry Classifications API',
    test: async () => {
      const data = await api.industry.getClassifications();
      if (typeof data !== 'object') throw new Error('Expected object');
      const count = Object.keys(data).length;
      log('info', `Found ${count} industry classifications`);
      return data;
    },
  },
];

// Main test execution
async function main() {
  console.log('\n' + '='.repeat(80));
  log('info', 'Starting API Facade Layer Tests');
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

  if (failed > 0) {
    console.log('\nFailed Tests:');
    results
      .filter((r) => r.status === 'failed')
      .forEach((r) => {
        log('error', `  - ${r.name}: ${r.error}`);
      });
  }

  console.log('\n' + '='.repeat(80));
  if (failed === 0) {
    log('success', '✓ All tests passed! Facade layer is working correctly.');
  } else {
    log('error', '✗ Some tests failed. Please review the errors above.');
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
