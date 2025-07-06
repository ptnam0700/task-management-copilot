# RESTful API Endpoints for Task Management System

## **Authentication**
### 1. User Registration
- **Endpoint**: `POST /auth/register`
- **Description**: Register a new user.
- **Request Body**:
  ```json
  {
    "username": "string",
    "email": "string",
    "password": "string"
  }
  ```
- **Response**:
  - Success: `201 Created`
  - Error: `400 Bad Request` (e.g., invalid input, duplicate email/username)

### 2. User Login
- **Endpoint**: `POST /auth/login`
- **Description**: Authenticate a user and return a token.
- **Request Body**:
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Response**:
  - Success: `200 OK` with JWT token
  - Error: `401 Unauthorized` (e.g., invalid credentials)

### 3. Token Refresh
- **Endpoint**: `POST /auth/refresh-token`
- **Description**: Refresh the authentication token.
- **Request Body**:
  ```json
  {
    "refresh_token": "string"
  }
  ```
- **Response**:
  - Success: `200 OK` with new JWT token
  - Error: `401 Unauthorized`

---

## **Tasks**
### 4. Create Task
- **Endpoint**: `POST /tasks`
- **Description**: Create a new task.
- **Request Body**:
  ```json
  {
    "title": "string",
    "description": "string",
    "priority_id": "integer",
    "category_id": "integer",
    "due_date": "YYYY-MM-DD"
  }
  ```
- **Response**:
  - Success: `201 Created`
  - Error: `400 Bad Request` (e.g., invalid input)

### 5. Get All Tasks
- **Endpoint**: `GET /tasks`
- **Description**: Retrieve all tasks for the authenticated user.
- **Query Parameters**:
  - `priority_id` (optional): Filter by priority.
  - `category_id` (optional): Filter by category.
  - `status` (optional): Filter by status (e.g., pending, completed).
  - `search` (optional): Search by task title or description.
- **Response**:
  - Success: `200 OK` with a list of tasks
  - Error: `401 Unauthorized`

### 6. Get Task by ID
- **Endpoint**: `GET /tasks/{task_id}`
- **Description**: Retrieve a specific task by its ID.
- **Response**:
  - Success: `200 OK` with task details
  - Error: `404 Not Found` (e.g., task does not exist)

### 7. Update Task
- **Endpoint**: `PUT /tasks/{task_id}`
- **Description**: Update an existing task.
- **Request Body**:
  ```json
  {
    "title": "string",
    "description": "string",
    "priority_id": "integer",
    "category_id": "integer",
    "due_date": "YYYY-MM-DD",
    "status": "string"
  }
  ```
- **Response**:
  - Success: `200 OK`
  - Error: `400 Bad Request` or `404 Not Found`

### 8. Delete Task
- **Endpoint**: `DELETE /tasks/{task_id}`
- **Description**: Delete a specific task.
- **Response**:
  - Success: `204 No Content`
  - Error: `404 Not Found`

---

## **Task Filtering and Search**
### 9. Filter Tasks
- **Endpoint**: `GET /tasks`
- **Description**: Filter tasks based on priority, category, status, or due date.
- **Query Parameters**:
  - `priority_id`: Filter by priority.
  - `category_id`: Filter by category.
  - `status`: Filter by status.
  - `due_date`: Filter by due date.
- **Response**:
  - Success: `200 OK` with filtered tasks
  - Error: `400 Bad Request`

### 10. Search Tasks
- **Endpoint**: `GET /tasks`
- **Description**: Search tasks by title or description.
- **Query Parameters**:
  - `search`: Search keyword.
- **Response**:
  - Success: `200 OK` with matching tasks
  - Error: `400 Bad Request`

---

## **Task Assignments**
### 11. Assign Task to User
- **Endpoint**: `POST /tasks/{task_id}/assign`
- **Description**: Assign a task to a user.
- **Request Body**:
  ```json
  {
    "user_id": "integer"
  }
  ```
- **Response**:
  - Success: `200 OK`
  - Error: `404 Not Found` (e.g., task or user does not exist)

### 12. Get Assigned Tasks
- **Endpoint**: `GET /tasks/assigned`
- **Description**: Retrieve tasks assigned to the authenticated user.
- **Response**:
  - Success: `200 OK` with assigned tasks
  - Error: `401 Unauthorized`

---

## **Error Handling**
- Use consistent HTTP status codes:
  - `400 Bad Request`: Invalid input or query parameters.
  - `401 Unauthorized`: Missing or invalid authentication token.
  - `403 Forbidden`: Access to resource denied.
  - `404 Not Found`: Resource not found.
  - `500 Internal Server Error`: Unexpected server error.

---

