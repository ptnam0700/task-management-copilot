// API types
export interface Task {
  task_id: number;
  user_id: number;
  title: string;
  description: string;
  priority_id: number;
  category_id: number;
  due_date: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface TaskCreate {
  user_id: number;
  title: string;
  description: string;
  priority_id?: number;
  category_id?: number;
  due_date?: Date; // Can be a Date object or ISO string
}

export interface TaskUpdate extends Partial<TaskCreate> {
  status?: string;
}

export interface TaskQuery {
  priority_id?: number;
  category_id?: number;
  status?: string;
  search?: string;
  due_date?: string;
}

export interface AuthLogin {
  email: string;
  password: string;
}

export interface AuthRegister {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  data: {
    user: User;
    accessToken: string;
    refreshToken?: string;
  }
}

export interface ApiError {
  message: string;
  status?: number;
  [key: string]: any;
}

export interface User {
  user_id: number;
  email: string;
  username?: string;
  role?: string;
}

// Component props
export interface TaskListProps {
  tasks: Task[];
  onSelectTask?: (task: Task) => void;
}

export interface TaskItemProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (id: number) => void;
}

export interface TaskFormProps {
  initialValues?: Partial<TaskCreate>;
  onSubmit: (data: TaskCreate | TaskUpdate) => void;
  loading?: boolean;
  error?: string;
}

// State interfaces
export interface TaskState {
  tasks: Task[];
  loading: boolean;
  error?: string;
  selectedTask?: Task;
}

export interface AuthState {
  user?: { id: number; username: string; email: string };
  accessToken?: string;
  loading: boolean;
  error?: string;
}
