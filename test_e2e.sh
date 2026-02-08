#!/bin/bash

# E2E API Test Script for Project Nexus
BASE_URL="http://localhost:8000"
FRONTEND_URL="http://localhost:5173"

echo "🧪 Project Nexus E2E API Testing"
echo "=================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counters
TESTS_PASSED=0
TESTS_FAILED=0

# Helper function to print test results
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ PASS${NC}: $2"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}✗ FAIL${NC}: $2"
        ((TESTS_FAILED++))
    fi
}

echo -e "${BLUE}Test 1: User Registration${NC}"
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/auth/register" \
    -H "Content-Type: application/json" \
    -d '{"username":"testnode","password":"test123","role":"node"}')
echo "Response: $REGISTER_RESPONSE"
if echo "$REGISTER_RESPONSE" | grep -q "access_token\|用户名已存在"; then
    print_result 0 "User registration successful or already exists"
    if echo "$REGISTER_RESPONSE" | grep -q "access_token"; then
        TEST_TOKEN=$(echo "$REGISTER_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])" 2>/dev/null)
    fi
else
    print_result 1 "User registration failed"
fi
echo ""

echo -e "${BLUE}Test 2: User Login${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"username":"commander","password":"admin123"}')
echo "Response: $LOGIN_RESPONSE"
if echo "$LOGIN_RESPONSE" | grep -q "access_token"; then
    print_result 0 "Commander login successful"
    COMMANDER_TOKEN=$(echo "$LOGIN_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])" 2>/dev/null)
else
    print_result 1 "Commander login failed"
fi
echo ""

echo -e "${BLUE}Test 3: Get Current User${NC}"
ME_RESPONSE=$(curl -s -X GET "$BASE_URL/api/v1/auth/me" \
    -H "Authorization: Bearer $COMMANDER_TOKEN")
echo "Response: $ME_RESPONSE"
if echo "$ME_RESPONSE" | grep -q "commander"; then
    print_result 0 "Get current user successful"
else
    print_result 1 "Get current user failed"
fi
echo ""

echo -e "${BLUE}Test 4: Create Project${NC}"
PROJECT_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/projects/" \
    -H "Authorization: Bearer $COMMANDER_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"name":"E2E Test Project","description":"Automated test project"}')
echo "Response: $PROJECT_RESPONSE"
if echo "$PROJECT_RESPONSE" | grep -q "id"; then
    print_result 0 "Project creation successful"
    PROJECT_ID=$(echo "$PROJECT_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['id'])" 2>/dev/null)
else
    print_result 1 "Project creation failed"
fi
echo ""

echo -e "${BLUE}Test 5: List Projects${NC}"
PROJECTS_RESPONSE=$(curl -s -X GET "$BASE_URL/api/v1/projects/" \
    -H "Authorization: Bearer $COMMANDER_TOKEN")
echo "Response: $PROJECTS_RESPONSE"
if echo "$PROJECTS_RESPONSE" | grep -q "E2E Test Project"; then
    print_result 0 "List projects successful"
else
    print_result 1 "List projects failed"
fi
echo ""

if [ ! -z "$PROJECT_ID" ]; then
    echo -e "${BLUE}Test 6: Create Module${NC}"
    MODULE_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/modules/" \
        -H "Authorization: Bearer $COMMANDER_TOKEN" \
        -H "Content-Type: application/json" \
        -d "{\"title\":\"E2E Test Module\",\"description\":\"Test module for automation\",\"project_id\":$PROJECT_ID,\"bounty\":100}")
    echo "Response: $MODULE_RESPONSE"
    if echo "$MODULE_RESPONSE" | grep -q "id"; then
        print_result 0 "Module creation successful"
        MODULE_ID=$(echo "$MODULE_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['id'])" 2>/dev/null)
    else
        print_result 1 "Module creation failed"
    fi
    echo ""
fi

if [ ! -z "$MODULE_ID" ]; then
    echo -e "${BLUE}Test 7: Login as Test Node${NC}"
    NODE_LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/auth/login" \
        -H "Content-Type: application/json" \
        -d '{"username":"testnode","password":"test123"}')
    echo "Response: $NODE_LOGIN_RESPONSE"
    if echo "$NODE_LOGIN_RESPONSE" | grep -q "access_token"; then
        print_result 0 "Test node login successful"
        NODE_TOKEN=$(echo "$NODE_LOGIN_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])" 2>/dev/null)
    else
        print_result 1 "Test node login failed"
    fi
    echo ""
fi

