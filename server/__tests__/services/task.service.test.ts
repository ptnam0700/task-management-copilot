import { TaskService } from '../../src/services/task.service';
import { TaskRepository } from '../../src/repositories/taskRepository';
import { ApiError } from '../../src/utils/error.utils';
import { ITask, ITaskCreate, ITaskUpdate, TaskStatus } from '../../src/interfaces/task.interface';

// Mock the TaskRepository
jest.mock('../../src/repositories/taskRepository');

describe('TaskService', () => {
  let taskService: TaskService;
  let mockTaskRepository: jest.Mocked<TaskRepository>;
  
  // Mock data
  const mockTasks: ITask[] = [
    {
      task_id: 1,
      user_id: 1,
      category_id: 1,
      priority_id: 2,
      title: 'Complete project',
      description: 'Finish the project documentation',
      status: TaskStatus.IN_PROGRESS,
      created_at: new Date('2023-01-01'),
      updated_at: new Date('2023-01-01')
    },
    {
      task_id: 2,
      user_id: 1,
      title: 'Review code',
      status: TaskStatus.PENDING,
      created_at: new Date('2023-01-02'),
      updated_at: new Date('2023-01-02')
    }
  ];

  const mockTaskCreate: ITaskCreate = {
    user_id: 1,
    title: 'New Task',
    description: 'Task description',
    category_id: 1,
    priority_id: 1,
  };

  const mockTaskUpdate: ITaskUpdate = {
    title: 'Updated Task',
    description: 'Updated description'
  };

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Create a new instance of TaskService for each test
    taskService = new TaskService();
    
    // Get the mocked TaskRepository instance
    mockTaskRepository = TaskRepository.prototype as jest.Mocked<TaskRepository>;
  });

  describe('getTaskById', () => {
    it('should return a task by id', async () => {
      // Arrange
      const taskId = 1;
      mockTaskRepository.findById.mockResolvedValue(mockTasks[0]);
      
      // Act
      const result = await taskService.getTaskById(taskId);
      
      // Assert
      expect(result).toEqual(mockTasks[0]);
      expect(mockTaskRepository.findById).toHaveBeenCalledWith(taskId);
    });

    it('should return null if task not found', async () => {
      // Arrange
      const taskId = 999;
      mockTaskRepository.findById.mockResolvedValue(null);
      
      // Act
      const result = await taskService.getTaskById(taskId);
      
      // Assert
      expect(result).toBeNull();
      expect(mockTaskRepository.findById).toHaveBeenCalledWith(taskId);
    });

    it('should propagate errors from repository', async () => {
      // Arrange
      const taskId = 1;
      const error = new Error('Database error');
      mockTaskRepository.findById.mockRejectedValue(error);
      
      // Act & Assert
      await expect(taskService.getTaskById(taskId)).rejects.toThrow(error);
      expect(mockTaskRepository.findById).toHaveBeenCalledWith(taskId);
    });
  });

  describe('getUserTasks', () => {
    it('should return all tasks for a user', async () => {
      // Arrange
      const userId = 1;
      mockTaskRepository.findByUserId.mockResolvedValue(mockTasks);
      
      // Act
      const result = await taskService.getUserTasks(userId);
      
      // Assert
      expect(result).toEqual(mockTasks);
      expect(mockTaskRepository.findByUserId).toHaveBeenCalledWith(userId, undefined);
    });

    it('should apply query filters', async () => {
      // Arrange
      const userId = 1;
      const filters = { status: TaskStatus.IN_PROGRESS };
      mockTaskRepository.findByUserId.mockResolvedValue([mockTasks[0]]);
      
      // Act
      const result = await taskService.getUserTasks(userId, filters);
      
      // Assert
      expect(result).toEqual([mockTasks[0]]);
      expect(mockTaskRepository.findByUserId).toHaveBeenCalledWith(userId, filters);
    });
  });

  describe('searchTasks', () => {
    it('should search tasks by keyword', async () => {
      // Arrange
      const userId = 1;
      const searchTerm = 'project';
      mockTaskRepository.search.mockResolvedValue([mockTasks[0]]);
      
      // Act
      const result = await taskService.searchTasks(userId, searchTerm);
      
      // Assert
      expect(result).toEqual([mockTasks[0]]);
      expect(mockTaskRepository.search).toHaveBeenCalledWith(userId, searchTerm);
    });
  });

  describe('createTask', () => {
    it('should create a new task', async () => {
      // Arrange
      const newTask = { ...mockTasks[0] };
      mockTaskRepository.create.mockResolvedValue(newTask);
      
      // Act
      const result = await taskService.createTask(mockTaskCreate);
      
      // Assert
      expect(result).toEqual(newTask);
      expect(mockTaskRepository.create).toHaveBeenCalledWith(mockTaskCreate);
    });

    it('should validate due date is not in the past', async () => {
      // Arrange
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      const taskWithPastDueDate = { ...mockTaskCreate, due_date: pastDate };
      
      // Act & Assert
      await expect(taskService.createTask(taskWithPastDueDate))
        .rejects.toThrow(ApiError);
      expect(mockTaskRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('updateTask', () => {
    it('should update an existing task', async () => {
      // Arrange
      const taskId = 1;
      const userId = 1;
      const updatedTask = { ...mockTasks[0], ...mockTaskUpdate };
      mockTaskRepository.findById.mockResolvedValue(mockTasks[0]);
      mockTaskRepository.update.mockResolvedValue(updatedTask);
      
      // Act
      const result = await taskService.updateTask(taskId, mockTaskUpdate, userId);
      
      // Assert
      expect(result).toEqual(updatedTask);
      expect(mockTaskRepository.findById).toHaveBeenCalledWith(taskId);
      expect(mockTaskRepository.update).toHaveBeenCalledWith(taskId, mockTaskUpdate);
    });

    it('should return null if task not found', async () => {
      // Arrange
      const taskId = 999;
      const userId = 1;
      mockTaskRepository.findById.mockResolvedValue(null);
      
      // Act
      const result = await taskService.updateTask(taskId, mockTaskUpdate, userId);
      
      // Assert
      expect(result).toBeNull();
      expect(mockTaskRepository.findById).toHaveBeenCalledWith(taskId);
      expect(mockTaskRepository.update).not.toHaveBeenCalled();
    });

    it('should throw error if user not authorized', async () => {
      // Arrange
      const taskId = 1;
      const userId = 2; // Different from task's user_id
      mockTaskRepository.findById.mockResolvedValue(mockTasks[0]);
      
      // Act & Assert
      await expect(taskService.updateTask(taskId, mockTaskUpdate, userId))
        .rejects.toThrow(ApiError);
      expect(mockTaskRepository.findById).toHaveBeenCalledWith(taskId);
      expect(mockTaskRepository.update).not.toHaveBeenCalled();
    });

    it('should validate due date when updating', async () => {
      // Arrange
      const taskId = 1;
      const userId = 1;
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      const updateWithPastDueDate = { ...mockTaskUpdate, due_date: pastDate };
      mockTaskRepository.findById.mockResolvedValue(mockTasks[0]);
      
      // Act & Assert
      await expect(taskService.updateTask(taskId, updateWithPastDueDate, userId))
        .rejects.toThrow(ApiError);
      expect(mockTaskRepository.findById).toHaveBeenCalledWith(taskId);
      expect(mockTaskRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('deleteTask', () => {
    it('should delete an existing task', async () => {
      // Arrange
      const taskId = 1;
      const userId = 1;
      mockTaskRepository.findById.mockResolvedValue(mockTasks[0]);
      mockTaskRepository.delete.mockResolvedValue(true);
      
      // Act
      const result = await taskService.deleteTask(taskId, userId);
      
      // Assert
      expect(result).toBe(true);
      expect(mockTaskRepository.findById).toHaveBeenCalledWith(taskId);
      expect(mockTaskRepository.delete).toHaveBeenCalledWith(taskId);
    });

    it('should return false if task not found', async () => {
      // Arrange
      const taskId = 999;
      const userId = 1;
      mockTaskRepository.findById.mockResolvedValue(null);
      
      // Act
      const result = await taskService.deleteTask(taskId, userId);
      
      // Assert
      expect(result).toBe(false);
      expect(mockTaskRepository.findById).toHaveBeenCalledWith(taskId);
      expect(mockTaskRepository.delete).not.toHaveBeenCalled();
    });

    it('should throw error if user not authorized', async () => {
      // Arrange
      const taskId = 1;
      const userId = 2; // Different from task's user_id
      mockTaskRepository.findById.mockResolvedValue(mockTasks[0]);
      
      // Act & Assert
      await expect(taskService.deleteTask(taskId, userId))
        .rejects.toThrow(ApiError);
      expect(mockTaskRepository.findById).toHaveBeenCalledWith(taskId);
      expect(mockTaskRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe('changeTaskStatus', () => {
    it('should change task status', async () => {
      // Arrange
      const taskId = 1;
      const userId = 1;
      const newStatus = TaskStatus.COMPLETED;
      const updatedTask = { ...mockTasks[0], status: newStatus };
      mockTaskRepository.findById.mockResolvedValue(mockTasks[0]);
      mockTaskRepository.changeStatus.mockResolvedValue(updatedTask);
      
      // Act
      const result = await taskService.changeTaskStatus(taskId, newStatus, userId);
      
      // Assert
      expect(result).toEqual(updatedTask);
      expect(mockTaskRepository.findById).toHaveBeenCalledWith(taskId);
      expect(mockTaskRepository.changeStatus).toHaveBeenCalledWith(taskId, newStatus);
    });

    it('should return null if task not found', async () => {
      // Arrange
      const taskId = 999;
      const userId = 1;
      const newStatus = TaskStatus.COMPLETED;
      mockTaskRepository.findById.mockResolvedValue(null);
      
      // Act
      const result = await taskService.changeTaskStatus(taskId, newStatus, userId);
      
      // Assert
      expect(result).toBeNull();
      expect(mockTaskRepository.findById).toHaveBeenCalledWith(taskId);
      expect(mockTaskRepository.changeStatus).not.toHaveBeenCalled();
    });

    it('should throw error if status is invalid', async () => {
      // Arrange
      const taskId = 1;
      const userId = 1;
      const invalidStatus = 'invalid_status';
      mockTaskRepository.findById.mockResolvedValue(mockTasks[0]);
      
      // Act & Assert
      await expect(taskService.changeTaskStatus(taskId, invalidStatus, userId))
        .rejects.toThrow(ApiError);
      expect(mockTaskRepository.findById).toHaveBeenCalledWith(taskId);
      expect(mockTaskRepository.changeStatus).not.toHaveBeenCalled();
    });
  });

  describe('getTasksDueSoon', () => {
    it('should return tasks due within specified days', async () => {
      // Arrange
      const userId = 1;
      const days = 7;
      
      // Create tasks with due dates
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 5);
      
      const twoWeeksLater = new Date();
      twoWeeksLater.setDate(twoWeeksLater.getDate() + 14);
      
      const dueSoonTasks = [
        { ...mockTasks[0], due_date: tomorrow },
        { ...mockTasks[1], due_date: nextWeek }
      ];
      
      const allTasks = [
        ...dueSoonTasks,
        { ...mockTasks[0], task_id: 3, due_date: twoWeeksLater },
        { ...mockTasks[1], task_id: 4, status: TaskStatus.COMPLETED, due_date: tomorrow }
      ];
      
      mockTaskRepository.findByUserId.mockResolvedValue(allTasks);
      
      // Act
      const result = await taskService.getTasksDueSoon(userId, days);
      
      // Assert
      expect(result.length).toBe(2);
      expect(result).toEqual(expect.arrayContaining([
        expect.objectContaining({ task_id: dueSoonTasks[0].task_id }),
        expect.objectContaining({ task_id: dueSoonTasks[1].task_id })
      ]));
      expect(mockTaskRepository.findByUserId).toHaveBeenCalledWith(userId);
    });
  });

  describe('getOverdueTasks', () => {
    it('should return overdue tasks', async () => {
      // Arrange
      const userId = 1;
      
      // Create tasks with due dates
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const overdueTasks = [
        { ...mockTasks[0], due_date: yesterday },
        { ...mockTasks[1], due_date: lastWeek }
      ];
      
      const allTasks = [
        ...overdueTasks,
        { ...mockTasks[0], task_id: 3, due_date: tomorrow },
        { ...mockTasks[1], task_id: 4, status: TaskStatus.COMPLETED, due_date: yesterday }
      ];
      
      mockTaskRepository.findByUserId.mockResolvedValue(allTasks);
      
      // Act
      const result = await taskService.getOverdueTasks(userId);
      
      // Assert
      expect(result.length).toBe(2);
      expect(result).toEqual(expect.arrayContaining([
        expect.objectContaining({ task_id: overdueTasks[0].task_id }),
        expect.objectContaining({ task_id: overdueTasks[1].task_id })
      ]));
      expect(mockTaskRepository.findByUserId).toHaveBeenCalledWith(userId);
    });
  });

  describe('getTasksByCategory', () => {
    it('should return tasks by category for user', async () => {
      // Arrange
      const userId = 1;
      const categoryId = 1;
      mockTaskRepository.findByCategoryId.mockResolvedValue([
        mockTasks[0],
        { ...mockTasks[1], category_id: 1, user_id: 2 } // Different user's task
      ]);
      
      // Act
      const result = await taskService.getTasksByCategory(categoryId, userId);
      
      // Assert
      expect(result.length).toBe(1);
      expect(result[0]).toEqual(mockTasks[0]);
      expect(mockTaskRepository.findByCategoryId).toHaveBeenCalledWith(categoryId);
    });
  });

  describe('getTasksByPriority', () => {
    it('should return tasks by priority for user', async () => {
      // Arrange
      const userId = 1;
      const priorityId = 2;
      mockTaskRepository.findByPriorityId.mockResolvedValue([
        mockTasks[0],
        { ...mockTasks[1], priority_id: 2, user_id: 2 } // Different user's task
      ]);
      
      // Act
      const result = await taskService.getTasksByPriority(priorityId, userId);
      
      // Assert
      expect(result.length).toBe(1);
      expect(result[0]).toEqual(mockTasks[0]);
      expect(mockTaskRepository.findByPriorityId).toHaveBeenCalledWith(priorityId);
    });
  });

  describe('getTasksByStatus', () => {
    it('should return tasks by status', async () => {
      // Arrange
      const userId = 1;
      const status = TaskStatus.IN_PROGRESS;
      const filter = { status };
      mockTaskRepository.findByUserId.mockResolvedValue([mockTasks[0]]);
      
      // Act
      const result = await taskService.getTasksByStatus(userId, status);
      
      // Assert
      expect(result).toEqual([mockTasks[0]]);
      expect(mockTaskRepository.findByUserId).toHaveBeenCalledWith(userId, filter);
    });
  });
});