# Installation Guide

## Quick Start (Development)

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Start Infrastructure (Docker)

Start MongoDB and Redis using Docker:

```bash
# Start MongoDB with replica set (required for transactions)
docker run -d \
  --name mongo-dev \
  -p 27017:27017 \
  mongo:7 \
  --replSet rs0

# Initialize replica set
docker exec -it mongo-dev mongosh --eval "rs.initiate()"

# Start Redis
docker run -d \
  --name redis-dev \
  -p 6379:6379 \
  redis:7-alpine
```

### 3. Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# Edit .env and set your JWT secret
nano .env
```

Minimal `.env` for development:
```bash
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/project-management
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=dev-secret-change-in-production
CLIENT_URL=http://localhost:5173
```

### 4. Run the Server

```bash
# Development mode (with hot reload)
npm run dev

# Production build
npm run build
npm start
```

You should see:
```
🚀 Server is running on http://localhost:3000
📦 Redis client connected
✅ Redis client ready
✅ MongoDB connected successfully
🔌 WebSocket ready on ws://localhost:3000
📊 Environment: development
🔧 Background workers initialized
```

---

## Production Deployment

### Option 1: Docker Compose (Recommended)

```bash
# Build and start all services
docker-compose -f docker-compose.production.yml up -d

# View logs
docker-compose logs -f api

# Scale workers
docker-compose up -d --scale worker=4

# Stop all services
docker-compose down
```

### Option 2: Kubernetes

```bash
# Apply Kubernetes manifests
kubectl apply -f k8s/

# Check status
kubectl get pods
kubectl get services

# View logs
kubectl logs -f deployment/api
```

### Option 3: Manual Deployment

1. **Build the application:**
```bash
npm run build
```

2. **Set environment variables:**
```bash
export NODE_ENV=production
export MONGODB_URI=mongodb://your-mongo-host:27017/project-management
export REDIS_HOST=your-redis-host
export REDIS_PORT=6379
export JWT_SECRET=your-production-secret
```

3. **Start the API server:**
```bash
node dist/index.js
```

4. **Start workers (in separate process/container):**
```bash
node dist/workers/index.js
```

---

## Testing the Installation

### 1. Health Check

```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 2. Register a User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePassword123"
  }'
```

### 3. Create a Project

```bash
# First, get the JWT token from registration response
TOKEN="your-jwt-token-here"

curl -X POST http://localhost:3000/api/projects-v2 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Project",
    "description": "Testing the API"
  }'
```

### 4. Test Real-Time Events

Open two browser tabs with this HTML:

```html
<!DOCTYPE html>
<html>
<head>
  <title>WebSocket Test</title>
  <script src="https://cdn.socket.io/4.5.4/socket.io.min.js"></script>
</head>
<body>
  <h1>WebSocket Test</h1>
  <div id="output"></div>

  <script>
    const token = 'YOUR_JWT_TOKEN';
    const socket = io('http://localhost:3000', {
      auth: { token }
    });

    socket.on('connect', () => {
      console.log('Connected!');
      document.getElementById('output').innerHTML += '<p>✅ Connected</p>';
    });

    socket.on('project:created', (data) => {
      console.log('Project created:', data);
      document.getElementById('output').innerHTML +=
        '<p>📁 New project: ' + data.project.name + '</p>';
    });

    socket.on('user:online', (data) => {
      console.log('User online:', data);
      document.getElementById('output').innerHTML +=
        '<p>👤 User online in project</p>';
    });
  </script>
</body>
</html>
```

---

## Troubleshooting

### MongoDB Connection Failed

**Error:** `MongoServerError: Transaction numbers are only allowed on a replica set member`

**Solution:** MongoDB transactions require a replica set. Initialize it:

```bash
docker exec -it mongo-dev mongosh --eval "rs.initiate()"
```

### Redis Connection Failed

**Error:** `ECONNREFUSED 127.0.0.1:6379`

**Solution:** Make sure Redis is running:

```bash
# Check if Redis is running
docker ps | grep redis

# Start Redis if not running
docker start redis-dev

# Or run a new instance
docker run -d --name redis-dev -p 6379:6379 redis:7-alpine
```

### Workers Not Processing Jobs

**Check 1:** Verify workers are running
```bash
docker-compose logs worker
```

**Check 2:** Inspect Redis queue
```bash
redis-cli
> KEYS *bullmq*
> LLEN bullmq:activity:waiting
```

**Check 3:** Check for errors in worker logs
```bash
tail -f logs/worker.log
```

### Port Already in Use

**Error:** `EADDRINUSE: address already in use :::3000`

**Solution:** Change the port or kill the process:

```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or change PORT in .env
PORT=3001
```

---

## Database Indexes

Indexes are created automatically on server start. To manually verify:

```bash
mongosh mongodb://localhost:27017/project-management