if [ ! -z "$MODULE_ID" ] && [ ! -z "$NODE_TOKEN" ]; then
    echo -e "${BLUE}Test 8: Assign Module to Node${NC}"
    ASSIGN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/modules/$MODULE_ID/assign" \
        -H "Authorization: Bearer $NODE_TOKEN")
    echo "Response: $ASSIGN_RESPONSE"
    if echo "$ASSIGN_RESPONSE" | grep -q "assignees"; then
        print_result 0 "Module assignment successful"
    else
        print_result 1 "Module assignment failed"
    fi
    echo ""

    echo -e "${BLUE}Test 9: Get Module Details${NC}"
    MODULE_DETAIL_RESPONSE=$(curl -s -X GET "$BASE_URL/api/v1/modules/$MODULE_ID" \
        -H "Authorization: Bearer $NODE_TOKEN")
    echo "Response: $MODULE_DETAIL_RESPONSE"
    if echo "$MODULE_DETAIL_RESPONSE" | grep -q "testnode"; then
        print_result 0 "Get module details successful - assignee found"
    else
        print_result 1 "Get module details failed - assignee not found"
    fi
    echo ""

    echo -e "${BLUE}Test 10: Submit Delivery${NC}"
    DELIVERY_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/deliveries/" \
        -H "Authorization: Bearer $NODE_TOKEN" \
        -H "Content-Type: application/json" \
        -d "{\"module_id\":$MODULE_ID,\"content\":\"This is a test delivery content\"}")
    echo "Response: $DELIVERY_RESPONSE"
    if echo "$DELIVERY_RESPONSE" | grep -q "id"; then
        print_result 0 "Delivery submission successful"
        DELIVERY_ID=$(echo "$DELIVERY_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['id'])" 2>/dev/null)
    else
        print_result 1 "Delivery submission failed"
    fi
    echo ""
fi

if [ ! -z "$DELIVERY_ID" ] && [ ! -z "$COMMANDER_TOKEN" ]; then
    echo -e "${BLUE}Test 11: Review Delivery (PASS)${NC}"
    REVIEW_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/reviews/" \
        -H "Authorization: Bearer $COMMANDER_TOKEN" \
        -H "Content-Type: application/json" \
        -d "{\"delivery_id\":$DELIVERY_ID,\"decision\":\"pass\",\"feedback\":\"Great work!\",\"reputation_change\":50}")
    echo "Response: $REVIEW_RESPONSE"
    if echo "$REVIEW_RESPONSE" | grep -q "id"; then
        print_result 0 "Delivery review successful"
    else
        print_result 1 "Delivery review failed"
    fi
    echo ""
fi

echo -e "${BLUE}Test 12: Get Notifications${NC}"
NOTIFICATIONS_RESPONSE=$(curl -s -X GET "$BASE_URL/api/v1/notifications/" \
    -H "Authorization: Bearer $NODE_TOKEN")
echo "Response: $NOTIFICATIONS_RESPONSE"
if echo "$NOTIFICATIONS_RESPONSE" | grep -q "\[\]" || echo "$NOTIFICATIONS_RESPONSE" | grep -q "id"; then
    print_result 0 "Get notifications successful"
else
    print_result 1 "Get notifications failed"
fi
echo ""

echo -e "${BLUE}Test 13: Get Unread Count${NC}"
UNREAD_RESPONSE=$(curl -s -X GET "$BASE_URL/api/v1/notifications/unread-count" \
    -H "Authorization: Bearer $NODE_TOKEN")
echo "Response: $UNREAD_RESPONSE"
if echo "$UNREAD_RESPONSE" | grep -q "unread_count"; then
    print_result 0 "Get unread count successful"
else
    print_result 1 "Get unread count failed"
fi
echo ""

echo -e "${BLUE}Test 14: List All Modules${NC}"
ALL_MODULES_RESPONSE=$(curl -s -X GET "$BASE_URL/api/v1/modules/" \
    -H "Authorization: Bearer $COMMANDER_TOKEN")
echo "Response: $ALL_MODULES_RESPONSE"
if echo "$ALL_MODULES_RESPONSE" | grep -q "E2E Test Module"; then
    print_result 0 "List all modules successful"
else
    print_result 1 "List all modules failed"
fi
echo ""

# Summary
echo "=================================="
echo -e "${BLUE}Test Summary${NC}"
echo -e "Total Tests: $((TESTS_PASSED + TESTS_FAILED))"
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Failed: $TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}❌ Some tests failed${NC}"
    exit 1
fi
