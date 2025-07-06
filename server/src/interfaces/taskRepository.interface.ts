import { IBaseRepository } from './repository.interface';
import { ITask, ITaskCreate, ITaskQuery, ITaskUpdate } from './task.interface';

/**
 * Task Repository Interface
 * Extends base repository with task-specific operations
 */
export interface ITaskRepository extends IBaseRepository<ITask, number, ITaskCreate> {
  /**
   * Find tasks by user ID
   * @param userId User ID
   * @param query Optional query parameters for filtering and searching
   * @returns Promise resolving to array of tasks
   */
  findByUserId(userId: number, query?: ITaskQuery): Promise<ITask[]>;
  
  /**
   * Find tasks by category ID
   * @param categoryId Category ID
   * @returns Promise resolving to array of tasks
   */
  findByCategoryId(categoryId: number): Promise<ITask[]>;
  
  /**
   * Find tasks by priority ID
   * @param priorityId Priority ID
   * @returns Promise resolving to array of tasks
   */
  findByPriorityId(priorityId: number): Promise<ITask[]>;
  
  /**
   * Search tasks by title or description
   * @param userId User ID
   * @param searchTerm Search term
   * @returns Promise resolving to array of matching tasks
   */
  search(userId: number, searchTerm: string): Promise<ITask[]>;
  
  /**
   * Change task status
   * @param taskId Task ID
   * @param status New status
   * @returns Promise resolving to updated task or null if not found
   */
  changeStatus(taskId: number, status: string): Promise<ITask | null>;
}