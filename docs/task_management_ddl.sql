-- Create the users table
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY, -- Primary key
    username VARCHAR(50) NOT NULL UNIQUE, -- Unique username
    email VARCHAR(100) NOT NULL UNIQUE, -- Unique email
    password_hash VARCHAR(255) NOT NULL, -- Password hash
    role VARCHAR(20) DEFAULT 'user', -- User role (e.g., user, admin)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Timestamp for account creation
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Timestamp for last update
);

-- Create the priorities table
CREATE TABLE priorities (
    priority_id SERIAL PRIMARY KEY, -- Primary key
    name VARCHAR(20) NOT NULL UNIQUE -- Priority name (e.g., low, medium, high)
);

-- Create the categories table
CREATE TABLE categories (
    category_id SERIAL PRIMARY KEY, -- Primary key
    name VARCHAR(50) NOT NULL UNIQUE -- Category name (e.g., work, personal, etc.)
);

-- Create the tasks table
CREATE TABLE tasks (
    task_id SERIAL PRIMARY KEY, -- Primary key
    user_id INT NOT NULL, -- Foreign key to users table
    category_id INT, -- Foreign key to categories table
    priority_id INT, -- Foreign key to priorities table
    title VARCHAR(100) NOT NULL, -- Task title
    description TEXT, -- Task description
    due_date DATE, -- Due date for the task
    status VARCHAR(20) DEFAULT 'pending', -- Task status (e.g., pending, completed)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Timestamp for task creation
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Timestamp for last update
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE, -- Cascade delete
    FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE SET NULL, -- Set NULL on delete
    FOREIGN KEY (priority_id) REFERENCES priorities(priority_id) ON DELETE SET NULL -- Set NULL on delete
);

-- Create the task_assignments table
CREATE TABLE task_assignments (
    assignment_id SERIAL PRIMARY KEY, -- Primary key
    task_id INT NOT NULL, -- Foreign key to tasks table
    user_id INT NOT NULL, -- Foreign key to users table
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Timestamp for task assignment
    FOREIGN KEY (task_id) REFERENCES tasks(task_id) ON DELETE CASCADE, -- Cascade delete
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE -- Cascade delete
);

-- Create indexes for faster querying
CREATE INDEX idx_tasks_user_id ON tasks(user_id); -- Index on user_id for tasks
CREATE INDEX idx_tasks_category_id ON tasks(category_id); -- Index on category_id for tasks
CREATE INDEX idx_tasks_priority_id ON tasks(priority_id); -- Index on priority_id for tasks
CREATE INDEX idx_tasks_due_date ON tasks(due_date); -- Index on due_date for tasks
CREATE INDEX idx_tasks_status ON tasks(status); -- Index on status for tasks
CREATE INDEX idx_task_assignments_task_id ON task_assignments(task_id); -- Index on task_id for task assignments
CREATE INDEX idx_task_assignments_user_id ON task_assignments(user_id); -- Index on user_id for task assignments