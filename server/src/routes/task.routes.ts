import express from 'express';
import { body, param, query } from 'express-validator';
import { TaskController } from '../controllers/task.controller';
import { protect } from '../middlewares/auth.middleware';
import { TaskStatus } from '../interfaces/task.interface';

const router = express.Router();

/**
 * @route   GET /api/tasks/due-soon
 * @desc    Get tasks due soon (within X days)
 * @access  Private
 */
router.get(
  '/due-soon',
  protect,
  [
    query('days').optional().isInt({ min: 1 }).withMessage('Days must be a positive integer')
  ],
  TaskController.getTasksDueSoon
);

/**
 * @route   GET /api/tasks/overdue
 * @desc    Get overdue tasks
 * @access  Private
 */
router.get(
  '/overdue',
  protect,
  TaskController.getOverdueTasks
);

/**
 * @route   GET /api/tasks
 * @desc    Get all tasks for current user with optional filtering
 * @access  Private
 */
router.get(
  '/',
  protect,
  [
    query('category_id').optional().isInt().withMessage('Category ID must be an integer'),
    query('priority_id').optional().isInt().withMessage('Priority ID must be an integer'),
    query('status').optional().isIn(Object.values(TaskStatus)).withMessage(`Status must be one of: ${Object.values(TaskStatus).join(', ')}`),
    query('search').optional().isString().withMessage('Search term must be a string'),
    query('due_date').optional().isISO8601().withMessage('Due date must be a valid date')
  ],
  TaskController.getAllTasks
);

/**
 * @route   GET /api/tasks/:id
 * @desc    Get task by ID
 * @access  Private
 */
router.get(
  '/:id',
  protect,
  param('id').isInt().withMessage('Task ID must be an integer'),
  TaskController.getTaskById
);

/**
 * @route   POST /api/tasks
 * @desc    Create a new task
 * @access  Private
 */
router.post(
  '/',
  protect,
  [
    body('title')
      .notEmpty()
      .withMessage('Title is required')
      .isLength({ max: 100 })
      .withMessage('Title must be 100 characters or less'),
    body('description')
      .optional()
      .isString()
      .withMessage('Description must be a string'),
    body('category_id')
      .optional()
      .isInt()
      .withMessage('Category ID must be an integer'),
    body('priority_id')
      .optional()
      .isInt()
      .withMessage('Priority ID must be an integer'),
    body('due_date')
      .optional()
      .isISO8601()
      .withMessage('Due date must be a valid date')
  ],
  TaskController.createTask
);

/**
 * @route   PUT /api/tasks/:id
 * @desc    Update a task
 * @access  Private
 */
router.put(
  '/:id',
  protect,
  [
    param('id').isInt().withMessage('Task ID must be an integer'),
    body('title')
      .optional()
      .notEmpty()
      .withMessage('Title cannot be empty')
      .isLength({ max: 100 })
      .withMessage('Title must be 100 characters or less'),
    body('description')
      .optional()
      .isString()
      .withMessage('Description must be a string'),
    body('category_id')
      .optional()
      .isInt()
      .withMessage('Category ID must be an integer'),
    body('priority_id')
      .optional()
      .isInt()
      .withMessage('Priority ID must be an integer'),
    body('due_date')
      .optional()
      .isISO8601()
      .withMessage('Due date must be a valid date'),
    body('status')
      .optional()
      .isIn(Object.values(TaskStatus))
      .withMessage(`Status must be one of: ${Object.values(TaskStatus).join(', ')}`)
  ],
  TaskController.updateTask
);

/**
 * @route   DELETE /api/tasks/:id
 * @desc    Delete a task
 * @access  Private
 */
router.delete(
  '/:id',
  protect,
  param('id').isInt().withMessage('Task ID must be an integer'),
  TaskController.deleteTask
);

/**
 * @route   PATCH /api/tasks/:id/status
 * @desc    Update task status
 * @access  Private
 */
router.patch(
  '/:id/status',
  protect,
  [
    param('id').isInt().withMessage('Task ID must be an integer'),
    body('status')
      .notEmpty()
      .withMessage('Status is required')
      .isIn(Object.values(TaskStatus))
      .withMessage(`Status must be one of: ${Object.values(TaskStatus).join(', ')}`)
  ],
  TaskController.updateTaskStatus
);

export default router;