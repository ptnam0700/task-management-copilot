import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { ApiError } from '../utils/error.utils';
import { ITaskCreate, ITaskUpdate, TaskStatus } from '../interfaces/task.interface';
import { TaskService } from '../services/task.service';

/**
 * Task Controller
 * Handles HTTP requests related to tasks
 */
export class TaskController {
  private static taskService: TaskService = new TaskService();

  /**
   * @route   GET /api/tasks
   * @desc    Get all tasks for current user
   * @access  Private
   */
  static async getAllTasks(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || !req.user.id) {
        next(ApiError.unauthorized('Not authorized', 'NOT_AUTHORIZED'));
        return;
      }

      // Check for search term
      if (req.query.search) {
        const tasks = await TaskController.taskService.searchTasks(
          req.user.id,
          req.query.search as string
        );
        res.status(200).json({
          success: true,
          count: tasks.length,
          data: tasks
        });
        return;
      }

      // Build query filters from request query parameters
      const filters: any = {};

      if (req.query.category_id) {
        filters.category_id = parseInt(req.query.category_id as string);
      }

      if (req.query.priority_id) {
        filters.priority_id = parseInt(req.query.priority_id as string);
      }

      if (req.query.status) {
        filters.status = req.query.status as TaskStatus;
      }
      
      if (req.query.due_date) {
        filters.due_date = new Date(req.query.due_date as string);
      }

      // Get all tasks with filters
      const tasks = await TaskController.taskService.getUserTasks(req.user.id, filters);
      
      res.status(200).json({
        success: true,
        count: tasks.length,
        data: tasks
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route   GET /api/tasks/:id
   * @desc    Get task by ID
   * @access  Private
   */
  static async getTaskById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const taskId = parseInt(req.params.id);
      
      if (!req.user || !req.user.id) {
        next(ApiError.unauthorized('Not authorized', 'NOT_AUTHORIZED'));
        return;
      }

      // Get task by ID
      const task = await TaskController.taskService.getTaskById(taskId);
      
      if (!task) {
        next(ApiError.notFound('Task not found', 'TASK_NOT_FOUND'));
        return;
      }

      // Check if user is authorized to view this task
      if (task.user_id !== req.user.id && req.user.role !== 'admin') {
        next(ApiError.forbidden('Not authorized to access this task', 'FORBIDDEN'));
        return;
      }
      
      res.status(200).json({
        success: true,
        data: task
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route   POST /api/tasks
   * @desc    Create new task
   * @access  Private
   */
  static async createTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        next(ApiError.badRequest('Validation error', 'VALIDATION_ERROR', errors.array()));
        return;
      }

      if (!req.user || !req.user.id) {
        next(ApiError.unauthorized('Not authorized', 'NOT_AUTHORIZED'));
        return;
      }

      // Create task data with the user ID from the authenticated user
      const taskData: ITaskCreate = {
        ...req.body,
        user_id: req.user.id
      };

      // Create task using the service
      const task = await TaskController.taskService.createTask(taskData);
      
      res.status(201).json({
        success: true,
        message: 'Task created successfully',
        data: task
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route   PUT /api/tasks/:id
   * @desc    Update task
   * @access  Private
   */
  static async updateTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        next(ApiError.badRequest('Validation error', 'VALIDATION_ERROR', errors.array()));
        return;
      }

      const taskId = parseInt(req.params.id);
      
      if (!req.user || !req.user.id) {
        next(ApiError.unauthorized('Not authorized', 'NOT_AUTHORIZED'));
        return;
      }

      // Update task data
      const taskData: ITaskUpdate = req.body;
      
      // Update task using the service
      const updatedTask = await TaskController.taskService.updateTask(
        taskId, 
        taskData, 
        req.user.id
      );
      
      if (!updatedTask) {
        next(ApiError.notFound('Task not found', 'TASK_NOT_FOUND'));
        return;
      }
      
      res.status(200).json({
        success: true,
        message: 'Task updated successfully',
        data: updatedTask
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route   DELETE /api/tasks/:id
   * @desc    Delete task
   * @access  Private
   */
  static async deleteTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const taskId = parseInt(req.params.id);
      
      if (!req.user || !req.user.id) {
        next(ApiError.unauthorized('Not authorized', 'NOT_AUTHORIZED'));
        return;
      }

      // Delete task using the service
      const success = await TaskController.taskService.deleteTask(taskId, req.user.id);
      
      if (!success) {
        next(ApiError.notFound('Task not found', 'TASK_NOT_FOUND'));
        return;
      }
      
      res.status(200).json({
        success: true,
        message: 'Task deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route   PATCH /api/tasks/:id/status
   * @desc    Update task status
   * @access  Private
   */
  static async updateTaskStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const taskId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!req.user || !req.user.id) {
        next(ApiError.unauthorized('Not authorized', 'NOT_AUTHORIZED'));
        return;
      }

      // Update task status using the service
      const updatedTask = await TaskController.taskService.changeTaskStatus(
        taskId, 
        status, 
        req.user.id
      );
      
      if (!updatedTask) {
        next(ApiError.notFound('Task not found', 'TASK_NOT_FOUND'));
        return;
      }
      
      res.status(200).json({
        success: true,
        message: 'Task status updated successfully',
        data: updatedTask
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route   GET /api/tasks/due-soon
   * @desc    Get tasks due soon (within specified days)
   * @access  Private
   */
  static async getTasksDueSoon(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || !req.user.id) {
        next(ApiError.unauthorized('Not authorized', 'NOT_AUTHORIZED'));
        return;
      }

      // Get days from query params or use default (3)
      const days = req.query.days ? parseInt(req.query.days as string) : 3;
      
      // Get tasks due soon using the service
      const tasks = await TaskController.taskService.getTasksDueSoon(req.user.id, days);
      
      res.status(200).json({
        success: true,
        count: tasks.length,
        data: tasks
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route   GET /api/tasks/overdue
   * @desc    Get overdue tasks
   * @access  Private
   */
  static async getOverdueTasks(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || !req.user.id) {
        next(ApiError.unauthorized('Not authorized', 'NOT_AUTHORIZED'));
        return;
      }

      // Get overdue tasks using the service
      const tasks = await TaskController.taskService.getOverdueTasks(req.user.id);
      
      res.status(200).json({
        success: true,
        count: tasks.length,
        data: tasks
      });
    } catch (error) {
      next(error);
    }
  }
}