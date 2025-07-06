# Task Management API

A comprehensive task management system built with Node.js, Express, TypeScript, and PostgreSQL.

## Project Overview

This Task Management API provides a robust backend for managing tasks where users can:

- Create, read, update, and delete tasks
- Assign priorities and categories to tasks
- Set due dates for tasks
- Filter and search tasks
- Mark tasks as complete, pending, in-progress, or cancelled
- User authentication and authorization

## Tech Stack

- **Backend**: Node.js, Express.js, TypeScript
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Token)
- **Validation**: Express Validator
- **Testing**: Jest

## Project Structure

```
server/
├── src/
│   ├── config/       # Configuration files
│   ├── controllers/  # Request handlers
│   ├── interfaces/   # TypeScript interfaces
│   ├── middlewares/  # Express middlewares
│   ├── models/       # Data models
│   ├── repositories/ # Database operations
│   ├── routes/       # API routes
│   ├── services/     # Business logic
│   ├── utils/        # Utility functions
│   └── index.ts      # Entry point
├── __tests__/        # Test files
├── package.json      # Dependencies
└── tsconfig.json     # TypeScript configuration
```

## Features

### Authentication

- User registration and login
- JWT-based authentication
- Password hashing and security
- Token refresh

### Task Management

- CRUD operations for tasks
- Task status tracking (pending, in-progress, completed, cancelled)
- Task prioritization
- Task categorization
- Due date assignment

### Advanced Features

- Task filtering by multiple criteria
- Task searching by title or description
- Overdue task identification
- Tasks due soon reminders

## Database Schema

The system uses the following main entities:

- **Users**: Store user account information
- **Tasks**: Store task details with references to users, categories, and priorities
- **Categories**: Categorize tasks
- **Priorities**: Define importance levels for tasks
- **Task Assignments**: Track task assignments to users

## API Endpoints

### Authentication

- `POST /auth/register` - Register a new user
- `POST /auth/login` - Authenticate and get token
- `POST /auth/refresh-token` - Refresh authentication token

### Tasks

- `GET /tasks` - Get all tasks with optional filtering
- `GET /tasks/:id` - Get task by ID
- `POST /tasks` - Create a new task
- `PUT /tasks/:id` - Update an existing task
- `DELETE /tasks/:id` - Delete a task
- `PATCH /tasks/:id/status` - Update task status

### Task Filtering and Search

- `GET /tasks?priority_id=1` - Filter by priority
- `GET /tasks?category_id=2` - Filter by category
- `GET /tasks?status=pending` - Filter by status
- `GET /tasks?search=keyword` - Search tasks by title or description
- `GET /tasks/due-soon` - Get tasks due soon
- `GET /tasks/overdue` - Get overdue tasks

## Setup Instructions

### Prerequisites

- Node.js (v14 or later)
- PostgreSQL (v12 or later)

### Installation

1. Clone the repository
   ```
   git clone <repository-url>
   cd ai-training-fpt
   ```

2. Install dependencies
   ```
   cd server
   npm install
   ```

3. Set up environment variables
   Create a `.env` file in the server directory with the following variables:
   ```
   PORT=3000
   NODE_ENV=development
   
   # Database
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=task_management
   DB_USER=postgres
   DB_PASSWORD=your_password
   
   # JWT
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRES_IN=24h
   JWT_REFRESH_SECRET=your_refresh_secret
   JWT_REFRESH_EXPIRES_IN=7d
   ```

4. Create the database tables
   ```
   npm run db:migrate
   ```

5. Start the development server
   ```
   npm run dev
   ```

## API Usage Examples

### Register a user
```http
POST /auth/register HTTP/1.1
Content-Type: application/json

{
  "username": "johndoe",
  "email": "johndoe@example.com",
  "password": "Password123"
}
```

### Login
```http
POST /auth/login HTTP/1.1
Content-Type: application/json

{
  "email": "johndoe@example.com",
  "password": "Password123"
}
```

### Create a task
```http
POST /tasks HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "title": "Complete project report",
  "description": "Prepare the final report for the project",
  "priority_id": 2,
  "category_id": 1,
  "due_date": "2025-07-10"
}
```

### Get all tasks
```http
GET /tasks?priority_id=2&status=pending HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Testing

Run the tests with:

```
npm test
```

## License

This project is licensed under the ISC License.