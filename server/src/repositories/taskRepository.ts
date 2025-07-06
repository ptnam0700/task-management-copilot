import { query } from '../config/database';
import { ApiError } from '../utils/error.utils';
import { ITask, ITaskCreate, ITaskQuery, ITaskUpdate, TaskStatus } from '../interfaces/task.interface';
import { ITaskRepository } from '../interfaces/taskRepository.interface';
import { Task } from '../models/task.model';

/**
 * PostgreSQL implementation of the Task Repository
 */
export class TaskRepository implements ITaskRepository {
  /**
   * Find a task by ID
   * @param id Task ID
   * @returns Task object or null if not found
   */
  async findById(id: number): Promise<ITask | null> {
    try {
      const result = await query(
        `SELECT * FROM tasks WHERE task_id = $1`,
        [id]
      );
      
      return result.rows.length > 0 ? Task.fromDatabaseRow(result.rows[0]) : null;
    } catch (error) {
      console.error('Error in findById:', error);
      throw new ApiError('Error finding task by ID', 500);
    }
  }

  /**
   * Create a new task
   * @param data Task data to create
   * @returns Created task object
   */
  async create(data: ITaskCreate): Promise<ITask> {
    try {
      // Validate task data
      Task.validateCreate(data);
      
      const { user_id, title, description, category_id, priority_id, due_date } = data;
      
      // Create task
      const result = await query(
        `INSERT INTO tasks 
         (user_id, title, description, category_id, priority_id, due_date, status)
         VALUES 
         ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [user_id, title, description, category_id, priority_id, due_date, TaskStatus.PENDING]
      );
      
      return Task.fromDatabaseRow(result.rows[0]);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      console.error('Error in create:', error);
      throw new ApiError('Error creating task', 500);
    }
  }

  /**
   * Update an existing task
   * @param id Task ID
   * @param data Task data to update
   * @returns Updated task object or null if not found
   */
  async update(id: number, data: ITaskUpdate): Promise<ITask | null> {
    try {
      // Check if task exists
      const existingTask = await this.findById(id);
      if (!existingTask) {
        return null;
      }
      
      // Validate update data
      Task.validateUpdate(data);
      
      // Build update query
      const updates: string[] = [];
      const values: any[] = [];
      let paramCount = 1;
      
      if (data.title !== undefined) {
        updates.push(`title = $${paramCount++}`);
        values.push(data.title);
      }
      
      if (data.description !== undefined) {
        updates.push(`description = $${paramCount++}`);
        values.push(data.description);
      }
      
      if (data.category_id !== undefined) {
        updates.push(`category_id = $${paramCount++}`);
        values.push(data.category_id);
      }
      
      if (data.priority_id !== undefined) {
        updates.push(`priority_id = $${paramCount++}`);
        values.push(data.priority_id);
      }
      
      if (data.due_date !== undefined) {
        updates.push(`due_date = $${paramCount++}`);
        values.push(data.due_date);
      }
      
      if (data.status !== undefined) {
        updates.push(`status = $${paramCount++}`);
        values.push(data.status);
      }
      
      // If nothing to update
      if (updates.length === 0) {
        return existingTask;
      }
      
      // Add task_id to values
      values.push(id);
      
      const result = await query(
        `UPDATE tasks
         SET ${updates.join(', ')}, updated_at = NOW()
         WHERE task_id = $${paramCount}
         RETURNING *`,
        values
      );
      
      return Task.fromDatabaseRow(result.rows[0]);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      console.error('Error in update:', error);
      throw new ApiError('Error updating task', 500);
    }
  }

  /**
   * Delete a task
   * @param id Task ID
   * @returns Boolean indicating if deletion was successful
   */
  async delete(id: number): Promise<boolean> {
    try {
      const result = await query(
        `DELETE FROM tasks WHERE task_id = $1 RETURNING task_id`,
        [id]
      );
      
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      console.error('Error in delete:', error);
      throw new ApiError('Error deleting task', 500);
    }
  }

  /**
   * Find all tasks (optionally filtered)
   * @param filter Optional filter criteria
   * @returns Array of tasks matching filter criteria
   */
  async findAll(filter?: Partial<ITask>): Promise<ITask[]> {
    try {
      let queryText = `SELECT * FROM tasks`;
      const values: any[] = [];
      let paramCount = 1;
      
      // Build WHERE clause if filters are provided
      if (filter && Object.keys(filter).length > 0) {
        const conditions: string[] = [];
        
        if (filter.user_id !== undefined) {
          conditions.push(`user_id = $${paramCount++}`);
          values.push(filter.user_id);
        }
        
        if (filter.category_id !== undefined) {
          conditions.push(`category_id = $${paramCount++}`);
          values.push(filter.category_id);
        }
        
        if (filter.priority_id !== undefined) {
          conditions.push(`priority_id = $${paramCount++}`);
          values.push(filter.priority_id);
        }
        
        if (filter.status !== undefined) {
          conditions.push(`status = $${paramCount++}`);
          values.push(filter.status);
        }
        
        if (conditions.length > 0) {
          queryText += ` WHERE ${conditions.join(' AND ')}`;
        }
      }
      
      queryText += ` ORDER BY due_date ASC NULLS LAST, created_at DESC`;
      
      const result = await query(queryText, values);
      
      return result.rows.map(Task.fromDatabaseRow);
    } catch (error) {
      console.error('Error in findAll:', error);
      throw new ApiError('Error finding tasks', 500);
    }
  }

  /**
   * Find tasks by user ID with optional filtering and searching
   * @param userId User ID
   * @param queryParams Optional query parameters
   * @returns Array of tasks
   */
  async findByUserId(userId: number, queryParams?: ITaskQuery): Promise<ITask[]> {
    try {
      let queryText = `SELECT * FROM tasks WHERE user_id = $1`;
      const values: any[] = [userId];
      let paramCount = 2;
      
      // Apply filters if provided
      if (queryParams) {
        if (queryParams.category_id !== undefined) {
          queryText += ` AND category_id = $${paramCount++}`;
          values.push(queryParams.category_id);
        }
        
        if (queryParams.priority_id !== undefined) {
          queryText += ` AND priority_id = $${paramCount++}`;
          values.push(queryParams.priority_id);
        }
        
        if (queryParams.status !== undefined) {
          queryText += ` AND status = $${paramCount++}`;
          values.push(queryParams.status);
        }
        
        if (queryParams.due_date !== undefined) {
          queryText += ` AND DATE(due_date) = DATE($${paramCount++})`;
          values.push(queryParams.due_date);
        }
        
        if (queryParams.search) {
          queryText += ` AND (title ILIKE $${paramCount} OR description ILIKE $${paramCount})`;
          values.push(`%${queryParams.search}%`);
          paramCount++;
        }
      }
      
      // Order tasks: first by due date (nulls last), then by creation date (newest first)
      queryText += ` ORDER BY due_date ASC NULLS LAST, created_at DESC`;
      
      const result = await query(queryText, values);
      
      return result.rows.map(Task.fromDatabaseRow);
    } catch (error) {
      console.error('Error in findByUserId:', error);
      throw new ApiError('Error finding user tasks', 500);
    }
  }

  /**
   * Find tasks by category ID
   * @param categoryId Category ID
   * @returns Array of tasks
   */
  async findByCategoryId(categoryId: number): Promise<ITask[]> {
    try {
      const result = await query(
        `SELECT * FROM tasks WHERE category_id = $1 ORDER BY due_date ASC NULLS LAST, created_at DESC`,
        [categoryId]
      );
      
      return result.rows.map(Task.fromDatabaseRow);
    } catch (error) {
      console.error('Error in findByCategoryId:', error);
      throw new ApiError('Error finding tasks by category', 500);
    }
  }

  /**
   * Find tasks by priority ID
   * @param priorityId Priority ID
   * @returns Array of tasks
   */
  async findByPriorityId(priorityId: number): Promise<ITask[]> {
    try {
      const result = await query(
        `SELECT * FROM tasks WHERE priority_id = $1 ORDER BY due_date ASC NULLS LAST, created_at DESC`,
        [priorityId]
      );
      
      return result.rows.map(Task.fromDatabaseRow);
    } catch (error) {
      console.error('Error in findByPriorityId:', error);
      throw new ApiError('Error finding tasks by priority', 500);
    }
  }

  /**
   * Search tasks by title or description
   * @param userId User ID
   * @param searchTerm Search term
   * @returns Array of matching tasks
   */
  async search(userId: number, searchTerm: string): Promise<ITask[]> {
    try {
      const result = await query(
        `SELECT * FROM tasks 
         WHERE user_id = $1 
         AND (title ILIKE $2 OR description ILIKE $2)
         ORDER BY due_date ASC NULLS LAST, created_at DESC`,
        [userId, `%${searchTerm}%`]
      );
      
      return result.rows.map(Task.fromDatabaseRow);
    } catch (error) {
      console.error('Error in search:', error);
      throw new ApiError('Error searching tasks', 500);
    }
  }

  /**
   * Change task status
   * @param taskId Task ID
   * @param status New status
   * @returns Updated task or null if not found
   */
  async changeStatus(taskId: number, status: string): Promise<ITask | null> {
    try {
      // Validate status
      const validStatuses = Object.values(TaskStatus);
      if (!validStatuses.includes(status as TaskStatus)) {
        throw ApiError.badRequest(
          `Status must be one of: ${validStatuses.join(', ')}`,
          'INVALID_STATUS'
        );
      }
      
      const result = await query(
        `UPDATE tasks
         SET status = $1, updated_at = NOW()
         WHERE task_id = $2
         RETURNING *`,
        [status, taskId]
      );
      
      return result.rows.length > 0 ? Task.fromDatabaseRow(result.rows[0]) : null;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      console.error('Error in changeStatus:', error);
      throw new ApiError('Error changing task status', 500);
    }
  }
}