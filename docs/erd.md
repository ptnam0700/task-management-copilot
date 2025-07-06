# Entity Relationship Diagram Description for Task Management System

## Entities and Attributes

### **1. Users**
- **Attributes**:
  - `user_id` (Primary Key): Unique identifier for each user.
  - `username`: Unique name for the user.
  - `email`: Unique email address for the user.
  - `password_hash`: Encrypted password for authentication.
  - `created_at`: Timestamp for when the user account was created.
  - `updated_at`: Timestamp for when the user account was last updated.
- **Relationships**:
  - One-to-Many relationship with `tasks` (a user can create multiple tasks).
  - One-to-Many relationship with `task_assignments` (a user can be assigned multiple tasks).

---

### **2. Tasks**
- **Attributes**:
  - `task_id` (Primary Key): Unique identifier for each task.
  - `user_id` (Foreign Key): References `users.user_id` (creator of the task).
  - `category_id` (Foreign Key): References `categories.category_id` (category of the task).
  - `title`: Title of the task.
  - `description`: Detailed description of the task.
  - `priority_id` (Foreign Key): References `priorities.priority_id` (priority level of the task).
  - `due_date`: Deadline for the task.
  - `status`: Current status of the task (e.g., pending, completed).
  - `created_at`: Timestamp for when the task was created.
  - `updated_at`: Timestamp for the last update to the task.
- **Relationships**:
  - Many-to-One relationship with `users` (tasks are created by users).
  - Many-to-One relationship with `categories` (tasks belong to a category).
  - Many-to-One relationship with `priorities` (tasks have a priority level).
  - One-to-Many relationship with `task_assignments` (tasks can be assigned to multiple users).

---

### **3. Categories**
- **Attributes**:
  - `category_id` (Primary Key): Unique identifier for each category.
  - `name`: Name of the category (e.g., work, personal).
- **Relationships**:
  - One-to-Many relationship with `tasks` (a category can have multiple tasks).

---

### **4. Priorities**
- **Attributes**:
  - `priority_id` (Primary Key): Unique identifier for each priority level.
  - `name`: Name of the priority level (e.g., low, medium, high).
- **Relationships**:
  - One-to-Many relationship with `tasks` (a priority level can be assigned to multiple tasks).

---

### **5. Task Assignments**
- **Attributes**:
  - `assignment_id` (Primary Key): Unique identifier for each task assignment.
  - `task_id` (Foreign Key): References `tasks.task_id` (task being assigned).
  - `user_id` (Foreign Key): References `users.user_id` (user assigned to the task).
  - `assigned_at`: Timestamp for when the task was assigned.
- **Relationships**:
  - Many-to-One relationship with `tasks` (a task can be assigned to multiple users).
  - Many-to-One relationship with `users` (a user can be assigned multiple tasks).

---

## Relationships Summary
1. **Users and Tasks**:
   - A user can create multiple tasks (`One-to-Many`).
   - Tasks reference the `user_id` of the creator.

2. **Tasks and Categories**:
   - A task belongs to one category (`Many-to-One`).
   - Categories can have multiple tasks (`One-to-Many`).

3. **Tasks and Priorities**:
   - A task has one priority level (`Many-to-One`).
   - Priorities can be assigned to multiple tasks (`One-to-Many`).

4. **Tasks and Task Assignments**:
   - A task can be assigned to multiple users (`One-to-Many`).
   - A user can be assigned multiple tasks (`One-to-Many`).

---

## Diagram Description
- **Users**:
  - `user_id` is the primary key.
  - Connected to `tasks` via `user_id` (creator relationship).
  - Connected to `task_assignments` via `user_id` (assignment relationship).

- **Tasks**:
  - `task_id` is the primary key.
  - Connected to `users` via `user_id` (creator relationship).
  - Connected to `categories` via `category_id`.
  - Connected to `priorities` via `priority_id`.
  - Connected to `task_assignments` via `task_id`.

- **Categories**:
  - `category_id` is the primary key.
  - Connected to `tasks` via `category_id`.

- **Priorities**:
  - `priority_id` is the primary key.
  - Connected to `tasks` via `priority_id`.

- **Task Assignments**:
  - `assignment_id` is the primary key.
  - Connected to `tasks` via `task_id`.
  - Connected to `users` via `user_id`.

---

## Indexes
- Add indexes for frequently queried columns:
  - `users.email` for fast user lookup.
  - `tasks.due_date` for sorting tasks by deadlines.
  - `task_assignments.task_id` and `task_assignments.user_id` for efficient assignment queries.