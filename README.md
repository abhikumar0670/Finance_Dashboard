# Finance Data Processing and Access Control Backend

A production-grade backend system for managing financial records with role-based access control, built with Node.js, Express, TypeScript, and MongoDB.

## 🏗️ Architecture

This project follows a clean, layered architecture adhering to SOLID principles:

### Separation of Concerns

- **Controllers**: Handle HTTP requests/responses, delegate business logic to services
- **Services**: Contain business logic, interact with models
- **Models**: Define data schemas and database interactions
- **Middleware**: Handle cross-cutting concerns (auth, validation, error handling)
- **Validators**: Validate incoming request data using Zod
- **Routes**: Define API endpoints and apply middleware

### Key Design Decisions

1. **Controller-Service Pattern**: Clear separation between HTTP handling and business logic
2. **Dependency Injection**: Controllers receive service instances for better testability
3. **Centralized Error Handling**: Custom AppError class with global error middleware
4. **Type Safety**: Strict TypeScript configuration for compile-time safety
5. **Validation Layer**: Zod schemas validate all incoming requests before reaching controllers
6. **Soft Deletes**: Records are marked as deleted rather than removed from database
7. **Compound Indexes**: Optimized database queries for common access patterns
8. **Aggregation Pipeline**: Dashboard analytics calculated efficiently on database side

## 📁 Project Structure

```
finance-backend/
├── src/
│   ├── config/
│   │   ├── database.ts          # MongoDB connection logic
│   │   └── env.ts                # Environment configuration
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── financeRecord.controller.ts
│   │   └── dashboard.controller.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts    # JWT authentication & RBAC
│   │   ├── validate.middleware.ts # Zod validation
│   │   └── errorHandler.middleware.ts
│   ├── models/
│   │   ├── User.model.ts
│   │   └── FinanceRecord.model.ts
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── financeRecord.routes.ts
│   │   ├── dashboard.routes.ts
│   │   └── index.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── financeRecord.service.ts
│   │   └── dashboard.service.ts
│   ├── validators/
│   │   ├── auth.validator.ts
│   │   └── financeRecord.validator.ts
│   ├── types/
│   │   └── index.ts              # TypeScript types and enums
│   ├── utils/
│   │   └── AppError.ts           # Custom error class
│   ├── app.ts                    # Express app setup
│   └── server.ts                 # Server entry point
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB Atlas account or local MongoDB instance
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd finance-backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` file with your configuration:
```env
PORT=3000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/finance-db?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

### Running the Application

Development mode (with auto-reload):
```bash
npm run dev
```

Build for production:
```bash
npm run build
```

Run production build:
```bash
npm start
```

The server will start on `http://localhost:3000`

## 🔐 Authentication & Authorization

### User Roles

- **VIEWER**: Can only view dashboard summaries
- **ANALYST**: Can view records and dashboard summaries
- **ADMIN**: Full CRUD access to all resources

### Authentication Flow

1. Register a new user: `POST /api/auth/register`
2. Login to receive JWT token: `POST /api/auth/login`
3. Include token in subsequent requests: `Authorization: Bearer <token>`

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login and receive JWT |

### Finance Records

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/records` | Admin | Create new record |
| GET | `/api/records` | Admin, Analyst | Get records with filters & pagination |
| GET | `/api/records/:id` | Admin, Analyst | Get single record |
| PUT | `/api/records/:id` | Admin | Update record |
| DELETE | `/api/records/:id` | Admin | Soft delete record |

### Dashboard

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/dashboard/summary` | All roles | Get analytics summary |

