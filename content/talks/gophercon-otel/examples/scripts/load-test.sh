#!/bin/bash

# Load test script to generate telemetry data for the GopherCon OTEL demo

BASE_URL="http://localhost:8080"

echo "🚀 Starting load test for User Service..."
echo "📊 This will generate traces, metrics, and logs for demo purposes"

# Function to create a user
create_user() {
    local name=$1
    local email=$2
    curl -s -X POST "$BASE_URL/users" \
        -H "Content-Type: application/json" \
        -d "{\"name\": \"$name\", \"email\": \"$email\"}" | jq -r '.id'
}

# Function to get user
get_user() {
    local id=$1
    curl -s "$BASE_URL/users/$id" > /dev/null
}

# Function to upgrade user to premium
upgrade_premium() {
    local id=$1
    curl -s -X POST "$BASE_URL/users/$id/premium" > /dev/null
}

# Function to generate errors
generate_errors() {
    # Not found errors
    curl -s "$BASE_URL/users/999" > /dev/null
    curl -s "$BASE_URL/users/888" > /dev/null

    # Invalid ID errors
    curl -s "$BASE_URL/users/abc" > /dev/null
    curl -s "$BASE_URL/users/xyz" > /dev/null
}

# Create some initial users
echo "👥 Creating initial users..."
user_ids=()
names=("Alice" "Bob" "Charlie" "Diana" "Eve" "Frank" "Grace" "Henry" "Ivy" "Jack")
for i in "${!names[@]}"; do
    name="${names[$i]}"
    email="${name,,}@example.com"
    id=$(create_user "$name" "$email")
    user_ids+=("$id")
    echo "   Created user: $name (ID: $id)"
done

echo ""
echo "🔄 Starting continuous load generation..."
echo "   Press Ctrl+C to stop"

# Continuous load generation
counter=0
while true; do
    counter=$((counter + 1))

    # Get random users (successful requests)
    for _ in {1..5}; do
        random_id=${user_ids[$RANDOM % ${#user_ids[@]}]}
        get_user "$random_id"
    done

    # Upgrade some users to premium (includes payment processing)
    if [ $((counter % 10)) -eq 0 ]; then
        random_id=${user_ids[$RANDOM % ${#user_ids[@]}]}
        upgrade_premium "$random_id"
        echo "💎 Upgraded user $random_id to premium"
    fi

    # Generate some errors
    if [ $((counter % 15)) -eq 0 ]; then
        generate_errors
        echo "❌ Generated some error scenarios"
    fi

    # Create new users occasionally
    if [ $((counter % 20)) -eq 0 ]; then
        new_name="User$counter"
        new_email="user$counter@example.com"
        new_id=$(create_user "$new_name" "$new_email")
        user_ids+=("$new_id")
        echo "👤 Created new user: $new_name (ID: $new_id)"
    fi

    # Health checks
    curl -s "$BASE_URL/health" > /dev/null

    # Progress indicator
    if [ $((counter % 50)) -eq 0 ]; then
        echo "📈 Generated $counter request cycles..."
    fi

    # Small delay to make it realistic
    sleep 0.1
done