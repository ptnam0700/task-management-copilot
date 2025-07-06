/**
 * Base Repository Interface
 * Defines common CRUD operations for data access
 */
export interface IBaseRepository<T, K, C> {
  /**
   * Find entity by ID
   * @param id Entity identifier
   * @returns Promise resolving to entity or null if not found
   */
  findById(id: K): Promise<T | null>;
  
  /**
   * Create a new entity
   * @param data Data to create entity with
   * @returns Promise resolving to created entity
   */
  create(data: C): Promise<T>;
  
  /**
   * Update an existing entity
   * @param id Entity identifier
   * @param data Data to update entity with
   * @returns Promise resolving to updated entity or null if not found
   */
  update(id: K, data: Partial<T>): Promise<T | null>;
  
  /**
   * Delete an entity
   * @param id Entity identifier
   * @returns Promise resolving to boolean indicating success
   */
  delete(id: K): Promise<boolean>;
  
  /**
   * Find all entities
   * @param filter Optional filter criteria
   * @returns Promise resolving to array of entities
   */
  findAll(filter?: Partial<T>): Promise<T[]>;
}