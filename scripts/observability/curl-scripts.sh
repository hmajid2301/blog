#!/bin/bash

# Curl scripts for generating observability data
# These scripts simulate various API calls to generate logs, metrics, and traces

BASE_URL="http://localhost:8080"
API_KEY="your-api-key-here"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✓${NC} $1"
}

error() {
    echo -e "${RED}✗${NC} $1"
}

warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Function to make HTTP requests with error handling
make_request() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4

    log "Making $method request to $endpoint - $description"

    if [ -n "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X "$method" \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $API_KEY" \
            -H "X-Request-ID: $(uuidgen)" \
            -d "$data" \
            "$BASE_URL$endpoint" 2>/dev/null)
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" \
            -H "Authorization: Bearer $API_KEY" \
            -H "X-Request-ID: $(uuidgen)" \
            "$BASE_URL$endpoint" 2>/dev/null)
    fi

    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n -1)

    if [[ $http_code -ge 200 && $http_code -lt 300 ]]; then
        success "$description (HTTP $http_code)"
    elif [[ $http_code -ge 400 && $http_code -lt 500 ]]; then
        warning "$description (HTTP $http_code) - Client Error"
    elif [[ $http_code -ge 500 ]]; then
        error "$description (HTTP $http_code) - Server Error"
    else
        error "$description (HTTP $http_code) - Unknown Error"
    fi

    # Add random delay to simulate realistic usage
    sleep $(echo "scale=2; $RANDOM/32767*2" | bc)
}

# Simulate user authentication
simulate_auth() {
    log "Simulating authentication flows..."

    # Successful login
    make_request "POST" "/api/auth/login" \
        '{"username":"user1","password":"password123"}' \
        "User login (success)"

    # Failed login
    make_request "POST" "/api/auth/login" \
        '{"username":"user1","password":"wrongpassword"}' \
        "User login (failed)"

    # Token refresh
    make_request "POST" "/api/auth/refresh" \
        '{"refresh_token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"}' \
        "Token refresh"

    # Logout
    make_request "POST" "/api/auth/logout" \
        '{}' \
        "User logout"
}

# Simulate CRUD operations
simulate_crud() {
    log "Simulating CRUD operations..."

    # Create operations
    for i in {1..5}; do
        make_request "POST" "/api/users" \
            "{\"name\":\"User $i\",\"email\":\"user$i@example.com\",\"age\":$((20 + RANDOM % 40))}" \
            "Create user $i"
    done

    # Read operations
    for i in {1..10}; do
        make_request "GET" "/api/users/$i" "" "Get user $i"
    done

    # List operations with pagination
    make_request "GET" "/api/users?page=1&limit=10" "" "List users (page 1)"
    make_request "GET" "/api/users?page=2&limit=10" "" "List users (page 2)"

    # Update operations
    for i in {1..3}; do
        make_request "PUT" "/api/users/$i" \
            "{\"name\":\"Updated User $i\",\"email\":\"updated$i@example.com\"}" \
            "Update user $i"
    done

    # Delete operations
    for i in {4..5}; do
        make_request "DELETE" "/api/users/$i" "" "Delete user $i"
    done
}

# Simulate search operations
simulate_search() {
    log "Simulating search operations..."

    local search_terms=("john" "admin" "test" "user" "manager" "developer")

    for term in "${search_terms[@]}"; do
        make_request "GET" "/api/search?q=$term" "" "Search for '$term'"
        make_request "GET" "/api/users/search?query=$term&type=name" "" "User search for '$term'"
    done
}

# Simulate file operations
simulate_files() {
    log "Simulating file operations..."

    # File uploads (simulated)
    for i in {1..3}; do
        make_request "POST" "/api/files/upload" \
            "{\"filename\":\"document$i.pdf\",\"size\":$((1000 + RANDOM % 5000)),\"type\":\"application/pdf\"}" \
            "Upload file document$i.pdf"
    done

    # File downloads
    for i in {1..5}; do
        make_request "GET" "/api/files/$i/download" "" "Download file $i"
    done

    # File metadata
    for i in {1..3}; do
        make_request "GET" "/api/files/$i/metadata" "" "Get file $i metadata"
    done
}

