import { ITask, ITaskCreate, ITaskUpdate, TaskStatus } from '../interfaces/task.interface';
import { ApiError } from '../utils/error.utils';

/**
 * Task Model
 * Provides validation and utility methods for task entities
 */
export class Task {
  /**
   * Validate task creation data
   * @param data Task data to validate
   * @throws ApiError if validation fails
   */
  static validateCreate(data: ITaskCreate): void {
    // User ID is required
    if (!data.user_id) {
      throw ApiError.badRequest('User ID is required', 'USER_ID_REQUIRED');
    }
    
    // Title is required and should not be empty
    if (!data.title || data.title.trim().length === 0) {
      throw ApiError.badRequest('Task title is required', 'INVALID_TITLE');
    }

    // Title should not exceed 100 characters (based on DB schema)
    if (data.title.length > 100) {
      throw ApiError.badRequest('Task title must be 100 characters or less', 'INVALID_TITLE_LENGTH');
    }

    // Validate due date if provided
    if (data.due_date && isNaN(new Date(data.due_date).getTime())) {
      throw ApiError.badRequest('Invalid due date format', 'INVALID_DUE_DATE');
    }
  }

  /**
   * Validate task update data
   * @param data Task data to validate
   * @throws ApiError if validation fails
   */
  static validateUpdate(data: ITaskUpdate): void {
    // Check if there's any data to update
    if (Object.keys(data).length === 0) {
      throw ApiError.badRequest('No data provided for update', 'NO_UPDATE_DATA');
    }

    // Validate title if provided
    if (data.title !== undefined) {
      if (data.title.trim().length === 0) {
        throw ApiError.badRequest('Task title cannot be empty', 'INVALID_TITLE');
      }
      if (data.title.length > 100) {
        throw ApiError.badRequest('Task title must be 100 characters or less', 'INVALID_TITLE_LENGTH');
      }
    }

    // Validate due date if provided
    if (data.due_date && isNaN(new Date(data.due_date).getTime())) {
      throw ApiError.badRequest('Invalid due date format', 'INVALID_DUE_DATE');
    }

    // Validate status if provided
    if (data.status) {
      const validStatuses = Object.values(TaskStatus);
      if (!validStatuses.includes(data.status)) {
        throw ApiError.badRequest(
          `Status must be one of: ${validStatuses.join(', ')}`,
          'INVALID_STATUS'
        );
      }
    }
  }

  /**
   * Parse task from database row
   * @param row Database row
   * @returns Task object
   */
  static fromDatabaseRow(row: any): ITask {
    return {
      task_id: row.task_id,
      user_id: row.user_id,
      category_id: row.category_id || null,
      priority_id: row.priority_id || null,
      title: row.title,
      description: row.description || null,
      due_date: row.due_date ? new Date(row.due_date) : undefined,
      status: row.status as TaskStatus,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at)
    };
  }
}