# System Diagrams

Visual representations of the Finance Backend architecture and flows.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          CLIENT                                  │
│                    (Postman, Browser, etc.)                      │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP Request
                             │ (JSON + JWT Token)
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      EXPRESS SERVER                              │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    MIDDLEWARE LAYER                        │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │  │
│  │  │   CORS   │→ │   Auth   │→ │   RBAC   │→ │ Validate │  │  │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │  │
│  └───────────────────────────┬───────────────────────────────┘  │
│                              ▼                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    ROUTES LAYER                            │  │
│  │  /api/auth  │  /api/records  │  /api/dashboard            │  │
│  └───────────────────────────┬───────────────────────────────┘  │
│                              ▼                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                 CONTROLLERS LAYER                          │  │
│  │  AuthController │ RecordController │ DashboardController   │  │
│  └───────────────────────────┬───────────────────────────────┘  │
│                              ▼                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                  SERVICES LAYER                            │  │
│  │  AuthService  │  RecordService  │  DashboardService        │  │
│  └───────────────────────────┬───────────────────────────────┘  │
│                              ▼                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                   MODELS LAYER                             │  │
│  │         User Model  │  FinanceRecord Model                 │  │
│  └───────────────────────────┬───────────────────────────────┘  │
└────────────────────────────────┼────────────────────────────────┘
                                 │ Mongoose ODM
                                 ▼
                    ┌────────────────────────┐
                    │   MONGODB DATABASE     │
                    │  ┌──────┐  ┌────────┐ │
                    │  │Users │  │Records │ │
                    │  └──────┘  └────────┘ │
                    └────────────────────────┘
```

## Request Flow

```
1. Client Request
   │
   ├─→ [CORS Middleware] ──────────────────────────┐
   │                                                │
   ├─→ [Auth Middleware]                           │
   │    ├─ Extract JWT Token                       │
   │    ├─ Verify Token                            │
   │    └─ Attach User to Request ─────────────────┤
   │                                                │
   ├─→ [RBAC Middleware]                           │
   │    ├─ Check User Role                         │
   │    └─ Verify Permissions ──────────────────────┤
   │                                                │
   ├─→ [Validation Middleware]                     │
   │    ├─ Validate Request Body                   │
   │    ├─ Validate Query Params                   │
   │    └─ Validate URL Params ─────────────────────┤
   │                                                │
   ├─→ [Controller]                                │
   │    ├─ Extract Request Data                    │
   │    ├─ Call Service Method                     │
   │    └─ Format Response ─────────────────────────┤
   │                                                │
   ├─→ [Service]                                   │
   │    ├─ Business Logic                          │
   │    ├─ Data Validation                         │
   │    ├─ Database Operations                     │
   │    └─ Return Result ───────────────────────────┤
   │                                                │
   └─→ [Response] ←────────────────────────────────┘
        ├─ Success: 200/201 + Data
        └─ Error: 4xx/5xx + Message
```

## Authentication Flow

```
┌──────────┐                                    ┌──────────┐
│  Client  │                                    │  Server  │
└────┬─────┘                                    └────┬─────┘
     │                                               │
     │  POST /api/auth/register                     │
     │  { email, password, name, role }             │
     ├──────────────────────────────────────────────>│
     │                                               │
     │                                          ┌────▼────┐
     │                                          │ Validate│
     │                                          │  Input  │
     │                                          └────┬────┘
     │                                               │
     │                                          ┌────▼────┐
     │                                          │  Hash   │
     │                                          │Password │
     │                                          └────┬────┘
     │                                               │
     │                                          ┌────▼────┐
     │                                          │  Save   │
     │                                          │  User   │
     │                                          └────┬────┘
     │                                               │
     │                                          ┌────▼────┐
     │                                          │Generate │
     │                                          │   JWT   │
     │                                          └────┬────┘
     │                                               │
     │  { user, token }                             │
     │<──────────────────────────────────────────────┤
     │                                               │
     │  POST /api/auth/login                        │
     │  { email, password }                         │
     ├──────────────────────────────────────────────>│
     │                                               │
     │                                          ┌────▼────┐
     │                                          │  Find   │
     │                                          │  User   │
     │                                          └────┬────┘
     │                                               │
     │                                          ┌────▼────┐
     │                                          │ Compare │
     │                                          │Password │
     │                                          └────┬────┘
     │                                               │
     │                                          ┌────▼────┐
     │                                          │Generate │
     │                                          │   JWT   │
     │                                          └────┬────┘
     │                                               │
     │  { user, token }                             │
     │<──────────────────────────────────────────────┤
     │                                               │
     │  GET /api/records                            │
     │  Authorization: Bearer <token>               │
     ├──────────────────────────────────────────────>│
     │                                               │
     │                                          ┌────▼────┐
     │                                          │ Verify  │
     │                                          │  Token  │
     │                                          └────┬────┘
     │                                               │
     │                                          ┌────▼────┐
     │                                          │  Check  │
     │                                          │  Role   │
     │                                          └────┬────┘
     │                                               │
     │                                          ┌────▼────┐
     │                                          │  Fetch  │
     │                                          │  Data   │
     │                                          └────┬────┘
     │                                               │
     │  { success: true, data: [...] }              │
     │<──────────────────────────────────────────────┤
     │                                               │
```

## Role-Based Access Control

```
┌─────────────────────────────────────────────────────────────┐
│                      USER ROLES                              │
└─────────────────────────────────────────────────────────────┘

┌──────────┐         ┌──────────┐         ┌──────────┐
│  VIEWER  │         │ ANALYST  │         │  ADMIN   │
└────┬─────┘         └────┬─────┘         └────┬─────┘
     │                    │                     │
     │                    │                     │
     ▼                    ▼                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    PERMISSIONS                               │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Dashboard Summary:        ✓              ✓              ✓  │
