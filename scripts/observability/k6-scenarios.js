import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter, Gauge } from 'k6/metrics';
import { randomString, randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

// Custom metrics for observability
const customMetrics = {
  errorRate: new Rate('custom_error_rate'),
  responseTime: new Trend('custom_response_time'),
  requestCount: new Counter('custom_request_count'),
  activeUsers: new Gauge('active_users'),
  businessMetrics: {
    userRegistrations: new Counter('user_registrations'),
    ordersProcessed: new Counter('orders_processed'),
    paymentFailures: new Counter('payment_failures'),
    searchQueries: new Counter('search_queries'),
  }
};

// Configuration
const config = {
  baseUrl: __ENV.BASE_URL || 'http://localhost:8080',
  apiKey: __ENV.API_KEY || 'test-api-key',
  environment: __ENV.ENVIRONMENT || 'test',
  region: __ENV.REGION || 'us-east-1',
};

// Scenario-specific configurations
export const options = {
  scenarios: {
    // User journey simulation
    user_journey: {
      executor: 'per-vu-iterations',
      vus: 5,
      iterations: 10,
      maxDuration: '10m',
      tags: { scenario: 'user_journey' },
    },

    // API health monitoring
    health_check: {
      executor: 'constant-arrival-rate',
      rate: 1, // 1 request per second
      timeUnit: '1s',
      duration: '5m',
      preAllocatedVUs: 2,
      tags: { scenario: 'health_check' },
    },

    // Background load simulation
    background_load: {
      executor: 'constant-vus',
      vus: 3,
      duration: '8m',
      tags: { scenario: 'background_load' },
    },

    // Peak traffic simulation
    peak_traffic: {
      executor: 'ramping-arrival-rate',
      startRate: 5,
      timeUnit: '1s',
      preAllocatedVUs: 10,
      maxVUs: 50,
      stages: [
        { duration: '1m', target: 10 },
        { duration: '2m', target: 20 },
        { duration: '1m', target: 50 },
        { duration: '2m', target: 20 },
        { duration: '1m', target: 5 },
      ],
      tags: { scenario: 'peak_traffic' },
    },
  },

  thresholds: {
    http_req_duration: ['p(95)<1000', 'p(99)<2000'],
    http_req_failed: ['rate<0.05'],
    custom_error_rate: ['rate<0.03'],
    custom_response_time: ['p(95)<800'],
  },
};

// Common request configuration
function getRequestConfig(tags = {}) {
  return {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
      'X-Request-ID': `req_${randomString(16)}`,
      'X-Environment': config.environment,
      'X-Region': config.region,
      'User-Agent': 'k6-observability-test/1.0',
    },
    tags: {
      environment: config.environment,
      region: config.region,
      ...tags,
    },
  };
}

// Enhanced request wrapper with observability
function observableRequest(method, endpoint, payload = null, description = '', tags = {}) {
  const startTime = Date.now();
  const requestConfig = getRequestConfig({
    endpoint: endpoint,
    method: method,
    description: description,
    ...tags
  });

  let response;
  try {
    if (payload) {
      response = http.request(method, `${config.baseUrl}${endpoint}`, JSON.stringify(payload), requestConfig);
    } else {
      response = http.request(method, `${config.baseUrl}${endpoint}`, null, requestConfig);
    }

    // Record custom metrics
    const duration = Date.now() - startTime;
    customMetrics.responseTime.add(duration, { endpoint: endpoint });
    customMetrics.requestCount.add(1, { endpoint: endpoint, method: method });

    // Check response and record errors
    const isSuccess = response.status >= 200 && response.status < 300;
    customMetrics.errorRate.add(isSuccess ? 0 : 1, { endpoint: endpoint });

    // Standard checks
    check(response, {
      [`${description} - status is 2xx`]: (r) => r.status >= 200 && r.status < 300,
      [`${description} - response time < 2000ms`]: (r) => r.timings.duration < 2000,
      [`${description} - has content-type header`]: (r) => r.headers['Content-Type'] !== undefined,
    }, { endpoint: endpoint, method: method });

    // Log errors for debugging
    if (!isSuccess) {
      console.error(`Request failed: ${method} ${endpoint} - Status: ${response.status}, Body: ${response.body.substring(0, 200)}`);
    }

    return response;
  } catch (error) {
    console.error(`Request error: ${method} ${endpoint} - ${error.message}`);
    customMetrics.errorRate.add(1, { endpoint: endpoint });
    customMetrics.requestCount.add(1, { endpoint: endpoint, method: method });
    return null;
  }
}

