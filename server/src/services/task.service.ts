import { ApiError } from '../utils/error.utils';
import { ITask, ITaskCreate, ITaskQuery, ITaskUpdate, TaskStatus } from '../interfaces/task.interface';
import { TaskRepository } from '../repositories/taskRepository';

/**
 * Task Service
 * Handles business logic for task operations
 */
export class TaskService {
  private repository: TaskRepository;

  /**
   * Create a new TaskService instance
   */
  constructor() {
    this.repository = new TaskRepository();
  }

  /**
   * Get a task by its ID
   * @param taskId Task ID
   * @returns Task object or null if not found
   */
  async getTaskById(taskId: number): Promise<ITask | null> {
    try {
      return await this.repository.findById(taskId);
    } catch (error) {
      console.error('Error in getTaskById:', error);
      throw error;
    }
  }

  /**
   * Get all tasks for a specific user with optional filtering
   * @param userId User ID
   * @param queryParams Optional query parameters for filtering
   * @returns Array of tasks
   */
  async getUserTasks(userId: number, queryParams?: ITaskQuery): Promise<ITask[]> {
    try {
      return await this.repository.findByUserId(userId, queryParams);
    } catch (error) {
      console.error('Error in getUserTasks:', error);
      throw error;
    }
  }

  /**
   * Search for tasks by keyword
   * @param userId User ID
   * @param searchTerm Search term
   * @returns Array of tasks matching the search term
   */
  async searchTasks(userId: number, searchTerm: string): Promise<ITask[]> {
    try {
      return await this.repository.search(userId, searchTerm);
    } catch (error) {
      console.error('Error in searchTasks:', error);
      throw error;
    }
  }

  /**
   * Create a new task
   * @param taskData Task data
   * @returns Created task
   * @throws ApiError if validation fails
   */
  async createTask(taskData: ITaskCreate): Promise<ITask> {
    try {
      // Additional business validation can go here
      if (taskData.due_date) {
        this.validateDueDate(taskData.due_date);
      }
      
      return await this.repository.create(taskData);
    } catch (error) {
      console.error('Error in createTask:', error);
      throw error;
    }
  }

  /**
   * Update an existing task
   * @param taskId Task ID
   * @param taskData Task data to update
   * @param userId User ID (for authorization)
   * @returns Updated task or null if not found
   * @throws ApiError if validation fails or user is not authorized
   */
  async updateTask(taskId: number, taskData: ITaskUpdate, userId: number): Promise<ITask | null> {
    try {
      // Check if task exists
      const existingTask = await this.repository.findById(taskId);
      if (!existingTask) {
        return null;
      }
      
      // Authorize the user
      this.authorizeTaskOperation(existingTask, userId);
      
      // Additional business validation
      if (taskData.due_date) {
        this.validateDueDate(taskData.due_date);
      }
      
      return await this.repository.update(taskId, taskData);
    } catch (error) {
      console.error('Error in updateTask:', error);
      throw error;
    }
  }

  /**
   * Delete a task
   * @param taskId Task ID
   * @param userId User ID (for authorization)
   * @returns Boolean indicating if deletion was successful
   * @throws ApiError if user is not authorized
   */
  async deleteTask(taskId: number, userId: number): Promise<boolean> {
    try {
      // Check if task exists
      const existingTask = await this.repository.findById(taskId);
      if (!existingTask) {
        return false;
      }
      // Authorize the user
      this.authorizeTaskOperation(existingTask, userId);
      
      return await this.repository.delete(taskId);
    } catch (error) {
      console.error('Error in deleteTask:', error);
      throw error;
    }
  }

  /**
   * Change task status
   * @param taskId Task ID
   * @param status New status
   * @param userId User ID (for authorization)
   * @returns Updated task or null if not found
   * @throws ApiError if validation fails or user is not authorized
   */
  async changeTaskStatus(taskId: number, status: string, userId: number): Promise<ITask | null> {
    try {
      // Check if task exists
      const existingTask = await this.repository.findById(taskId);
      if (!existingTask) {
        return null;
      }
      // Authorize the user
      this.authorizeTaskOperation(existingTask, userId);
      // Check if the status is valid
      if (!Object.values(TaskStatus).includes(status as TaskStatus)) {
        throw ApiError.badRequest(
          `Status must be one of: ${Object.values(TaskStatus).join(', ')}`,
          'INVALID_STATUS'
        );
      }
      
      // Apply business logic based on status changes
      if (status === TaskStatus.COMPLETED) {
        // Possibly update statistics, etc.
        console.log(`Task ${taskId} marked as completed`);
      }
      
      return await this.repository.changeStatus(taskId, status);
    } catch (error) {
      console.error('Error in changeTaskStatus:', error);
      throw error;
    }
  }