# Simulate error scenarios
simulate_errors() {
    log "Simulating error scenarios..."

    # 404 errors
    make_request "GET" "/api/users/99999" "" "Get non-existent user"
    make_request "GET" "/api/nonexistent/endpoint" "" "Access non-existent endpoint"

    # 400 errors (bad requests)
    make_request "POST" "/api/users" \
        '{"invalid":"json"malformed}' \
        "Create user with malformed JSON"

    make_request "POST" "/api/users" \
        '{"name":"","email":"invalid-email"}' \
        "Create user with invalid data"

    # 401 errors (unauthorized)
    curl -s -X GET "$BASE_URL/api/admin/users" > /dev/null
    warning "Unauthorized access attempt (no auth header)"

    # 403 errors (forbidden)
    make_request "DELETE" "/api/admin/system" "" "Attempt admin operation"

    # 429 errors (rate limiting simulation)
    for i in {1..20}; do
        make_request "GET" "/api/rate-limited-endpoint" "" "Rate limited request $i"
        sleep 0.1
    done
}

# Simulate database operations
simulate_database() {
    log "Simulating database-heavy operations..."

    # Complex queries
    make_request "GET" "/api/analytics/users?start_date=2024-01-01&end_date=2024-12-31" "" "User analytics query"
    make_request "GET" "/api/reports/monthly?year=2024" "" "Monthly reports query"
    make_request "GET" "/api/dashboard/stats" "" "Dashboard statistics"

    # Bulk operations
    make_request "POST" "/api/users/bulk" \
        '{"users":[{"name":"Bulk1","email":"bulk1@example.com"},{"name":"Bulk2","email":"bulk2@example.com"}]}' \
        "Bulk user creation"

    make_request "PUT" "/api/users/bulk-update" \
        '{"ids":[1,2,3],"updates":{"status":"active"}}' \
        "Bulk user update"
}

# Simulate external API calls
simulate_external_apis() {
    log "Simulating external API integrations..."

    # Payment processing
    make_request "POST" "/api/payments/process" \
        '{"amount":99.99,"currency":"USD","payment_method":"card"}' \
        "Process payment"

    # Email notifications
    make_request "POST" "/api/notifications/email" \
        '{"to":"user@example.com","subject":"Welcome","template":"welcome"}' \
        "Send email notification"

    # Third-party integrations
    make_request "GET" "/api/integrations/slack/channels" "" "Fetch Slack channels"
    make_request "POST" "/api/integrations/webhook" \
        '{"url":"https://example.com/webhook","event":"user.created"}' \
        "Register webhook"
}

# Main execution
main() {
    log "Starting observability data generation with curl scripts..."
    log "Base URL: $BASE_URL"

    # Check if base URL is reachable
    if ! curl -s --connect-timeout 5 "$BASE_URL/health" > /dev/null 2>&1; then
        warning "Base URL $BASE_URL is not reachable. Continuing with simulation..."
    fi

    # Run all simulation functions
    simulate_auth
    simulate_crud
    simulate_search
    simulate_files
    simulate_errors
    simulate_database
    simulate_external_apis

    log "Observability data generation completed!"
    log "Check your monitoring dashboards for the generated metrics, logs, and traces."
}

# Handle script arguments
case "${1:-all}" in
    "auth")
        simulate_auth
        ;;
    "crud")
        simulate_crud
        ;;
    "search")
        simulate_search
        ;;
    "files")
        simulate_files
        ;;
    "errors")
        simulate_errors
        ;;
    "database")
        simulate_database
        ;;
    "external")
        simulate_external_apis
        ;;
    "all"|*)
        main
        ;;
esac