// Complete user journey simulation
export function userJourney() {
  const userId = randomIntBetween(1, 10000);
  const sessionId = `session_${randomString(12)}`;

  // 1. User registration/login
  const loginResponse = observableRequest('POST', '/api/auth/login', {
    username: `user_${userId}`,
    password: 'password123',
    session_id: sessionId,
  }, 'User Login', { journey_step: 'login' });

  if (loginResponse && loginResponse.status === 200) {
    customMetrics.businessMetrics.userRegistrations.add(1);
  }

  sleep(randomIntBetween(1, 3));

  // 2. Browse products/content
  observableRequest('GET', `/api/products?page=1&limit=20&category=electronics`, null, 'Browse Products', { journey_step: 'browse' });
  sleep(randomIntBetween(2, 5));

  // 3. Search functionality
  const searchTerm = ['laptop', 'phone', 'tablet', 'headphones'][randomIntBetween(0, 3)];
  observableRequest('GET', `/api/search?q=${searchTerm}&limit=10`, null, 'Product Search', { journey_step: 'search' });
  customMetrics.businessMetrics.searchQueries.add(1, { term: searchTerm });
  sleep(randomIntBetween(1, 3));

  // 4. View product details
  const productId = randomIntBetween(1, 1000);
  observableRequest('GET', `/api/products/${productId}`, null, 'Product Details', { journey_step: 'product_view' });
  sleep(randomIntBetween(2, 4));

  // 5. Add to cart
  observableRequest('POST', '/api/cart/items', {
    product_id: productId,
    quantity: randomIntBetween(1, 3),
    session_id: sessionId,
  }, 'Add to Cart', { journey_step: 'add_to_cart' });
  sleep(randomIntBetween(1, 2));

  // 6. View cart
  observableRequest('GET', '/api/cart', null, 'View Cart', { journey_step: 'view_cart' });
  sleep(randomIntBetween(1, 3));

  // 7. Checkout process (50% of users complete)
  if (Math.random() > 0.5) {
    const orderResponse = observableRequest('POST', '/api/orders', {
      items: [{ product_id: productId, quantity: 1 }],
      shipping_address: {
        street: '123 Main St',
        city: 'Anytown',
        zip: '12345',
      },
      payment_method: 'credit_card',
    }, 'Create Order', { journey_step: 'checkout' });

    if (orderResponse && orderResponse.status === 201) {
      customMetrics.businessMetrics.ordersProcessed.add(1);

      // 8. Payment processing
      const paymentResponse = observableRequest('POST', '/api/payments/process', {
        order_id: `order_${randomString(8)}`,
        amount: randomIntBetween(50, 500),
        currency: 'USD',
        payment_method: 'card',
      }, 'Process Payment', { journey_step: 'payment' });

      if (paymentResponse && paymentResponse.status >= 400) {
        customMetrics.businessMetrics.paymentFailures.add(1);
      }
    }
  }

  sleep(randomIntBetween(1, 2));

  // 9. Logout
  observableRequest('POST', '/api/auth/logout', { session_id: sessionId }, 'User Logout', { journey_step: 'logout' });
}

// Health check monitoring
export function healthCheck() {
  const endpoints = [
    '/health',
    '/api/health',
    '/api/status',
    '/metrics',
  ];

  endpoints.forEach(endpoint => {
    observableRequest('GET', endpoint, null, `Health Check ${endpoint}`, {
      check_type: 'health',
      endpoint: endpoint
    });
  });

  sleep(1);
}

