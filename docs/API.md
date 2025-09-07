# SampleSense API Documentation

## Base URL
```
Development: http://localhost:5000
Production: https://your-domain.com/api
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Response Format

All API responses follow this standard format:

### Success Response
```json
{
  "data": { ... },
  "message": "Success message",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Error Response
```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Endpoints

### Health Check

#### GET /health
Check server health status.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600,
  "environment": "development"
}
```

---

## Authentication Endpoints

### POST /api/auth/login
Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "username": "admin",
  "password": "password"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@samplesense.com",
    "role": "admin",
    "lastLogin": "2024-01-01T00:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": "24h"
}
```

**Error Responses:**
- `400` - Missing username or password
- `401` - Invalid credentials

### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "username": "newuser",
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 3,
    "username": "newuser",
    "email": "user@example.com",
    "role": "user",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": "24h"
}
```

**Error Responses:**
- `400` - Missing required fields
- `409` - User already exists

### GET /api/auth/profile
Get current user profile information.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@samplesense.com",
    "role": "admin",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "lastLogin": "2024-01-01T00:00:00.000Z"
  }
}
```

### POST /api/auth/logout
Logout current user.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Logout successful"
}
```

### POST /api/auth/refresh
Refresh JWT token.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Token refreshed successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": "24h"
}
```

---

## Dashboard Endpoints

### GET /api/dashboard/kpis
Get key performance indicators.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "totalSales": 734820,
  "activeCustomers": 2453,
  "dailyRevenue": 15680,
  "totalOrders": 1247,
  "averageOrderValue": 589,
  "salesGrowth": 12.5,
  "conversionRate": 4.2,
  "customerRetention": 85.3
}
```

### GET /api/dashboard/sales
Get sales data with optional filtering.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `days` (optional) - Number of days to retrieve (default: 30, max: 365)

**Example Request:**
```
GET /api/dashboard/sales?days=7
```

**Response:**
```json
[
  {
    "date": "2024-01-01",
    "sales": 15000,
    "orders": 300,
    "customers": 200
  },
  {
    "date": "2024-01-02",
    "sales": 18000,
    "orders": 360,
    "customers": 240
  }
]
```

### GET /api/dashboard/transactions
Get transaction data with pagination and filtering.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `limit` (optional) - Number of transactions per page (default: 20, max: 100)
- `offset` (optional) - Pagination offset (default: 0)
- `status` (optional) - Filter by status (completed, pending)
- `type` (optional) - Filter by type (sale, refund)

**Example Request:**
```
GET /api/dashboard/transactions?limit=10&status=completed
```

**Response:**
```json
{
  "transactions": [
    {
      "id": 1,
      "customer": "John Doe",
      "amount": 1200.50,
      "date": "2024-01-01",
      "status": "completed",
      "type": "sale"
    }
  ],
  "total": 50,
  "limit": 10,
  "offset": 0,
  "hasMore": true
}
```

### GET /api/dashboard/summary
Get comprehensive dashboard summary.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "totalRevenue": 734820,
  "totalTransactions": 1247,
  "averageTransactionValue": 589,
  "recentTransactions": [
    {
      "id": 1,
      "customer": "John Doe",
      "amount": 1200.50,
      "date": "2024-01-01",
      "status": "completed",
      "type": "sale"
    }
  ],
  "topCustomers": [
    {
      "name": "John Doe",
      "total": 5000,
      "orders": 8
    }
  ],
  "salesTrend": [
    {
      "date": "2024-01-01",
      "sales": 15000
    }
  ]
}
```

---

## Analytics Endpoints

### GET /api/analytics/performance
Get performance analytics and metrics.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `period` (optional) - Time period (7d, 30d, 90d, 1y) (default: 30d)

**Response:**
```json
{
  "pageViews": 125000,
  "uniqueVisitors": 45000,
  "bounceRate": 35.2,
  "avgSessionDuration": 245.5,
  "conversionRate": 4.2,
  "period": "30d",
  "generatedAt": "2024-01-01T00:00:00.000Z"
}
```

### GET /api/analytics/user-behavior
Get user behavior analytics.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "deviceTypes": [
    {
      "device": "Desktop",
      "percentage": 45.2,
      "users": 18080
    },
    {
      "device": "Mobile",
      "percentage": 38.7,
      "users": 15480
    }
  ],
  "topPages": [
    {
      "page": "/dashboard",
      "views": 25430,
      "percentage": 32.1
    }
  ],
  "userFlow": [
    {
      "step": "Landing",
      "users": 40000,
      "dropoff": 0
    },
    {
      "step": "Registration",
      "users": 32000,
      "dropoff": 20
    }
  ],
  "generatedAt": "2024-01-01T00:00:00.000Z"
}
```

