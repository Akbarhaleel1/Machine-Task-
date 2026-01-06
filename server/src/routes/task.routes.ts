import { Router } from 'express';
import { taskController } from '../controllers/task.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All task routes are protected
router.use(authenticate);

// Task CRUD
router.post('/', (req, res) => taskController.createTask(req, res));
router.get('/project/:projectId', (req, res) => taskController.getTasks(req, res));
router.get('/project/:projectId/search', (req, res) =>
  taskController.searchTasks(req, res)
);
router.get('/project/:projectId/stats', (req, res) =>
  taskController.getDashboardStats(req, res)
);
router.get('/:id', (req, res) => taskController.getTaskById(req, res));
router.put('/:id', (req, res) => taskController.updateTask(req, res));
router.delete('/:id', (req, res) => taskController.deleteTask(req, res));

// Comments
router.post('/:id/comments', (req, res) => taskController.addComment(req, res));

export default router;
