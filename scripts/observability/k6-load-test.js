import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';
import { randomString, randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

// Custom metrics
const errorRate = new Rate('error_rate');
const responseTime = new Trend('response_time');
const requestCount = new Counter('request_count');

// Configuration
const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';
const API_KEY = __ENV.API_KEY || 'your-api-key-here';

// Test scenarios configuration
export const options = {
  scenarios: {
    // Constant load test
    constant_load: {
      executor: 'constant-vus',
      vus: 10,
      duration: '5m',
      tags: { scenario: 'constant_load' },
    },

    // Spike test
    spike_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 5 },
        { duration: '1m', target: 50 },
        { duration: '30s', target: 5 },
        { duration: '30s', target: 0 },
      ],
      tags: { scenario: 'spike_test' },
    },

    // Stress test
    stress_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 20 },
        { duration: '5m', target: 20 },
        { duration: '2m', target: 40 },
        { duration: '5m', target: 40 },
        { duration: '2m', target: 0 },
      ],
      tags: { scenario: 'stress_test' },
    },

    // Soak test (long duration, moderate load)
    soak_test: {
      executor: 'constant-vus',
      vus: 15,
      duration: '10m',
      tags: { scenario: 'soak_test' },
    },
  },

  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    http_req_failed: ['rate<0.1'],    // Error rate should be less than 10%
    error_rate: ['rate<0.05'],        // Custom error rate should be less than 5%
  },
};

