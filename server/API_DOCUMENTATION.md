# MyBlog Backend API Documentation
*Version: 1.0.0*

[![Swagger UI](https://img.shields.io/badge/Swagger-UI-blue)](http://localhost:3003/api/docs) (when Swagger is implemented)

## Server Information

- **Base URL**: `http://localhost:3003`
- **Environment**: Development
- **Authentication**: JWT Bearer Token
- **Content-Type**: `application/json`

---

## 🔐 Authentication

All protected endpoints require JWT authentication. Include the token in the `Authorization` header:

```
Authorization: Bearer <your_jwt_token>
```

### Get JWT Token

1. **Register** a new user: `POST /api/auth/register`
2. **Login** existing user: `POST /api/auth/login`

---

# API Endpoints

## 🏥 Health Check

### GET `/api/health`
Check server status and health.

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "OK",
    "timestamp": "2024-01-01T12:00:00.000Z",
    "environment": "development"
  }
}
```

---

## 🔐 Authentication Endpoints

### POST `/api/auth/register`
Register a new user account.

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "yourpassword123"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "64f123...",
      "username": "johndoe",
      "email": "john@example.com",
      "role": "user",
      "createdAt": "2024-01-01T12:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### POST `/api/auth/login`
Authenticate user and get JWT token.

**Request Body:**
```json
{
  "identifier": "johndoe",
  "password": "yourpassword123"
}
```
*Note: identifier can be username or email*

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "64f123...",
      "username": "johndoe",
      "email": "john@example.com",
      "role": "user",
      "lastLogin": "2024-01-01T12:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### GET `/api/auth/me`
Get current authenticated user's profile.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "64f123...",
      "username": "johndoe",
      "email": "john@example.com",
      "avatar": "",
      "bio": "Software developer",
      "role": "user",
      "lastLogin": "2024-01-01T12:00:00.000Z",
      "createdAt": "2024-01-01T12:00:00.000Z"
    }
  }
}
```

### PUT `/api/auth/profile`
Update current user's profile.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "username": "newusername",
  "email": "newemail@example.com",
  "bio": "Updated bio"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": { "user": {...} }
}
```

### POST `/api/auth/change-password`
Change current user's password.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "oldPassword": "currentpassword",
  "newPassword": "newpassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Password changed successfully"
  }
}
```

### POST `/api/auth/logout`
Logout current user (client-side token removal).

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

## 👥 User Management Endpoints

### GET `/api/users/profile/{username}`
Get user profile by username (public).

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "64f123...",
      "username": "johndoe",
      "avatar": "",
      "bio": "Software developer",
      "createdAt": "2024-01-01T12:00:00.000Z"
    }
  }
}
```

### GET `/api/users/{id}`
Get user details by ID (authenticated users).

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "64f123...",
      "username": "johndoe",
      "email": "john@example.com",
      "avatar": "",
      "bio": "Software developer",
      "role": "user",
      "isActive": true,
      "createdAt": "2024-01-01T12:00:00.000Z"
    }
  }
}
```

### GET `/api/users`
Get all users (admin only).

**Headers:** `Authorization: Bearer <token>` (Admin)

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "users": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### PUT `/api/users/{id}`
Update user (admin only).

**Headers:** `Authorization: Bearer <token>` (Admin)

**Request Body:**
```json
{
  "role": "admin",
  "isActive": true
}
```

### DELETE `/api/users/{id}`
Delete user (admin or self).

**Headers:** `Authorization: Bearer <token>`

---

## 📝 Blog Post Endpoints

### GET `/api/posts`
Get all published posts (public).

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 12)
- `category` (string): Filter by category
- `tag` (string): Filter by tag
- `search` (string): Search in title/content
- `featured` (boolean): Get only featured posts

