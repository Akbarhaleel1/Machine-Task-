import { Router } from 'express';
import { enhancedProjectController } from '../controllers/project.controller.enhanced';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * Enhanced Project Routes
 *
 * Production-grade endpoints with:
 * - Transaction support
 * - Real-time events
 * - Background jobs
 * - Presence tracking
 */

// Create project (with transaction)
router.post('/', (req, res) =>
  enhancedProjectController.createProject(req, res)
);

// Get all projects
router.get('/', (req, res) => enhancedProjectController.getProjects(req, res));

// Get project by ID
router.get('/:id', (req, res) =>
  enhancedProjectController.getProjectById(req, res)
);

// Get online users in project (Redis-backed)
router.get('/:id/online-users', (req, res) =>
  enhancedProjectController.getOnlineUsers(req, res)
);

export default router;
