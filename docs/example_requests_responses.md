# Example HTTP Requests and Responses for Task Management API

---

## **1. User Registration**
### Request:
```http
POST /auth/register HTTP/1.1
Content-Type: application/json

{
  "username": "johndoe",
  "email": "johndoe@example.com",
  "password": "Password123"
}
```

### Response (Success):
```http
HTTP/1.1 201 Created
Content-Type: application/json

{
  "message": "User registered successfully"
}
```

### Response (Error - Duplicate Email):
```http
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "error": "Email already exists"
}
```

---

## **2. User Login**
### Request:
```http
POST /auth/login HTTP/1.1
Content-Type: application/json

{
  "email": "johndoe@example.com",
  "password": "Password123"
}
```

### Response (Success):
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Response (Error - Invalid Credentials):
```http
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{
  "error": "Invalid email or password"
}
```

---

## **3. Create Task**
### Request:
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

### Response (Success):
```http
HTTP/1.1 201 Created
Content-Type: application/json

{
  "task_id": 1,
  "message": "Task created successfully"
}
```

### Response (Error - Missing Title):
```http
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "error": "Title is required"
}
```

---

## **4. Update Task**
### Request:
```http
PUT /tasks/1 HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "title": "Complete project report",
  "description": "Update the report with new data",
  "priority_id": 3,
  "category_id": 2,
  "due_date": "2025-07-15",
  "status": "completed"
}
```

### Response (Success):
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "message": "Task updated successfully"
}
```

### Response (Error - Task Not Found):
```http
HTTP/1.1 404 Not Found
Content-Type: application/json

{
  "error": "Task not found"
}
```

---

## **5. Get All Tasks**
### Request:
```http
GET /tasks?priority_id=2&status=pending HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Response (Success):
```http
HTTP/1.1 200 OK
Content-Type: application/json

[
  {
    "task_id": 1,
    "title": "Complete project report",
    "description": "Prepare the final report for the project",
    "priority_id": 2,
    "category_id": 1,
    "due_date": "2025-07-10",
    "status": "pending"
  },
  {
    "task_id": 2,
    "title": "Team meeting",
    "description": "Discuss project updates",
    "priority_id": 2,
    "category_id": 1,
    "due_date": "2025-07-08",
    "status": "pending"
  }
]
```

### Response (Error - Unauthorized):
```http
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{
  "error": "Authentication token is missing or invalid"
}
```

---

## **6. Delete Task**
### Request:
```http
DELETE /tasks/1 HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Response (Success):
```http
HTTP/1.1 204 No Content
```

### Response (Error - Task Not Found):
```http
HTTP/1.1 404 Not Found
Content-Type: application/json

{
  "error": "Task not found"
}
```

---

## **7. Search Tasks**
### Request:
```http
GET /tasks?search=report HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Response (Success):
```http
HTTP/1.1 200 OK
Content-Type: application/json

[
  {
    "task_id": 1,
    "title": "Complete project report",
    "description": "Prepare the final report for the project",
    "priority_id": 2,
    "category_id": 1,
    "due_date": "2025-07-10",
    "status": "pending"
  }
]
```

### Response (Error - No Matching Tasks):
```http
HTTP/1.1 200 OK
Content-Type: application/json

[]
```

---

This file contains example HTTP requests and responses for the task management API endpoints. Let me know if you need further assistance! 