**Response (200):**
```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "title": "My First Blog Post",
        "excerpt": "This is a summary...",
        "slug": "my-first-blog-post",
        "coverImage": "",
        "tags": ["javascript", "nodejs"],
        "category": "Technology",
        "publishedAt": "2024-01-01T12:00:00.000Z",
        "views": 150,
        "likeCount": 5,
        "commentCount": 3,
        "author": {
          "username": "johndoe",
          "avatar": ""
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 12,
      "total": 50,
      "pages": 5,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### GET `/api/posts/{slug}`
Get single post by slug (public).

**Response (200):**
```json
{
  "success": true,
  "data": {
    "post": {
      "title": "My First Blog Post",
      "content": "Full post content here...",
      "excerpt": "This is a summary...",
      "slug": "my-first-blog-post",
      "author": {
        "username": "johndoe",
        "avatar": "",
        "bio": "Software developer"
      },
      "tags": ["javascript", "nodejs"],
      "category": "Technology",
      "status": "published",
      "views": 150,
      "likes": [...],
      "comments": [...],
      "publishedAt": "2024-01-01T12:00:00.000Z"
    }
  }
}
```

### GET `/api/posts/author/{userId}`
Get posts by specific author (public).

**Query Parameters:**
- `page`, `limit`: Pagination parameters

### POST `/api/posts`
Create a new blog post (authenticated users).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "My Blog Post",
  "content": "Post content in markdown or HTML",
  "excerpt": "Optional summary",
  "tags": "javascript,nodejs,web",
  "category": "Technology",
  "status": "draft",
  "featured": false
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Post created successfully",
  "data": {
    "post": {
      "title": "My Blog Post",
      "slug": "my-blog-post",
      "status": "draft",
      "createdAt": "2024-01-01T12:00:00.000Z"
    }
  }
}
```

### PUT `/api/posts/{id}`
Update existing post (author only or admin).

**Headers:** `Authorization: Bearer <token>`

**Request Body:** (same as create, partial updates allowed)

**Response (200):**
```json
{
  "success": true,
  "message": "Post updated successfully",
  "data": { "post": {...} }
}
```

### DELETE `/api/posts/{id}`
Delete post (author only or admin).

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Post deleted successfully"
}
```

### GET `/api/posts/user/drafts`
Get current user's draft posts (private).

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "title": "Draft Post",
        "excerpt": "Draft summary",
        "slug": "draft-post",
        "createdAt": "2024-01-01T12:00:00.000Z",
        "updatedAt": "2024-01-01T14:00:00.000Z"
      }
    ]
  }
}
```

---

## 📎 Binary/File Upload Endpoints (TODO)

### GET `/api/binary/`
File management placeholder.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Binary/file routes - TODO"
  }
}
```

## 💬 Chat Endpoints (TODO)

### GET `/api/chat/`
Chat functionality placeholder.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Chat routes - TODO"
  }
}
```

---

## 📊 Error Responses

### Common Error Format
```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Detailed error messages"] // for validation errors
}
```

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | OK - Success |
| 201 | Created - Resource created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Duplicate resource |
| 415 | Unsupported Media Type |
| 422 | Unprocessable Entity |
| 429 | Too Many Requests |
| 500 | Internal Server Error |

### Authentication Errors
```json
{
  "success": false,
  "message": "Access denied. No token provided."
}
```

```json
{
  "success": false,
  "message": "Your token has expired."
}
```

### Validation Errors
```json
{
  "success": false,
  "message": "Validation Error",
  "errors": [
    "Username must be at least 3 characters long",
    "Email is required"
  ]
}
```

---

## 🔧 Rate Limiting

- **General Rate Limit**: 100 requests per 15 minutes per IP
- **Auth Endpoints**: 5 requests per 15 minutes per IP

---

## 🌐 WebSocket Support

The server supports real-time communication via Socket.IO:

- **Connection**: `ws://localhost:3003`
- **Events**:
  - `join_chat`: Join a chat room
  - `leave_chat`: Leave a chat room

---

## 🚀 Quick Start

1. **Install Dependencies:**
```bash
cd server && npm install
```

2. **Start Server:**
```bash
npm run dev
```

3. **Test Health Check:**
```bash
curl http://localhost:3003/api/health
```

4. **Register User:**
```bash
curl -X POST http://localhost:3003/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","password":"password123"}'
```

---

*Documentation generated for MyBlog Backend v1.0.0*
*Last updated: January 2024*
