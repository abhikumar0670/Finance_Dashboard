# Quick Start Guide

Get the Finance Backend up and running in 5 minutes!

## Prerequisites

- Node.js v18+ installed
- MongoDB Atlas account (or local MongoDB)
- Terminal/Command Prompt

## Step 1: Install Dependencies (1 minute)

```bash
npm install
```

## Step 2: Configure Environment (1 minute)

Create `.env` file:

```bash
cp .env.example .env
```

Edit `.env` and add your MongoDB connection string:

```env
PORT=3000
MONGO_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/finance-db?retryWrites=true&w=majority
JWT_SECRET=my-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

### Getting MongoDB URI

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free cluster (if you don't have one)
3. Click "Connect" → "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your database password

## Step 3: Seed Database (30 seconds)

```bash
npm run seed
```

This creates test users and sample data:
- Admin: `admin@example.com` / `password123`
- Analyst: `analyst@example.com` / `password123`
- Viewer: `viewer@example.com` / `password123`

## Step 4: Start Server (30 seconds)

```bash
npm run dev
```

You should see:
```
✅ MongoDB connected successfully
🚀 Server running on port 3000
📝 Environment: development
🔗 Health check: http://localhost:3000/health
```

## Step 5: Test API (2 minutes)

### Test 1: Health Check

```bash
curl http://localhost:3000/health
```

### Test 2: Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123"
  }'
```

Copy the `token` from the response.

### Test 3: Get Dashboard

```bash
curl -X GET http://localhost:3000/api/dashboard/summary \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Test 4: Create Record

```bash
curl -X POST http://localhost:3000/api/records \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "amount": 1000,
    "type": "INCOME",
    "category": "Freelance",
    "description": "Project payment"
  }'
```

### Test 5: Get Records

```bash
curl -X GET "http://localhost:3000/api/records?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 🎉 Success!

Your Finance Backend is now running!

## Next Steps

1. **Read the API Documentation**: Check `README.md` for all endpoints
2. **Test Access Control**: Try different user roles
3. **Explore Filtering**: Test date ranges and categories
4. **Review Architecture**: Read `ARCHITECTURE.md`
5. **Follow Testing Guide**: See `API_TESTING_GUIDE.md`

## Common Issues

### "MONGO_URI is not defined"
- Make sure you created `.env` file
- Check that `MONGO_URI` is set correctly

### "Failed to connect to MongoDB"
- Verify your MongoDB Atlas credentials
- Check if your IP is whitelisted in Atlas
- Ensure network connectivity

### "Port 3000 already in use"
- Change `PORT` in `.env` to another port (e.g., 3001)
- Or stop the process using port 3000

### "Module not found"
- Run `npm install` again
- Delete `node_modules` and run `npm install`

## Using Postman

1. Open Postman
2. Import endpoints from `API_TESTING_GUIDE.md`
3. Create environment variable for `token`
4. Test all endpoints visually

## Development Commands

```bash
# Start development server (auto-reload)
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Seed database with test data
npm run seed

# Lint code
npm run lint
```

## Project Structure Overview

```
src/
├── config/       # Database & environment config
├── controllers/  # HTTP request handlers
├── middleware/   # Auth, validation, errors
├── models/       # Database schemas
├── routes/       # API endpoints
├── services/     # Business logic
├── validators/   # Input validation
└── types/        # TypeScript types
```

## API Endpoints Summary

| Endpoint | Method | Access | Description |
|----------|--------|--------|-------------|
| `/api/auth/register` | POST | Public | Register user |
| `/api/auth/login` | POST | Public | Login |
| `/api/records` | POST | Admin | Create record |
| `/api/records` | GET | Admin, Analyst | List records |
| `/api/records/:id` | GET | Admin, Analyst | Get record |
| `/api/records/:id` | PUT | Admin | Update record |
| `/api/records/:id` | DELETE | Admin | Delete record |
| `/api/dashboard/summary` | GET | All | Dashboard data |

## Support

For detailed information:
- **API Documentation**: `README.md`
- **Architecture Details**: `ARCHITECTURE.md`
- **Testing Guide**: `API_TESTING_GUIDE.md`
- **Project Summary**: `PROJECT_SUMMARY.md`

Happy coding! 🚀
