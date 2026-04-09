import express from 'express';
import {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  getDashboardStats,
} from '../controllers/task.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { validate, taskValidation } from '../middleware/validation.middleware.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Dashboard stats
router.get('/stats/dashboard', getDashboardStats);

// Task CRUD routes
router.route('/')
  .get(getTasks)
  .post(validate(taskValidation), createTask);

router.route('/:id')
  .get(getTask)
  .put(validate(taskValidation), updateTask)
  .delete(deleteTask);

export default router;