# Check Project indexes
db.projects.getIndexes()

# Check Task indexes
db.tasks.getIndexes()

# Check ActivityLog indexes
db.activitylogs.getIndexes()
```

Expected indexes for Projects:
```javascript
[
  { v: 2, key: { _id: 1 }, name: '_id_' },
  { v: 2, key: { ownerId: 1, createdAt: -1 }, name: 'ownerId_1_createdAt_-1' },
  { v: 2, key: { 'members.userId': 1 }, name: 'members.userId_1' },
  { v: 2, key: { status: 1 }, name: 'status_1' },
  { v: 2, key: { 'members.userId': 1, status: 1, updatedAt: -1 }, name: 'members.userId_1_status_1_updatedAt_-1' }
]
```

---

## Performance Tuning

### MongoDB Optimization

```javascript
// Enable profiling to find slow queries
db.setProfilingLevel(1, { slowms: 100 })

// View slow queries
db.system.profile.find().limit(10).sort({ ts: -1 }).pretty()

// Check query execution plan
db.projects.find({ 'members.userId': 'xxx' }).explain('executionStats')
```

### Redis Optimization

```bash
# Monitor Redis commands in real-time
redis-cli monitor

# Get memory usage
redis-cli info memory

# Optimize memory
redis-cli config set maxmemory-policy allkeys-lru
redis-cli config set maxmemory 512mb
```

### Application Monitoring

Add monitoring middleware to track performance:

```typescript
import responseTime from 'response-time';

app.use(responseTime((req, res, time) => {
  console.log(`${req.method} ${req.url} - ${time.toFixed(2)}ms`);
}));
```

---

## Backup & Recovery

### MongoDB Backup

```bash
# Create backup
mongodump --uri="mongodb://localhost:27017/project-management" --out=./backup

# Restore backup
mongorestore --uri="mongodb://localhost:27017/project-management" ./backup/project-management
```

### Redis Backup

```bash
# Create snapshot
redis-cli BGSAVE

# Copy dump file
cp /var/lib/redis/dump.rdb ./backup/

# Restore (copy dump.rdb to Redis data directory and restart)
```

---

## Security Checklist

- [ ] Change default JWT_SECRET in production
- [ ] Enable HTTPS/TLS
- [ ] Set up firewall rules (only allow necessary ports)
- [ ] Enable MongoDB authentication
- [ ] Enable Redis password protection
- [ ] Implement rate limiting
- [ ] Add CORS whitelist
- [ ] Enable Helmet security headers
- [ ] Set up log rotation
- [ ] Enable audit logging
- [ ] Implement API key rotation
- [ ] Set up monitoring & alerts

---

## Monitoring & Logging

### Recommended Tools

1. **Application Monitoring:** Sentry, New Relic, DataDog
2. **Infrastructure:** Prometheus + Grafana
3. **Logging:** ELK Stack (Elasticsearch, Logstash, Kibana)
4. **Uptime Monitoring:** Pingdom, UptimeRobot

### Health Check Endpoint

Monitor this endpoint for service health:

```bash
GET /api/health
```

Should return 200 OK with:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## Scaling Guide

### Horizontal Scaling

1. **API Servers:** Run multiple instances behind a load balancer
   ```bash
   # Using PM2
   pm2 start dist/index.js -i 4
   ```

2. **Workers:** Scale independently
   ```bash
   docker-compose up -d --scale worker=8
   ```

### Vertical Scaling

Increase resources for containers:

```yaml
services:
  api:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 4G
```

### Database Scaling

1. **Read Replicas:** Add MongoDB replicas for read scaling
2. **Sharding:** Shard by `members.userId` for write scaling
3. **Indexes:** Ensure all queries use indexes

---

## Support

For issues or questions:

1. Check the [PRODUCTION_README.md](./PRODUCTION_README.md)
2. Review server logs: `docker-compose logs -f`
3. Check Redis: `redis-cli monitor`
4. Check MongoDB: `mongosh` and run queries manually

---

## Next Steps

After installation:

1. ✅ Test all API endpoints
2. ✅ Set up monitoring
3. ✅ Configure backups
4. ✅ Set up CI/CD pipeline
5. ✅ Run load tests
6. ✅ Set up SSL certificates
7. ✅ Configure domain & DNS