### Health Check

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/health` | Public | Server health status |

## 📝 API Usage Examples

### 1. Register User

```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "ADMIN"
}
```

### 2. Login

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "ADMIN"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 3. Create Finance Record

```bash
POST /api/records
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 1500,
  "type": "INCOME",
  "category": "Salary",
  "date": "2024-01-15T00:00:00.000Z",
  "description": "Monthly salary"
}
```

### 4. Get Records with Filters

```bash
GET /api/records?startDate=2024-01-01T00:00:00.000Z&endDate=2024-12-31T23:59:59.999Z&category=Salary&type=INCOME&page=1&limit=10
Authorization: Bearer <token>
```

### 5. Update Record

```bash
PUT /api/records/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 1600,
  "description": "Updated salary amount"
}
```

### 6. Delete Record (Soft Delete)

```bash
DELETE /api/records/:id
Authorization: Bearer <token>
```

### 7. Get Dashboard Summary

```bash
GET /api/dashboard/summary
Authorization: Bearer <token>
```

Response:
```json
{
  "success": true,
  "message": "Dashboard summary retrieved successfully",
  "data": {
    "totalIncome": 5000,
    "totalExpenses": 2000,
    "netBalance": 3000,
    "categoryWiseTotals": [
      { "category": "Salary", "total": 5000 },
      { "category": "Food", "total": 500 },
      { "category": "Rent", "total": 1500 }
    ],
    "recentActivity": [...]
  }
}
```

## 🗄️ Database Schema

### User Model

```typescript
{
  name: string,
  email: string (unique),
  passwordHash: string,
  role: 'VIEWER' | 'ANALYST' | 'ADMIN',
  status: 'ACTIVE' | 'INACTIVE',
  createdAt: Date,
  updatedAt: Date
}
```

Indexes:
- `email` (unique)
- `role, status` (compound)

### FinanceRecord Model

```typescript
{
  amount: number,
  type: 'INCOME' | 'EXPENSE',
  category: string,
  date: Date,
  description: string,
  createdBy: ObjectId (ref: User),
  isDeleted: boolean,
  createdAt: Date,
  updatedAt: Date
}
```

Indexes:
- `date, category` (compound)
- `type, isDeleted` (compound)
- `createdBy, isDeleted` (compound)
- `isDeleted, date` (compound)

## 🔍 Query Filters

The GET `/api/records` endpoint supports:

- `startDate`: Filter records from this date (ISO 8601)
- `endDate`: Filter records until this date (ISO 8601)
- `category`: Filter by category name
- `type`: Filter by transaction type (INCOME/EXPENSE)
- `page`: Page number (default: 1)
- `limit`: Records per page (default: 10)

## 🛡️ Security Features

- Password hashing using bcrypt (12 rounds)
- JWT-based authentication
- Role-based access control (RBAC)
- Input validation using Zod
- MongoDB injection protection via Mongoose
- Inactive user account blocking
- Centralized error handling (no sensitive data leakage)

## 📊 Dashboard Analytics

The dashboard uses MongoDB Aggregation Pipeline for efficient calculations:

- **$match**: Filter out deleted records
- **$facet**: Run multiple aggregations in parallel
- **$group**: Calculate totals by type and category
- **$sort & $limit**: Get recent activity
- **$lookup**: Populate user information

This approach processes data on the database side, avoiding memory-intensive operations.

## ⚠️ Error Handling

All errors return consistent JSON format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [] // Optional validation errors
}
```

HTTP Status Codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (authentication required)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `409`: Conflict (duplicate resource)
- `500`: Internal Server Error

## 🧪 Testing

To test the API, you can use:
- Postman
- cURL
- Thunder Client (VS Code extension)
- Any HTTP client

Import the endpoints from this README or create a Postman collection.

## 🔧 Development

### Code Style

- Strict TypeScript mode enabled
- ESLint for code quality
- Consistent naming conventions
- Comprehensive error handling

### Adding New Features

1. Create model in `src/models/`
2. Define validators in `src/validators/`
3. Implement service in `src/services/`
4. Create controller in `src/controllers/`
5. Define routes in `src/routes/`
6. Update main router in `src/routes/index.ts`

## 📦 Dependencies

### Production
- `express`: Web framework
- `mongoose`: MongoDB ODM
- `bcryptjs`: Password hashing
- `jsonwebtoken`: JWT authentication
- `zod`: Schema validation
- `dotenv`: Environment configuration
- `cors`: CORS middleware

### Development
- `typescript`: Type safety
- `ts-node-dev`: Development server with auto-reload
- Type definitions for all dependencies

## 🚨 Important Notes

1. **Change JWT_SECRET**: Use a strong, random secret in production
2. **MongoDB Atlas**: Whitelist your IP address in Atlas dashboard
3. **Environment Variables**: Never commit `.env` file to version control
4. **Soft Deletes**: Deleted records remain in database with `isDeleted: true`
5. **Indexes**: Ensure indexes are created after first deployment
6. **CORS**: Configure CORS settings for production domains

## 📄 License

MIT

## 👤 Author

Backend Engineer Assignment

---

Built with ❤️ using Node.js, Express, TypeScript, and MongoDB