### GET /api/analytics/revenue
Get revenue analytics by source and time period.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `period` (optional) - Time period (default: 30d)

**Response:**
```json
{
  "totalRevenue": 296770,
  "revenueBySource": [
    {
      "source": "Direct Sales",
      "amount": 125430,
      "percentage": 42.3
    },
    {
      "source": "Subscriptions",
      "amount": 89670,
      "percentage": 30.2
    }
  ],
  "monthlyRevenue": [
    {
      "month": "Jan 2024",
      "revenue": 85000,
      "growth": 12.5
    }
  ],
  "period": "30d",
  "generatedAt": "2024-01-01T00:00:00.000Z"
}
```

### GET /api/analytics/customers
Get customer analytics and segmentation.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "totalCustomers": 10000,
  "customerSegments": [
    {
      "segment": "Premium",
      "count": 1250,
      "percentage": 12.5,
      "avgValue": 2500
    }
  ],
  "acquisitionChannels": [
    {
      "channel": "Organic Search",
      "customers": 3200,
      "cost": 0,
      "cac": 0
    }
  ],
  "retentionData": [
    {
      "month": "Month 1",
      "retained": 100
    }
  ],
  "churnRate": 15.2,
  "ltv": 1250,
  "generatedAt": "2024-01-01T00:00:00.000Z"
}
```

### GET /api/analytics/reports
Get available reports (Admin only).

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "reports": [
    {
      "id": 1,
      "name": "Monthly Sales Report",
      "description": "Comprehensive monthly sales analysis",
      "type": "sales",
      "lastGenerated": "2024-01-01T00:00:00.000Z",
      "status": "ready"
    }
  ],
  "totalReports": 4,
  "generatedAt": "2024-01-01T00:00:00.000Z"
}
```

### POST /api/analytics/reports/:id/generate
Generate a specific report (Admin only).

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "message": "Report 1 generation started",
  "estimatedTime": "5 minutes",
  "status": "generating",
  "startedAt": "2024-01-01T00:00:00.000Z"
}
```

### GET /api/analytics/export
Export analytics data.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `type` (optional) - Export format (csv, json, xlsx) (default: csv)
- `data` (optional) - Data type to export (all, sales, customers, analytics) (default: all)

**Response:**
```json
{
  "message": "Export started successfully",
  "export": {
    "exportId": "abc123def",
    "type": "csv",
    "dataType": "all",
    "status": "processing",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "estimatedCompletion": "2024-01-01T00:05:00.000Z"
  }
}
```

---

## Error Codes

| Code | Description |
|------|-------------|
| `AUTH_REQUIRED` | Authentication required |
| `INVALID_TOKEN` | Invalid or expired token |
| `INSUFFICIENT_PERMISSIONS` | User lacks required permissions |
| `VALIDATION_ERROR` | Request validation failed |
| `RESOURCE_NOT_FOUND` | Requested resource not found |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `INTERNAL_ERROR` | Internal server error |

## Rate Limiting

API endpoints are rate limited to prevent abuse:
- **Window**: 15 minutes
- **Max Requests**: 100 per IP address
- **Headers**: Rate limit information is included in response headers

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## Pagination

Endpoints that return lists support pagination:

**Query Parameters:**
- `limit` - Number of items per page (max: 100)
- `offset` - Number of items to skip

**Response Format:**
```json
{
  "data": [...],
  "total": 500,
  "limit": 20,
  "offset": 0,
  "hasMore": true
}
```

## Filtering and Sorting

Many endpoints support filtering and sorting:

**Common Query Parameters:**
- `sort` - Sort field (e.g., `date`, `amount`)
- `order` - Sort order (`asc`, `desc`)
- `filter[field]` - Filter by field value

**Example:**
```
GET /api/dashboard/transactions?sort=date&order=desc&filter[status]=completed
```

## Webhooks (Future Feature)

SampleSense will support webhooks for real-time notifications:

**Supported Events:**
- `transaction.created`
- `user.registered`
- `report.generated`
- `alert.triggered`

## SDK and Libraries

Official SDKs will be available for:
- JavaScript/Node.js
- Python
- PHP
- Go

## Support

For API support and questions:
- **Documentation**: [API Docs](https://docs.samplesense.com)
- **Support Email**: api-support@samplesense.com
- **Status Page**: [status.samplesense.com](https://status.samplesense.com)
