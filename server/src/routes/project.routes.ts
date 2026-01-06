import { Router } from 'express';
import { projectController } from '../controllers/project.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All project routes are protected
router.use(authenticate);

// Project CRUD
router.post('/', (req, res) => projectController.createProject(req, res));
router.get('/', (req, res) => projectController.getProjects(req, res));
router.get('/:id', (req, res) => projectController.getProjectById(req, res));
router.put('/:id', (req, res) => projectController.updateProject(req, res));
router.delete('/:id', (req, res) => projectController.deleteProject(req, res));

// Member management
router.post('/:id/members', (req, res) => projectController.addMember(req, res));
router.delete('/:id/members/:memberId', (req, res) =>
  projectController.removeMember(req, res)
);

export default router;