│                                                              │
│  View Records:             ✗              ✓              ✓  │
│                                                              │
│  Create Records:           ✗              ✗              ✓  │
│                                                              │
│  Update Records:           ✗              ✗              ✓  │
│                                                              │
│  Delete Records:           ✗              ✗              ✓  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Database Schema Relationships

```
┌─────────────────────────────┐
│          User               │
├─────────────────────────────┤
│ _id: ObjectId (PK)          │
│ name: String                │
│ email: String (Unique)      │
│ passwordHash: String        │
│ role: Enum                  │
│ status: Enum                │
│ createdAt: Date             │
│ updatedAt: Date             │
└──────────┬──────────────────┘
           │
           │ 1:N
           │
           ▼
┌─────────────────────────────┐
│      FinanceRecord          │
├─────────────────────────────┤
│ _id: ObjectId (PK)          │
│ amount: Number              │
│ type: Enum                  │
│ category: String            │
│ date: Date                  │
│ description: String         │
│ createdBy: ObjectId (FK) ───┘
│ isDeleted: Boolean          │
│ createdAt: Date             │
│ updatedAt: Date             │
└─────────────────────────────┘

Indexes:
  User:
    - email (unique)
    - role + status (compound)
  
  FinanceRecord:
    - date + category (compound)
    - type + isDeleted (compound)
    - createdBy + isDeleted (compound)
    - isDeleted + date (compound)
```

## Dashboard Aggregation Pipeline

```
┌─────────────────────────────────────────────────────────────┐
│              MongoDB Aggregation Pipeline                    │
└─────────────────────────────────────────────────────────────┘

Input: All FinanceRecords
         │
         ▼
    ┌─────────┐
    │ $match  │  Filter: { isDeleted: false }
    └────┬────┘
         │
         ▼
    ┌─────────┐
    │ $facet  │  Run 3 parallel aggregations:
    └────┬────┘
         │
         ├──────────────────────┬──────────────────────┐
         │                      │                      │
         ▼                      ▼                      ▼
    ┌─────────┐          ┌─────────┐          ┌─────────┐
    │ totals  │          │category │          │ recent  │
    │         │          │ Totals  │          │activity │
    └────┬────┘          └────┬────┘          └────┬────┘
         │                    │                     │
         ▼                    ▼                     ▼
    ┌─────────┐          ┌─────────┐          ┌─────────┐
    │ $group  │          │ $group  │          │  $sort  │
    │ by type │          │by categ │          │by date  │
    └────┬────┘          └────┬────┘          └────┬────┘
         │                    │                     │
         │                    ▼                     ▼
         │               ┌─────────┐          ┌─────────┐
         │               │ $sort   │          │ $limit  │
         │               │by total │          │   5     │
         │               └────┬────┘          └────┬────┘
         │                    │                     │
         │                    ▼                     ▼
         │               ┌─────────┐          ┌─────────┐
         │               │$project │          │ $lookup │
         │               │ format  │          │  users  │
         │               └────┬────┘          └────┬────┘
         │                    │                     │
         └────────────────────┴─────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Final Result:   │
                    │  - totalIncome   │
                    │  - totalExpenses │
                    │  - netBalance    │
                    │  - categoryTotals│
                    │  - recentActivity│
                    └──────────────────┘
```

## Error Handling Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Error Handling                            │
└─────────────────────────────────────────────────────────────┘

Any Layer (Controller/Service/Model)
         │
         │ throw new AppError(message, statusCode)
         │ OR
         │ throw new Error(message)
         │
         ▼
    ┌─────────────────┐
    │  next(error)    │
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │ Error Handler   │
    │   Middleware    │
    └────────┬────────┘
             │
             ├─────────────────────────────────────┐
             │                                     │
             ▼                                     ▼
    ┌─────────────────┐                  ┌─────────────────┐
    │   AppError?     │                  │  Other Error?   │
    └────────┬────────┘                  └────────┬────────┘
             │                                     │
             ▼                                     ▼
    ┌─────────────────┐                  ┌─────────────────┐
    │ Return custom   │                  │ Check error type│
    │ status & message│                  │ - Validation    │
    └────────┬────────┘                  │ - Duplicate Key │
             │                            │ - Cast Error    │
             │                            │ - Generic       │
             │                            └────────┬────────┘
             │                                     │
             └─────────────────┬───────────────────┘
                               │
                               ▼
                      ┌─────────────────┐
                      │ Format Response │
                      │ {               │
                      │   success: false│
                      │   message: ...  │
                      │   errors: ...   │
                      │ }               │
                      └────────┬────────┘
                               │
                               ▼
                          Send to Client
```

## Deployment Architecture (Future)

```
┌─────────────────────────────────────────────────────────────┐
│                         PRODUCTION                           │
└─────────────────────────────────────────────────────────────┘

                    ┌──────────────┐
                    │ Load Balancer│
                    │   (Nginx)    │
                    └──────┬───────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
          ▼                ▼                ▼
    ┌─────────┐      ┌─────────┐      ┌─────────┐
    │ Server 1│      │ Server 2│      │ Server 3│
    │ Node.js │      │ Node.js │      │ Node.js │
    └────┬────┘      └────┬────┘      └────┬────┘
         │                │                │
         └────────────────┼────────────────┘
                          │
                          ▼
                 ┌─────────────────┐
                 │  MongoDB Atlas  │
                 │   (Replica Set) │
                 └─────────────────┘
                          │
                          ▼
                 ┌─────────────────┐
                 │  Redis Cache    │
                 │   (Optional)    │
                 └─────────────────┘
```

These diagrams provide a visual understanding of the system architecture, data flow, and component interactions.
