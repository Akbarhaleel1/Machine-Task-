# Project Management Application

A full-stack project management application with real-time collaboration features, built with React, Express, MongoDB, and Socket.IO.

## Features

- User authentication and authorization (JWT-based)
- Project and task management
- Real-time drag-and-drop project boards
- File upload and Excel import/export
- Task scheduling with background job processing (BullMQ)
- Real-time updates via WebSocket (Socket.IO)
- Responsive design with modern UI components

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and builds
- **TailwindCSS** for styling
- **Radix UI** for accessible components
- **React Query** for data fetching and caching
- **Socket.IO Client** for real-time updates
- **React Hook Form + Zod** for form validation
- **@dnd-kit** for drag-and-drop functionality
- **Framer Motion** for animations

### Backend
- **Express** with TypeScript
- **MongoDB** with Mongoose ODM
- **Redis** for caching and job queues
- **Socket.IO** for real-time communication
- **BullMQ** for background job processing
- **JWT** for authentication
- **Multer** for file uploads
- **Helmet** for security headers

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **pnpm** (v8 or higher) - Install with `npm install -g pnpm`
- **MongoDB** (v6 or higher)
- **Redis** (v6 or higher)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd "d:\Mechine Task"
   ```

2. **Install dependencies**

   Install dependencies for both client and server:
   ```bash
   # Install client dependencies
   cd client
   pnpm install

   # Install server dependencies
   cd ../server
   pnpm install
   ```

## Configuration

### Server Environment Variables

Create a `.env` file in the `server` directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Client URL (for CORS)
CLIENT_URL=http://localhost:5173

# Database
MONGODB_URI=mongodb://localhost:27017/project-management

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT Secret (use a strong random string in production)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR=uploads
```

### Client Environment Variables (Optional)

Create a `.env` file in the `client` directory if you need custom configuration:

```env
# API Base URL
VITE_API_URL=http://localhost:3000
```

## Running the Application

### Option 1: Run Both Services Separately

1. **Start MongoDB**
   ```bash
   # If using MongoDB installed locally
   mongod

   # Or if using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

2. **Start Redis**
   ```bash
   # If using Redis installed locally
   redis-server

   # Or if using Docker
   docker run -d -p 6379:6379 --name redis redis:latest
   ```

3. **Start the Backend Server**
   ```bash
   cd server
   pnpm run dev
   ```

   The server will run on [http://localhost:3000](http://localhost:3000)

4. **Start the Frontend Client**

   In a new terminal:
   ```bash
   cd client
   pnpm run dev
   ```

   The client will run on [http://localhost:5173](http://localhost:5173)

### Option 2: Using Docker (if docker-compose is configured)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

## Development

### Available Scripts

#### Client (`client` directory)
- `pnpm run dev` - Start development server
- `pnpm run build` - Build for production
- `pnpm run preview` - Preview production build
- `pnpm run lint` - Run ESLint

#### Server (`server` directory)
- `pnpm run dev` - Start development server with hot reload
- `pnpm run build` - Compile TypeScript to JavaScript
- `pnpm run start` - Run production server
- `pnpm run type-check` - Check TypeScript types without emitting files

## Project Structure

```
.
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── lib/           # Utilities and API clients
│   │   ├── types/         # TypeScript type definitions
│   │   └── App.tsx        # Main application component
│   └── package.json
│
├── server/                # Backend Express application
│   ├── src/
│   │   ├── config/       # Configuration files (database, redis, socket)
│   │   ├── controllers/  # Route controllers
│   │   ├── models/       # MongoDB models
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic
│   │   ├── middleware/   # Express middleware
│   │   ├── workers/      # Background job workers
│   │   └── index.ts      # Server entry point
│   └── package.json
│
└── README.md             # This file
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile

### Projects
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create a new project
- `GET /api/projects/:id` - Get project by ID
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Tasks
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create a new task
- `GET /api/tasks/:id` - Get task by ID
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Users
- `GET /api/users` - Get all users (admin)
- `GET /api/users/:id` - Get user by ID

## Real-time Features

The application uses Socket.IO for real-time updates:

- **Project Board Updates** - Changes to project boards are broadcast to all connected users
- **Task Drag & Drop** - Real-time synchronization of task movements
- **Live Collaboration** - See updates from other team members instantly

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running: `mongod --version`
- Check connection string in `.env`
- Verify MongoDB is accessible on port 27017

### Redis Connection Issues
- Ensure Redis is running: `redis-cli ping` (should return PONG)
- Check Redis host and port in `.env`
- Verify Redis is accessible on port 6379

### Port Already in Use
If port 3000 or 5173 is already in use:
```bash
# On Windows, find and kill process
netstat -ano | findstr :3000
taskkill /PID <process-id> /F

# Change port in .env (server) or vite.config.ts (client)
```

### Build Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Clear build cache
rm -rf dist
pnpm run build
```

## Production Deployment

1. **Build the client**
   ```bash
   cd client
   pnpm run build
   ```

2. **Build the server**
   ```bash
   cd server
   pnpm run build
   ```

3. **Set production environment variables**
   - Use strong JWT secret
   - Set `NODE_ENV=production`
   - Configure production database URLs
   - Enable HTTPS for production

4. **Run the production server**
   ```bash
   cd server
   pnpm run start
   ```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Support

For issues and questions:
- Open an issue in the repository
- Contact the development team
