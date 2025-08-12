# Observability Data Generation Scripts

This directory contains scripts for generating observability data (logs, metrics, and traces) for testing and demonstration purposes.

## Scripts Overview

### 1. curl-scripts.sh
A comprehensive bash script that uses curl to simulate various API operations and generate observability data.

**Features:**
- Authentication flows (login, logout, token refresh)
- CRUD operations (Create, Read, Update, Delete)
- Search operations
- File operations (upload, download, metadata)
- Error scenarios (404, 400, 401, 403, 429, 500)
- Database-heavy operations
- External API integrations
- Colored output and detailed logging
- Request ID generation for tracing

**Usage:**
```bash
# Run all scenarios
./curl-scripts.sh

# Run specific scenarios
./curl-scripts.sh auth      # Authentication only
./curl-scripts.sh crud      # CRUD operations only
./curl-scripts.sh errors    # Error scenarios only
./curl-scripts.sh database  # Database operations only

# Set custom base URL and API key
BASE_URL=https://api.example.com API_KEY=your-key ./curl-scripts.sh
```

### 2. k6-load-test.js
A sophisticated k6 load testing script that generates realistic traffic patterns and observability data.

**Features:**
- Multiple test scenarios (constant load, spike test, stress test, soak test)
- Weighted operation distribution
- Custom metrics collection
- Realistic user behavior simulation
- Request correlation with unique IDs
- Comprehensive error handling and reporting

**Usage:**
```bash
# Install k6 first
# On macOS: brew install k6
# On Ubuntu: sudo apt install k6

# Run with default settings
k6 run k6-load-test.js

# Run with custom configuration
BASE_URL=https://api.example.com API_KEY=your-key k6 run k6-load-test.js

# Run specific scenario only
k6 run --env SCENARIO=constant_load k6-load-test.js
```

### 3. k6-scenarios.js
Advanced k6 script focused on realistic user journeys and business metrics.

**Features:**
- Complete user journey simulation (login → browse → search → purchase → logout)
- Health check monitoring
- Background load simulation
- Peak traffic patterns
- Business metrics tracking (registrations, orders, payments)
- Multiple execution scenarios

**Usage:**
```bash
# Run all scenarios
k6 run k6-scenarios.js

# Run specific scenario
SCENARIO=user_journey k6 run k6-scenarios.js
SCENARIO=health_check k6 run k6-scenarios.js
SCENARIO=background_load k6 run k6-scenarios.js
SCENARIO=peak_traffic k6 run k6-scenarios.js

# With environment configuration
BASE_URL=https://api.example.com ENVIRONMENT=production REGION=us-west-2 k6 run k6-scenarios.js
```

## Configuration

### Environment Variables

All scripts support the following environment variables:

- `BASE_URL`: Target API base URL (default: http://localhost:8080)
- `API_KEY`: API authentication key (default: test-api-key)
- `ENVIRONMENT`: Environment name for tagging (default: test)
- `REGION`: Region identifier for tagging (default: us-east-1)

### curl-scripts.sh Configuration

Edit the script to modify:
- Request delays and timing
- Data payloads and user information
- Error simulation frequency
- Operation weights and distribution

### k6 Scripts Configuration

Modify the `options` object in each script to adjust:
- Virtual user counts
- Test duration
- Ramp-up/ramp-down patterns
- Performance thresholds
- Scenario weights

## Observability Data Generated

### Logs
- Structured request/response logs
- Error logs with stack traces
- Authentication events
- Business operation logs
- Performance timing logs

### Metrics
- Request count and rate
- Response time percentiles
- Error rates by endpoint
- Business metrics (registrations, orders, payments)
- System resource utilization

### Traces
- End-to-end request tracing
- Database query spans
- External API call spans
- User journey traces
- Error propagation traces

## Integration with Monitoring Systems

These scripts are designed to work with:

- **OpenTelemetry**: Automatic trace and metric collection
- **Prometheus**: Metrics scraping and alerting
- **Grafana**: Dashboards and visualization
- **Jaeger/Zipkin**: Distributed tracing
- **ELK Stack**: Log aggregation and analysis
- **DataDog/New Relic**: APM and monitoring

## Best Practices

1. **Start Small**: Begin with low load and gradually increase
2. **Monitor Resources**: Watch CPU, memory, and network usage
3. **Use Realistic Data**: Generate data that matches production patterns
4. **Correlate Events**: Use request IDs to trace requests across systems
5. **Test Error Scenarios**: Include failure cases in your testing
6. **Document Baselines**: Record normal performance metrics
7. **Clean Up**: Remove test data after testing

## Troubleshooting

### Common Issues

1. **Connection Refused**: Ensure target service is running
2. **Authentication Errors**: Verify API key configuration
3. **Rate Limiting**: Reduce request frequency or implement backoff
4. **Memory Issues**: Lower virtual user count in k6 tests
5. **DNS Resolution**: Use IP addresses if DNS is problematic

### Debugging

Enable verbose output:
```bash
# curl scripts
set -x  # Add to script for debug mode

# k6 scripts
k6 run --verbose k6-load-test.js
```

## Examples

### Generate 1 hour of realistic traffic
```bash
# Terminal 1: Background load
k6 run --duration 1h --vus 5 k6-scenarios.js

# Terminal 2: Periodic health checks
while true; do
  SCENARIO=health_check k6 run --duration 1m --vus 1 k6-scenarios.js
  sleep 300  # Every 5 minutes
done

# Terminal 3: Simulate peak traffic every 15 minutes
while true; do
  sleep 900  # Wait 15 minutes
  SCENARIO=peak_traffic k6 run --duration 5m --vus 20 k6-scenarios.js
done
```

### Test error handling
```bash
# Generate various error scenarios
./curl-scripts.sh errors

# Load test with high error rate
BASE_URL=http://unreliable-service:8080 k6 run k6-load-test.js
```

### Monitor service during deployment
```bash
# Continuous health monitoring during deployment
while true; do
  ./curl-scripts.sh health
  sleep 10
done
```

## Contributing

To add new scenarios or improve existing ones:

1. Follow existing patterns for request structure
2. Add appropriate error handling
3. Include relevant tags and metadata
4. Update documentation
5. Test with various load levels

## License

These scripts are provided as examples for testing and demonstration purposes. Modify as needed for your specific use case.