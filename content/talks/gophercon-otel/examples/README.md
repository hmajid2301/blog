## Quick Start

```bash
nix develop

make dev

# Create a user
curl -X POST http://localhost:8080/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Alice Johnson", "email": "alice@example.com"}'

# Get the user (use the ID from above response)
curl http://localhost:8080/api/v1/users/1

# Health check
curl http://localhost:8080/health

# Run the load test script (generate traffic)
./scripts/load-test.sh
```

## Access

- **User Service**: http://localhost:8080
- **Grafana**: http://localhost:3000 (admin/admin) - Dashboards and queries
- **Alloy UI**: http://localhost:12345 - Collector status