// Common headers
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${API_KEY}`,
  'User-Agent': 'k6-load-test/1.0',
};

// Helper function to generate request ID
function generateRequestId() {
  return `req_${randomString(16)}`;
}

// Helper function to make HTTP requests with observability
function makeRequest(method, endpoint, payload = null, description = '') {
  const requestId = generateRequestId();
  const requestHeaders = {
    ...headers,
    'X-Request-ID': requestId,
    'X-Test-Scenario': __ENV.SCENARIO || 'default',
  };

  const startTime = Date.now();
  let response;

  try {
    if (payload) {
      response = http.request(method, `${BASE_URL}${endpoint}`, JSON.stringify(payload), {
        headers: requestHeaders,
        tags: {
          endpoint: endpoint,
          method: method,
          description: description,
          request_id: requestId,
        },
      });
    } else {
      response = http.request(method, `${BASE_URL}${endpoint}`, null, {
        headers: requestHeaders,
        tags: {
          endpoint: endpoint,
          method: method,
          description: description,
          request_id: requestId,
        },
      });
    }

    const duration = Date.now() - startTime;
    responseTime.add(duration);
    requestCount.add(1);

    // Check response
    const success = check(response, {
      [`${description} - status is 2xx`]: (r) => r.status >= 200 && r.status < 300,
      [`${description} - response time < 1000ms`]: (r) => r.timings.duration < 1000,
      [`${description} - has response body`]: (r) => r.body && r.body.length > 0,
    });

    if (!success) {
      errorRate.add(1);
      console.error(`Request failed: ${method} ${endpoint} - Status: ${response.status}`);
    } else {
      errorRate.add(0);
    }

    return response;
  } catch (error) {
    console.error(`Request error: ${method} ${endpoint} - ${error.message}`);
    errorRate.add(1);
    requestCount.add(1);
    return null;
  }
}

// Authentication simulation
function simulateAuth() {
  const scenarios = [
    // Successful login
    () => makeRequest('POST', '/api/auth/login', {
      username: `user_${randomIntBetween(1, 1000)}`,
      password: 'password123',
      remember_me: Math.random() > 0.5,
    }, 'User Login'),

    // Failed login (wrong password)
    () => makeRequest('POST', '/api/auth/login', {
      username: `user_${randomIntBetween(1, 1000)}`,
      password: 'wrongpassword',
    }, 'Failed Login'),

    // Token refresh
    () => makeRequest('POST', '/api/auth/refresh', {
      refresh_token: `token_${randomString(32)}`,
    }, 'Token Refresh'),

    // Logout
    () => makeRequest('POST', '/api/auth/logout', {}, 'User Logout'),
  ];

  const scenario = scenarios[randomIntBetween(0, scenarios.length - 1)];
  scenario();
}

// CRUD operations simulation
function simulateCrud() {
  const operations = [
    // Create user
    () => makeRequest('POST', '/api/users', {
      name: `User ${randomString(8)}`,
      email: `user_${randomString(8)}@example.com`,
      age: randomIntBetween(18, 80),
      department: ['Engineering', 'Marketing', 'Sales', 'HR'][randomIntBetween(0, 3)],
      active: Math.random() > 0.2,
    }, 'Create User'),

    // Get user
    () => makeRequest('GET', `/api/users/${randomIntBetween(1, 1000)}`, null, 'Get User'),

    // List users with pagination
    () => makeRequest('GET', `/api/users?page=${randomIntBetween(1, 10)}&limit=${randomIntBetween(10, 50)}`, null, 'List Users'),

    // Update user
    () => makeRequest('PUT', `/api/users/${randomIntBetween(1, 100)}`, {
      name: `Updated User ${randomString(6)}`,
      email: `updated_${randomString(6)}@example.com`,
      active: Math.random() > 0.3,
    }, 'Update User'),

    // Delete user
    () => makeRequest('DELETE', `/api/users/${randomIntBetween(1, 100)}`, null, 'Delete User'),
  ];

  const operation = operations[randomIntBetween(0, operations.length - 1)];
  operation();
}

// Search operations simulation
function simulateSearch() {
  const searchTerms = ['john', 'admin', 'test', 'user', 'manager', 'developer', 'engineer', 'analyst'];
  const term = searchTerms[randomIntBetween(0, searchTerms.length - 1)];

  const searches = [
    () => makeRequest('GET', `/api/search?q=${term}&limit=${randomIntBetween(10, 50)}`, null, 'Global Search'),
    () => makeRequest('GET', `/api/users/search?query=${term}&type=name`, null, 'User Search'),
    () => makeRequest('GET', `/api/users/search?query=${term}&type=email`, null, 'Email Search'),
  ];

  const search = searches[randomIntBetween(0, searches.length - 1)];
  search();
}

// File operations simulation
function simulateFiles() {
  const operations = [
    // Upload file (simulated)
    () => makeRequest('POST', '/api/files/upload', {
      filename: `document_${randomString(8)}.pdf`,
      size: randomIntBetween(1000, 10000),
      type: 'application/pdf',
      content_hash: randomString(32),
    }, 'File Upload'),

    // Download file
    () => makeRequest('GET', `/api/files/${randomIntBetween(1, 100)}/download`, null, 'File Download'),

    // Get file metadata
    () => makeRequest('GET', `/api/files/${randomIntBetween(1, 100)}/metadata`, null, 'File Metadata'),

    // List files
    () => makeRequest('GET', `/api/files?page=${randomIntBetween(1, 5)}&limit=${randomIntBetween(10, 30)}`, null, 'List Files'),
  ];

  const operation = operations[randomIntBetween(0, operations.length - 1)];
  operation();
}

// Error scenarios simulation
function simulateErrors() {
  const errorScenarios = [
    // 404 errors
    () => makeRequest('GET', `/api/users/${randomIntBetween(99999, 999999)}`, null, 'Non-existent User'),
    () => makeRequest('GET', '/api/nonexistent/endpoint', null, 'Non-existent Endpoint'),

    // 400 errors (bad requests)
    () => makeRequest('POST', '/api/users', {
      name: '', // Invalid empty name
      email: 'invalid-email', // Invalid email format
    }, 'Invalid User Data'),

    // 403 errors (forbidden)
    () => makeRequest('DELETE', '/api/admin/system', null, 'Forbidden Admin Operation'),

    // Timeout simulation (long-running request)
    () => makeRequest('GET', '/api/slow-endpoint?delay=5000', null, 'Slow Endpoint'),
  ];

  const scenario = errorScenarios[randomIntBetween(0, errorScenarios.length - 1)];
  scenario();
}

// Database-heavy operations simulation
function simulateDatabase() {
  const operations = [
    // Analytics queries
    () => makeRequest('GET', `/api/analytics/users?start_date=2024-01-01&end_date=2024-12-31&group_by=month`, null, 'User Analytics'),
    () => makeRequest('GET', `/api/reports/monthly?year=2024&month=${randomIntBetween(1, 12)}`, null, 'Monthly Report'),
    () => makeRequest('GET', '/api/dashboard/stats', null, 'Dashboard Stats'),

    // Bulk operations
    () => makeRequest('POST', '/api/users/bulk', {
      users: Array.from({ length: randomIntBetween(5, 20) }, (_, i) => ({
        name: `Bulk User ${i + 1}`,
        email: `bulk${i + 1}_${randomString(4)}@example.com`,
        age: randomIntBetween(20, 60),
      })),
    }, 'Bulk User Creation'),

    () => makeRequest('PUT', '/api/users/bulk-update', {
      ids: Array.from({ length: randomIntBetween(3, 10) }, () => randomIntBetween(1, 100)),
      updates: { status: 'active', last_updated: new Date().toISOString() },
    }, 'Bulk User Update'),
  ];

  const operation = operations[randomIntBetween(0, operations.length - 1)];
  operation();
}

// External API simulation
function simulateExternalApis() {
  const operations = [
    // Payment processing
    () => makeRequest('POST', '/api/payments/process', {
      amount: randomIntBetween(10, 1000),
      currency: 'USD',
      payment_method: 'card',
      customer_id: `cust_${randomString(8)}`,
    }, 'Payment Processing'),

    // Email notifications
    () => makeRequest('POST', '/api/notifications/email', {
      to: `user_${randomString(6)}@example.com`,
      subject: `Notification ${randomString(8)}`,
      template: ['welcome', 'reset_password', 'invoice', 'reminder'][randomIntBetween(0, 3)],
    }, 'Email Notification'),

    // Third-party integrations
    () => makeRequest('GET', '/api/integrations/slack/channels', null, 'Slack Integration'),
    () => makeRequest('POST', '/api/integrations/webhook', {
      url: `https://example.com/webhook/${randomString(8)}`,
      event: ['user.created', 'user.updated', 'payment.completed'][randomIntBetween(0, 2)],
    }, 'Webhook Registration'),
  ];

  const operation = operations[randomIntBetween(0, operations.length - 1)];
  operation();
}