  /**
   * Get tasks by category
   * @param categoryId Category ID
   * @param userId User ID (for authorization)
   * @returns Array of tasks in the category
   */
  async getTasksByCategory(categoryId: number, userId: number): Promise<ITask[]> {
    try {
      const tasks = await this.repository.findByCategoryId(categoryId);
      // Filter tasks to only return those owned by the user
      return tasks.filter(task => task.user_id === userId);
    } catch (error) {
      console.error('Error in getTasksByCategory:', error);
      throw error;
    }
  }

  /**
   * Get tasks by priority
   * @param priorityId Priority ID
   * @param userId User ID (for authorization)
   * @returns Array of tasks with the specified priority
   */
  async getTasksByPriority(priorityId: number, userId: number): Promise<ITask[]> {
    try {
      const tasks = await this.repository.findByPriorityId(priorityId);
      // Filter tasks to only return those owned by the user
      return tasks.filter(task => task.user_id === userId);
    } catch (error) {
      console.error('Error in getTasksByPriority:', error);
      throw error;
    }
  }

  /**
   * Get tasks due soon (within the next X days)
   * @param userId User ID
   * @param days Number of days (default: 3)
   * @returns Array of tasks due within the specified days
   */
  async getTasksDueSoon(userId: number, days: number = 3): Promise<ITask[]> {
    try {
      // Get all user's tasks
      const userTasks = await this.repository.findByUserId(userId);
      
      // Calculate the cutoff date
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() + days);
      
      // Filter tasks due within the specified days that aren't completed
      return userTasks.filter(task => {
        if (!task.due_date || task.status === TaskStatus.COMPLETED) {
          return false;
        }
        
        const dueDate = new Date(task.due_date);
        return dueDate <= cutoffDate && dueDate >= new Date();
      });
    } catch (error) {
      console.error('Error in getTasksDueSoon:', error);
      throw error;
    }
  }

  /**
   * Get overdue tasks
   * @param userId User ID
   * @returns Array of overdue tasks
   */
  async getOverdueTasks(userId: number): Promise<ITask[]> {
    try {
      // Get all user's tasks
      const userTasks = await this.repository.findByUserId(userId);
      const today = new Date();
      
      // Filter tasks that are overdue and not completed
      return userTasks.filter(task => {
        if (!task.due_date || task.status === TaskStatus.COMPLETED) {
          return false;
        }
        
        const dueDate = new Date(task.due_date);
        return dueDate < today;
      });
    } catch (error) {
      console.error('Error in getOverdueTasks:', error);
      throw error;
    }
  }

  /**
   * Get tasks by status
   * @param userId User ID
   * @param status Task status
   * @returns Array of tasks with the specified status
   */
  async getTasksByStatus(userId: number, status: TaskStatus): Promise<ITask[]> {
    try {
      const filter: ITaskQuery = { 
        status: status 
      };
      return await this.repository.findByUserId(userId, filter);
    } catch (error) {
      console.error('Error in getTasksByStatus:', error);
      throw error;
    }
  }

  /**
   * Check if a user is authorized to perform operations on a task
   * @param task Task object
   * @param userId User ID
   * @throws ApiError if user is not authorized
   */
  private authorizeTaskOperation(task: ITask, userId: number, isAdmin: boolean = false): void {
    if (task.user_id !== userId && !isAdmin) {
      throw ApiError.forbidden('Not authorized to perform this action on this task', 'FORBIDDEN');
    }
  }

  /**
   * Validate due date - ensure it's not in the past
   * @param dueDate Due date to validate
   * @throws ApiError if due date is invalid
   */
  private validateDueDate(dueDate?: Date): void {
    if (dueDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to start of day for fair comparison
      
      const dueDateObj = new Date(dueDate);
      dueDateObj.setHours(0, 0, 0, 0);
      
      if (dueDateObj < today) {
        throw ApiError.badRequest('Due date cannot be in the past', 'INVALID_DUE_DATE');
      }
    }
  }
}