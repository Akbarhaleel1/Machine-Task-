# Quick Start Guide

## ✅ **Current Status**

Dependencies installed:
- ✅ `ioredis` - Redis client
- ✅ `bullmq` - Background job queue
- ✅ All other dependencies

## 🚀 **Start Server (Without Redis)**

The server can run **without Redis** for basic functionality:

```bash
cd server
npm run dev
```

**Features available without Redis:**
- ✅ Create projects (basic version at `/api/projects`)
- ✅ Authentication
- ✅ Tasks
- ✅ WebSocket (basic)

**Features requiring Redis:**
- ❌ Enhanced project creation with transactions (`/api/projects-v2`)
- ❌ Presence tracking (online users)
- ❌ Background jobs (email, activity logs)
- ❌ Caching

## 🐳 **Enable Redis (Optional)**

### Option 1: Docker (Recommended)

```bash
# Start Redis
docker run -d --name redis-dev -p 6379:6379 redis:7-alpine

# Verify Redis is running
docker ps | grep redis

# Test connection
docker exec -it redis-dev redis-cli ping
# Should return: PONG
```

### Option 2: Windows Native

Download from: https://github.com/tporadowski/redis/releases

Or use WSL:
```bash
wsl sudo service redis-server start
```

## 📝 **Enable Workers (After Redis is Running)**

1. Uncomment in `src/index.ts`:
```typescript
// Change this:
// import './workers';

// To this:
import './workers';
```

2. Restart server:
```bash
npm run dev
```

## 🧪 **Test the Setup**

### 1. Test Basic Server

```bash
# Health check
curl http://localhost:3000/api/health
```

Expected:
```json
{"status":"ok","timestamp":"2024-01-15T10:30:00.000Z"}
```

### 2. Register User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123"
  }'
```

### 3. Create Project (Basic)

```bash
# Use token from register response
curl -X POST http://localhost:3000/api/projects \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Project",
    "description": "Testing basic API"
  }'
```

### 4. Create Project (Enhanced - Requires Redis)

```bash
curl -X POST http://localhost:3000/api/projects-v2 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Production Project",
    "description": "With transactions & Redis"
  }'
```

## 🎯 **API Endpoints**

### Without Redis:
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/projects` - Create project (basic)
- `GET /api/projects` - Get projects
- `POST /api/tasks` - Create task

### With Redis:
- `POST /api/projects-v2` - Create project (enhanced with transactions)
- `GET /api/projects-v2/:id/online-users` - Get online users

## 🐛 **Troubleshooting**

### Error: Cannot find module 'ioredis'

**Solution:** Already fixed! Dependencies installed.

### Error: Redis connection failed

**Solution:** Server will start without Redis. Features requiring Redis will be unavailable.

To enable Redis:
```bash
docker run -d --name redis-dev -p 6379:6379 redis:7-alpine
```

### MongoDB Connection Issues

**MongoDB must be running with replica set for transactions:**

```bash
# Start MongoDB with replica set
docker run -d --name mongo-dev -p 27017:27017 mongo:7 --replSet rs0

# Initialize replica set
docker exec -it mongo-dev mongosh --eval "rs.initiate()"
```

## 📦 **Full Production Setup**

When ready for full production features:

```bash
# Start all infrastructure
docker run -d --name mongo-dev -p 27017:27017 mongo:7 --replSet rs0
docker exec -it mongo-dev mongosh --eval "rs.initiate()"
docker run -d --name redis-dev -p 6379:6379 redis:7-alpine

# Uncomment workers in src/index.ts
# Then restart
npm run dev
```

## 📚 **Next Steps**

1. ✅ Server is running on http://localhost:3000
2. ✅ Test basic endpoints (auth, projects, tasks)
3. 🔲 Install Redis for enhanced features (optional)
4. 🔲 Enable workers for background jobs (optional)
5. 🔲 Read [PRODUCTION_README.md](./PRODUCTION_README.md) for full documentation

---

## 🎉 **You're Ready!**

The server is now running. You can:
- Use basic CRUD operations without Redis
- Add Redis later for production features
- Start building your frontend

Happy coding! 🚀
