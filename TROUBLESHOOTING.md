# Troubleshooting Guide

Common issues and their solutions when working with the Finance Backend.

## Installation Issues

### Issue: `npm install` fails

**Symptoms:**
```
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
```

**Solutions:**
1. Clear npm cache:
   ```bash
   npm cache clean --force
   ```

2. Delete `node_modules` and `package-lock.json`:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. Use legacy peer deps:
   ```bash
   npm install --legacy-peer-deps
   ```

### Issue: TypeScript compilation errors

**Symptoms:**
```
error TS2307: Cannot find module 'express'
```

**Solution:**
Install type definitions:
```bash
npm install --save-dev @types/express @types/node
```

## Database Connection Issues

### Issue: "Failed to connect to MongoDB"

**Symptoms:**
```
❌ Failed to connect to MongoDB: MongoServerError: bad auth
```

**Solutions:**

1. **Check MongoDB URI format:**
   ```env
   # Correct format
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority
   
   # Common mistakes:
   # - Missing protocol (mongodb+srv://)
   # - Wrong username/password
   # - Missing database name
   # - Special characters not URL-encoded
   ```

2. **URL-encode special characters in password:**
   ```javascript
   // If password is: p@ssw0rd!
   // Encode it as: p%40ssw0rd%21
   ```

3. **Check IP whitelist in MongoDB Atlas:**
   - Go to Network Access in Atlas
   - Add your IP address or use `0.0.0.0/0` for testing

4. **Verify database user permissions:**
   - Go to Database Access in Atlas
   - Ensure user has read/write permissions

### Issue: "MONGO_URI is not defined"

**Symptoms:**
```
Error: MONGO_URI is not defined in environment variables
```

**Solution:**
1. Create `.env` file in project root
2. Copy contents from `.env.example`
3. Fill in your MongoDB URI

### Issue: Connection timeout

**Symptoms:**
```
MongooseServerSelectionError: connect ETIMEDOUT
```

**Solutions:**
1. Check internet connection
2. Verify MongoDB Atlas cluster is running
3. Check firewall settings
4. Try using MongoDB Compass to test connection

## Authentication Issues

### Issue: "No token provided"

**Symptoms:**
```json
{
  "success": false,
  "message": "No token provided. Please authenticate."
}
```

**Solution:**
Include Authorization header:
```bash
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" ...
```

### Issue: "Invalid or expired token"

**Symptoms:**
```json
{
  "success": false,
  "message": "Invalid or expired token. Please login again."
}
```

**Solutions:**
1. Login again to get a fresh token
2. Check JWT_SECRET matches between requests
3. Verify token hasn't expired (default: 7 days)
4. Ensure token is copied completely

### Issue: "JWT_SECRET is not defined"

**Symptoms:**
```
Error: Missing required environment variables: JWT_SECRET
```

**Solution:**
Add JWT_SECRET to `.env`:
```env
JWT_SECRET=your-super-secret-key-here
```

## Authorization Issues

### Issue: "Access denied"

**Symptoms:**
```json
{
  "success": false,
  "message": "Access denied. Required roles: ADMIN"
}
```

**Solutions:**
1. Check user role in token
2. Login with correct user (admin@example.com for admin access)
3. Verify endpoint permissions in routes

### Issue: "Account is inactive"

**Symptoms:**
```json
{
  "success": false,
  "message": "Account is inactive. Please contact administrator."
}
```

**Solution:**
Update user status in database:
```javascript
db.users.updateOne(
  { email: "user@example.com" },
  { $set: { status: "ACTIVE" } }
)
```

## Validation Issues

### Issue: "Validation failed"

**Symptoms:**
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

**Solutions:**
1. Check request body format
2. Ensure all required fields are present
3. Verify data types match schema
4. Check field constraints (min/max length, positive numbers, etc.)

### Issue: "Invalid record ID"

**Symptoms:**
```json
{
  "success": false,
  "message": "Invalid record ID"
}
```

**Solution:**
Use valid MongoDB ObjectId (24 hex characters):
```
Valid:   507f1f77bcf86cd799439011
Invalid: 123, abc, invalid-id
```

## Runtime Issues

### Issue: Port already in use

**Symptoms:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solutions:**

1. **Change port in `.env`:**
   ```env
   PORT=3001
   ```

2. **Kill process using port 3000:**
   ```bash
   # Windows
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F
   
   # Linux/Mac
   lsof -ti:3000 | xargs kill -9
   ```

### Issue: Server crashes on startup

**Symptoms:**
```
TypeError: Cannot read property 'x' of undefined
```

**Solutions:**
1. Check all environment variables are set
2. Verify MongoDB connection
3. Review recent code changes
4. Check console for detailed error stack

### Issue: "Cannot find module"

**Symptoms:**
```
Error: Cannot find module './config/env'
```

**Solutions:**
1. Verify file exists at specified path
2. Check import path is correct
3. Rebuild TypeScript:
   ```bash
   npm run build
   ```

## Data Issues

### Issue: No records returned

**Symptoms:**
```json
{
  "success": true,
  "data": [],
  "pagination": { "total": 0 }
}
```

