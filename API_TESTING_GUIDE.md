# API Testing Guide

This guide provides step-by-step instructions for testing the Finance Backend API.

## Prerequisites

1. Server running on `http://localhost:3000`
2. Database seeded with test data (run `npm run seed`)
3. HTTP client (Postman, cURL, or Thunder Client)

## Test Credentials

After running the seed script, use these credentials:

```
Admin User:
  Email: admin@example.com
  Password: password123
  Role: ADMIN (Full access)

Analyst User:
  Email: analyst@example.com
  Password: password123
  Role: ANALYST (Read access to records)

Viewer User:
  Email: viewer@example.com
  Password: password123
  Role: VIEWER (Dashboard only)
```

## Testing Flow

### Step 1: Health Check

Verify the server is running:

```bash
curl http://localhost:3000/health
```

Expected Response:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Step 2: Register New User (Optional)

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role": "ADMIN"
  }'
```

### Step 3: Login

Login as Admin:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123"
  }'
```

Expected Response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "...",
      "name": "Admin User",
      "email": "admin@example.com",
      "role": "ADMIN",
      "status": "ACTIVE"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Important**: Save the token for subsequent requests!

### Step 4: Create Finance Record (Admin Only)

```bash
curl -X POST http://localhost:3000/api/records \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "amount": 2500,
    "type": "INCOME",
    "category": "Bonus",
    "date": "2024-01-20T00:00:00.000Z",
    "description": "Year-end bonus"
  }'
```

### Step 5: Get All Records with Filters

```bash
# Get all records
curl -X GET "http://localhost:3000/api/records?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Filter by date range
curl -X GET "http://localhost:3000/api/records?startDate=2024-01-01T00:00:00.000Z&endDate=2024-01-31T23:59:59.999Z" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Filter by category
curl -X GET "http://localhost:3000/api/records?category=Salary" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Filter by type
curl -X GET "http://localhost:3000/api/records?type=EXPENSE" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Combined filters
curl -X GET "http://localhost:3000/api/records?type=INCOME&startDate=2024-01-01T00:00:00.000Z&page=1&limit=5" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Step 6: Get Single Record

```bash
curl -X GET http://localhost:3000/api/records/RECORD_ID_HERE \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Step 7: Update Record (Admin Only)

```bash
curl -X PUT http://localhost:3000/api/records/RECORD_ID_HERE \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "amount": 2600,
    "description": "Updated bonus amount"
  }'
```

### Step 8: Get Dashboard Summary

```bash
curl -X GET http://localhost:3000/api/dashboard/summary \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

Expected Response:
```json
{
  "success": true,
  "message": "Dashboard summary retrieved successfully",
  "data": {
    "totalIncome": 11000,
    "totalExpenses": 2650,
    "netBalance": 8350,
    "categoryWiseTotals": [
      { "category": "Salary", "total": 10000 },
      { "category": "Freelance", "total": 1000 },
      { "category": "Rent", "total": 1500 },
      { "category": "Food", "total": 500 }
    ],
    "recentActivity": [...]
  }
}
```

### Step 9: Delete Record (Admin Only)

```bash
curl -X DELETE http://localhost:3000/api/records/RECORD_ID_HERE \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Testing Access Control

### Test 1: Viewer Cannot Create Records

Login as viewer and try to create a record:

```bash
# Login as viewer
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "viewer@example.com",
    "password": "password123"
  }'

# Try to create record (should fail)
curl -X POST http://localhost:3000/api/records \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer VIEWER_TOKEN" \
  -d '{
    "amount": 100,
    "type": "INCOME",
    "category": "Test"
  }'
```

Expected Response:
```json
{
  "success": false,
  "message": "Access denied. Required roles: ADMIN"
}
```

### Test 2: Viewer Can Access Dashboard

```bash
curl -X GET http://localhost:3000/api/dashboard/summary \
  -H "Authorization: Bearer VIEWER_TOKEN"
```

Should succeed with 200 status.

### Test 3: Analyst Can Read But Not Write

```bash
# Login as analyst
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "analyst@example.com",
    "password": "password123"
  }'

# Can read records (should succeed)
curl -X GET http://localhost:3000/api/records \
  -H "Authorization: Bearer ANALYST_TOKEN"

# Cannot create records (should fail)
curl -X POST http://localhost:3000/api/records \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ANALYST_TOKEN" \
  -d '{
    "amount": 100,
    "type": "INCOME",
    "category": "Test"
  }'
```

## Testing Validation

### Test Invalid Email

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test",
    "email": "invalid-email",
    "password": "password123"
  }'
```

Expected Response:
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "body.email",
      "message": "Invalid email address"
    }
  ]
}
```

### Test Missing Required Fields

```bash
curl -X POST http://localhost:3000/api/records \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "amount": 100
  }'
```

Expected Response:
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "body.type",
      "message": "Required"
    },
    {
      "field": "body.category",
      "message": "Required"
    }
  ]
}
```

### Test Negative Amount

```bash
curl -X POST http://localhost:3000/api/records \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "amount": -100,
    "type": "INCOME",
    "category": "Test"
  }'
```

Expected Response:
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "body.amount",
      "message": "Amount must be positive"
    }
  ]
}
```

## Testing Error Scenarios

### Test Unauthorized Access

```bash
curl -X GET http://localhost:3000/api/records
```

Expected Response:
```json
{
  "success": false,
  "message": "No token provided. Please authenticate."
}
```

### Test Invalid Token

```bash
curl -X GET http://localhost:3000/api/records \
  -H "Authorization: Bearer invalid_token_here"
```

Expected Response:
```json
{
  "success": false,
  "message": "Invalid or expired token. Please login again."
}
```

### Test Invalid Record ID

```bash
curl -X GET http://localhost:3000/api/records/invalid_id \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Expected Response:
```json
{
  "success": false,
  "message": "Invalid record ID"
}
```

### Test Non-Existent Record

```bash
curl -X GET http://localhost:3000/api/records/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Expected Response:
```json
{
  "success": false,
  "message": "Record not found"
}
```

## Pagination Testing

```bash
# Page 1, 5 items per page
curl -X GET "http://localhost:3000/api/records?page=1&limit=5" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Page 2, 5 items per page
curl -X GET "http://localhost:3000/api/records?page=2&limit=5" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Response includes pagination metadata:
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 5,
    "total": 8,
    "totalPages": 2
  }
}
```

## Tips for Testing

1. **Save Tokens**: Store tokens in environment variables for easier testing
2. **Use Postman Collections**: Import endpoints into Postman for organized testing
3. **Test Edge Cases**: Try boundary values, empty strings, very long strings
4. **Test Concurrency**: Make multiple requests simultaneously
5. **Monitor Logs**: Check server console for detailed error information
6. **Test Soft Deletes**: Verify deleted records don't appear in queries
7. **Test Indexes**: Query with different filters to verify index usage

## Common Issues

### Issue: "MONGO_URI is not defined"
**Solution**: Create `.env` file with proper MongoDB connection string

### Issue: "Invalid or expired token"
**Solution**: Login again to get a fresh token

### Issue: "Access denied"
**Solution**: Verify you're using the correct role for the operation

### Issue: "Record not found"
**Solution**: Ensure the record ID is correct and the record isn't soft-deleted
