export interface ITask {
  task_id: number;
  user_id: number;
  category_id?: number;
  priority_id?: number;
  title: string;
  description?: string;
  due_date?: Date;
  status: TaskStatus;
  created_at: Date;
  updated_at: Date;
}

export interface ITaskCreate {
  user_id: number;
  title: string;
  description?: string;
  category_id?: number;
  priority_id?: number;
  due_date?: Date;
}

export interface ITaskUpdate {
  title?: string;
  description?: string;
  category_id?: number;
  priority_id?: number;
  due_date?: Date;
  status?: TaskStatus;
}

export interface ITaskQuery {
  priority_id?: number;
  category_id?: number;
  status?: TaskStatus;
  due_date?: Date;
  search?: string;
}

export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}