**Solutions:**
1. Run seed script: `npm run seed`
2. Check if records are soft-deleted
3. Verify filters aren't too restrictive
4. Check database connection

### Issue: Duplicate key error

**Symptoms:**
```json
{
  "success": false,
  "message": "email already exists"
}
```

**Solution:**
Use different email address or update existing user

### Issue: Records not updating

**Symptoms:**
Update request succeeds but data doesn't change

**Solutions:**
1. Check if you're updating the correct record ID
2. Verify update data is valid
3. Check if record is soft-deleted
4. Review service layer logic

## Performance Issues

### Issue: Slow queries

**Symptoms:**
Requests take several seconds to complete

**Solutions:**
1. **Check indexes are created:**
   ```javascript
   db.financerecords.getIndexes()
   ```

2. **Add missing indexes:**
   ```javascript
   db.financerecords.createIndex({ date: -1, category: 1 })
   ```

3. **Use pagination:**
   ```bash
   GET /api/records?page=1&limit=10
   ```

4. **Optimize filters:**
   - Use indexed fields in queries
   - Limit date ranges
   - Avoid regex searches

### Issue: High memory usage

**Symptoms:**
Server becomes slow or crashes with large datasets

**Solutions:**
1. Always use pagination
2. Limit result sets
3. Use aggregation pipeline for analytics
4. Avoid loading all records into memory

## Development Issues

### Issue: Changes not reflecting

**Symptoms:**
Code changes don't appear when testing

**Solutions:**
1. **Restart dev server:**
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

2. **Clear build cache:**
   ```bash
   rm -rf dist
   npm run build
   ```

3. **Check file is saved**

### Issue: TypeScript errors in IDE

**Symptoms:**
Red squiggly lines in VS Code

**Solutions:**
1. Restart TypeScript server:
   - VS Code: Cmd/Ctrl + Shift + P
   - Type: "TypeScript: Restart TS Server"

2. Check `tsconfig.json` is correct

3. Install missing type definitions

## Testing Issues

### Issue: cURL commands not working

**Symptoms:**
```
curl: (3) URL using bad/illegal format or missing URL
```

**Solutions:**

1. **Windows PowerShell - use different quote style:**
   ```powershell
   curl -X POST http://localhost:3000/api/auth/login `
     -H "Content-Type: application/json" `
     -d '{\"email\":\"admin@example.com\",\"password\":\"password123\"}'
   ```

2. **Use Postman or Thunder Client instead**

3. **Save JSON to file:**
   ```bash
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d @login.json
   ```

### Issue: Postman "Could not get response"

**Symptoms:**
Postman shows network error

**Solutions:**
1. Check server is running
2. Verify URL is correct
3. Disable Postman proxy
4. Check firewall settings

## Deployment Issues

### Issue: Build fails

**Symptoms:**
```
npm run build
error TS2304: Cannot find name 'x'
```

**Solutions:**
1. Fix TypeScript errors
2. Check all imports are correct
3. Verify all dependencies are installed
4. Use strict type checking

### Issue: Production server crashes

**Symptoms:**
Server starts but crashes immediately

**Solutions:**
1. Check environment variables are set
2. Verify MongoDB connection in production
3. Review production logs
4. Test build locally:
   ```bash
   npm run build
   NODE_ENV=production npm start
   ```

## Debugging Tips

### Enable Detailed Logging

Add to `.env`:
```env
NODE_ENV=development
```

### Check MongoDB Queries

Enable Mongoose debug mode:
```typescript
mongoose.set('debug', true);
```

### Inspect JWT Token

Use [jwt.io](https://jwt.io) to decode and inspect tokens

### Test Database Connection

```typescript
mongoose.connection.on('connected', () => {
  console.log('MongoDB connected');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB error:', err);
});
```

### Check Request Headers

```typescript
console.log('Headers:', req.headers);
console.log('Body:', req.body);
console.log('User:', req.user);
```

## Getting Help

If you're still stuck:

1. **Check server logs** for detailed error messages
2. **Review documentation:**
   - README.md
   - API_TESTING_GUIDE.md
   - ARCHITECTURE.md

3. **Verify environment:**
   - Node.js version: `node --version`
   - npm version: `npm --version`
   - MongoDB connection: Use MongoDB Compass

4. **Test with seed data:**
   ```bash
   npm run seed
   ```

5. **Start fresh:**
   ```bash
   rm -rf node_modules package-lock.json dist
   npm install
   npm run build
   npm run seed
   npm run dev
   ```

## Common Error Codes

| Code | Meaning | Common Causes |
|------|---------|---------------|
| 400 | Bad Request | Invalid input, validation failed |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate resource (email) |
| 500 | Server Error | Database error, unhandled exception |

## Prevention Tips

1. **Always validate input** before processing
2. **Use environment variables** for configuration
3. **Handle errors gracefully** with try-catch
4. **Test with different roles** to verify access control
5. **Use pagination** for large datasets
6. **Monitor database indexes** for performance
7. **Keep dependencies updated** but test thoroughly
8. **Use TypeScript strict mode** to catch errors early
9. **Log important operations** for debugging
10. **Test error scenarios** not just happy paths