// Background load simulation
export function backgroundLoad() {
  const operations = [
    // Database queries
    () => observableRequest('GET', '/api/analytics/dashboard', null, 'Dashboard Analytics', { operation_type: 'analytics' }),
    () => observableRequest('GET', `/api/users/${randomIntBetween(1, 1000)}/profile`, null, 'User Profile', { operation_type: 'profile' }),

    // Cache operations
    () => observableRequest('GET', '/api/cache/popular-products', null, 'Popular Products Cache', { operation_type: 'cache' }),
    () => observableRequest('GET', '/api/cache/trending', null, 'Trending Cache', { operation_type: 'cache' }),

    // Background jobs simulation
    () => observableRequest('POST', '/api/jobs/email-digest', { user_id: randomIntBetween(1, 1000) }, 'Email Digest Job', { operation_type: 'background_job' }),
    () => observableRequest('POST', '/api/jobs/data-sync', { sync_type: 'incremental' }, 'Data Sync Job', { operation_type: 'background_job' }),

    // Monitoring endpoints
    () => observableRequest('GET', '/api/system/metrics', null, 'System Metrics', { operation_type: 'monitoring' }),
    () => observableRequest('GET', '/api/system/logs?level=error&limit=10', null, 'Error Logs', { operation_type: 'monitoring' }),
  ];

  const operation = operations[randomIntBetween(0, operations.length - 1)];
  operation();

  sleep(randomIntBetween(2, 8));
}

// Peak traffic simulation
export function peakTraffic() {
  // Simulate high-frequency operations during peak times
  const highFrequencyOps = [
    () => observableRequest('GET', '/api/products/featured', null, 'Featured Products', { traffic_type: 'peak' }),
    () => observableRequest('GET', '/api/deals/flash-sale', null, 'Flash Sale Deals', { traffic_type: 'peak' }),
    () => observableRequest('POST', '/api/cart/quick-add', {
      product_id: randomIntBetween(1, 100),
      quantity: 1,
    }, 'Quick Add to Cart', { traffic_type: 'peak' }),
    () => observableRequest('GET', `/api/inventory/${randomIntBetween(1, 100)}/availability`, null, 'Check Availability', { traffic_type: 'peak' }),
  ];

  const operation = highFrequencyOps[randomIntBetween(0, highFrequencyOps.length - 1)];
  operation();

  // Update active users gauge
  customMetrics.activeUsers.add(randomIntBetween(100, 1000));

  sleep(randomIntBetween(0.5, 2));
}

// Main test function - routes to appropriate scenario
export default function () {
  const scenario = __ENV.SCENARIO || 'user_journey';

  switch (scenario) {
    case 'user_journey':
      userJourney();
      break;
    case 'health_check':
      healthCheck();
      break;
    case 'background_load':
      backgroundLoad();
      break;
    case 'peak_traffic':
      peakTraffic();
      break;
    default:
      // Default mixed load
      const scenarios = [userJourney, backgroundLoad, peakTraffic];
      const selectedScenario = scenarios[randomIntBetween(0, scenarios.length - 1)];
      selectedScenario();
  }
}

// Setup function
export function setup() {
  console.log(`🚀 Starting k6 observability test`);
  console.log(`📊 Base URL: ${config.baseUrl}`);
  console.log(`🌍 Environment: ${config.environment}`);
  console.log(`📍 Region: ${config.region}`);
  console.log(`🎯 Scenarios: ${Object.keys(options.scenarios).join(', ')}`);

  // Verify service availability
  const healthResponse = http.get(`${config.baseUrl}/health`);
  if (healthResponse.status === 200) {
    console.log(`✅ Service health check passed`);
  } else {
    console.warn(`⚠️  Service health check failed: ${healthResponse.status}`);
  }

  return config;
}

// Teardown function
export function teardown(data) {
  console.log(`🏁 k6 observability test completed`);
  console.log(`📈 Check your observability dashboards for:`);
  console.log(`   - Custom metrics: error_rate, response_time, request_count`);
  console.log(`   - Business metrics: user_registrations, orders_processed, payment_failures`);
  console.log(`   - Distributed traces across all endpoints`);
  console.log(`   - Structured logs with correlation IDs`);
}