This API design provides endpoints for authentication, task management, filtering, and search functionality. Let me know if you need further details or implementation guidance!# RESTful API Endpoints for Task Management System

## **Authentication**
### 1. User Registration
- **Endpoint**: `POST /auth/register`
- **Description**: Register a new user.
- **Request Body**:
  ```json
  {
    "username": "string",
    "email": "string",
    "password": "string"
  }
  ```
- **Response**:
  - Success: `201 Created`
  - Error: `400 Bad Request` (e.g., invalid input, duplicate email/username)

### 2. User Login
- **Endpoint**: `POST /auth/login`
- **Description**: Authenticate a user and return a token.
- **Request Body**:
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Response**:
  - Success: `200 OK` with JWT token
  - Error: `401 Unauthorized` (e.g., invalid credentials)

### 3. Token Refresh
- **Endpoint**: `POST /auth/refresh-token`
- **Description: Refresh the authentication token.
- **Request Body**:
  ```json
  {
    "refresh_token": "string"
  }
  ```
- **Response**:
  - Success: `200 OK` with new JWT token
  - Error: `401 Unauthorized`

---

## **Tasks**
### 4. Create Task
- **Endpoint**: `POST /tasks`
- **Description**: Create a new task.
- **Request Body**:
  ```json
  {
    "title": "string",
    "description": "string",
    "priority_id": "integer",
    "category_id": "integer",
    "due_date": "YYYY-MM-DD"
  }
  ```
- **Response**:
  - Success: `201 Created`
  - Error: `400 Bad Request` (e.g., invalid input)

### 5. Get All Tasks
- **Endpoint**: `GET /tasks`
- **Description**: Retrieve all tasks for the authenticated user.
- **Query Parameters**:
  - `priority_id` (optional): Filter by priority.
  - `category_id` (optional): Filter by category.
  - `status` (optional): Filter by status (e.g., pending, completed).
  - `search` (optional): Search by task title or description.
- **Response**:
  - Success: `200 OK` with a list of tasks
  - Error: `401 Unauthorized`

### 6. Get Task by ID
- **Endpoint**: `GET /tasks/{task_id}`
- **Description**: Retrieve a specific task by its ID.
- **Response**:
  - Success: `200 OK` with task details
  - Error: `404 Not Found` (e.g., task does not exist)

### 7. Update Task
- **Endpoint**: `PUT /tasks/{task_id}`
- **Description**: Update an existing task.
- **Request Body**:
  ```json
  {
    "title": "string",
    "description": "string",
    "priority_id": "integer",
    "category_id": "integer",
    "due_date": "YYYY-MM-DD",
    "status": "string"
  }
  ```
- **Response**:
  - Success: `200 OK`
  - Error: `400 Bad Request` or `404 Not Found`

### 8. Delete Task
- **Endpoint**: `DELETE /tasks/{task_id}`
- **Description**: Delete a specific task.
- **Response**:
  - Success: `204 No Content`
  - Error: `404 Not Found`

---

## **Task Filtering and Search**
### 9. Filter Tasks
- **Endpoint**: `GET /tasks`
- **Description**: Filter tasks based on priority, category, status, or due date.
- **Query Parameters**:
  - `priority_id`: Filter by priority.
  - `category_id`: Filter by category.
  - `status`: Filter by status.
  - `due_date`: Filter by due date.
- **Response**:
  - Success: `200 OK` with filtered tasks
  - Error: `400 Bad Request`

### 10. Search Tasks
- **Endpoint**: `GET /tasks`
- **Description**: Search tasks by title or description.
- **Query Parameters**:
  - `search`: Search keyword.
- **Response**:
  - Success: `200 OK` with matching tasks
  - Error: `400 Bad Request`

---

## **Task Assignments**
### 11. Assign Task to User
- **Endpoint**: `POST /tasks/{task_id}/assign`
- **Description**: Assign a task to a user.
- **Request Body**:
  ```json
  {
    "user_id": "integer"
  }
  ```
- **Response**:
  - Success: `200 OK`
  - Error: `404 Not Found` (e.g., task or user does not exist)

### 12. Get Assigned Tasks
- **Endpoint**: `GET /tasks/assigned`
- **Description**: Retrieve tasks assigned to the authenticated user.
- **Response**:
  - Success: `200 OK` with assigned tasks
  - Error: `401 Unauthorized`

---

## **Error Handling**
- Use consistent HTTP status codes:
  - `400 Bad Request`: Invalid input or query parameters.
  - `401 Unauthorized`: Missing or invalid authentication token.
  - `403 Forbidden`: Access to resource denied.
  - `404 Not Found`: Resource not found.
  - `500 Internal Server Error`: Unexpected server error.

---

This API design provides endpoints for authentication, task management, filtering, and search functionality. Let me know if you need further details or implementation guidance!