// Main test function
export default function () {
  // Simulate different types of operations with weighted distribution
  const operationTypes = [
    { weight: 30, fn: simulateCrud },      // 30% CRUD operations
    { weight: 20, fn: simulateAuth },      // 20% Authentication
    { weight: 15, fn: simulateSearch },    // 15% Search operations
    { weight: 10, fn: simulateFiles },     // 10% File operations
    { weight: 10, fn: simulateDatabase },  // 10% Database operations
    { weight: 10, fn: simulateExternalApis }, // 10% External APIs
    { weight: 5, fn: simulateErrors },     // 5% Error scenarios
  ];

  // Calculate cumulative weights
  let cumulativeWeight = 0;
  const weightedOperations = operationTypes.map(op => {
    cumulativeWeight += op.weight;
    return { ...op, cumulativeWeight };
  });

  // Select operation based on weight
  const random = randomIntBetween(1, 100);
  const selectedOperation = weightedOperations.find(op => random <= op.cumulativeWeight);

  if (selectedOperation) {
    selectedOperation.fn();
  }

  // Add realistic delay between requests
  sleep(randomIntBetween(1, 3));
}

// Setup function (runs once per VU)
export function setup() {
  console.log(`Starting load test against ${BASE_URL}`);
  console.log(`Test scenarios: ${Object.keys(options.scenarios).join(', ')}`);

  // Health check
  const healthResponse = http.get(`${BASE_URL}/health`);
  if (healthResponse.status !== 200) {
    console.warn(`Health check failed: ${healthResponse.status}`);
  }

  return { baseUrl: BASE_URL };
}

// Teardown function (runs once after all VUs finish)
export function teardown(data) {
  console.log('Load test completed');
  console.log(`Base URL: ${data.baseUrl}`);
}