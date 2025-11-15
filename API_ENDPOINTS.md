# API Endpoints Documentation

## Base URL
All endpoints are prefixed with the base URL (e.g., `http://localhost:PORT`)

---

## 1. Health Check Endpoints

### GET /health
**Description:** Health check endpoint to verify server and database connectivity

**Authentication:** Not required

**Request:**
- Method: `GET`
- Headers: None required
- Body: None
- Query Parameters: None

**Response:**
- **Success (200):**
  ```json
  {
    "status": "healthy",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "uptime": 12345.67,
    "database": "connected"
  }
  ```

- **Error (503):**
  ```json
  {
    "status": "unhealthy",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "uptime": 12345.67,
    "database": "disconnected",
    "error": "Error message"
  }
  ```

---

## 2. Authentication Endpoints

### POST /auth/signup
**Description:** Register a new user account

**Authentication:** Not required

**Request:**
- Method: `POST`
- Headers:
  - `Content-Type: application/json`
- Body:
  ```json
  {
    "name": "string (required)",
    "email": "string (required)",
    "password": "string (required)"
  }
  ```

**Response:**
- **Success (201):**
  ```json
  {
    "message": "Signup successful",
    "token": "jwt_token_string",
    "user": {
      "id": "uuid_string",
      "name": "string",
      "email": "string"
    }
  }
  ```

- **Error (400):**
  ```json
  {
    "message": "All fields required"
  }
  ```
  OR
  ```json
  {
    "message": "User already exists"
  }
  ```

- **Error (500):**
  ```json
  {
    "message": "Internal server error"
  }
  ```

---

### POST /auth/login
**Description:** Login with email and password

**Authentication:** Not required

**Request:**
- Method: `POST`
- Headers:
  - `Content-Type: application/json`
- Body:
  ```json
  {
    "email": "string (required)",
    "password": "string (required)"
  }
  ```

**Response:**
- **Success (200):**
  ```json
  {
    "message": "Login successful",
    "token": "jwt_token_string",
    "user": {
      "id": "uuid_string",
      "name": "string",
      "email": "string"
    }
  }
  ```

- **Error (400):**
  ```json
  {
    "message": "All fields required"
  }
  ```
  OR
  ```json
  {
    "message": "Invalid email or password"
  }
  ```

- **Error (500):**
  ```json
  {
    "message": "Internal server error"
  }
  ```

---

## 3. File Management Endpoints

### POST /files/upload
**Description:** Upload a file to Cloudinary and save metadata

**Authentication:** Required (JWT token in Authorization header)

**Request:**
- Method: `POST`
- Headers:
  - `Authorization: Bearer <jwt_token>`
  - `Content-Type: multipart/form-data`
- Body: Form data with file field
  - `file`: File (multipart/form-data)
    - Supported types: PDF, text files, images
    - File is uploaded via `multipart/form-data` with field name `file`

**Response:**
- **Success (201):**
  ```json
  {
    "message": "File uploaded successfully",
    "file": {
      "id": "uuid_string",
      "userId": "uuid_string",
      "url": "https://cloudinary_url",
      "type": "application/pdf | text/plain | image/*",
      "text": null,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
  ```

- **Error (400):**
  ```json
  {
    "message": "No file uploaded"
  }
  ```

- **Error (500):**
  ```json
  {
    "message": "Cloud upload failed"
  }
  ```
  OR
  ```json
  {
    "message": "Internal server error"
  }
  ```

---

### POST /files/process/:fileId
**Description:** Process an uploaded file to extract text and create chunks

**Authentication:** Required (JWT token in Authorization header)

**Request:**
- Method: `POST`
- Headers:
  - `Authorization: Bearer <jwt_token>`
  - `Content-Type: application/json`
- URL Parameters:
  - `fileId`: string (UUID) - The ID of the file to process
- Body: None

**Response:**
- **Success (201):**
  ```json
  {
    "message": "File processed successfully",
    "chunks": 10
  }
  ```

- **Error (400):**
  ```json
  {
    "message": "Unsupported file type"
  }
  ```

- **Error (404):**
  ```json
  {
    "message": "File not found"
  }
  ```

- **Error (500):**
  ```json
  {
    "message": "Internal server error"
  }
  ```

---

## 4. Embedding Endpoints

### POST /embed/embed/:fileId
**Description:** Generate embeddings for all chunks of a file

**Authentication:** Required (JWT token in Authorization header)

**Request:**
- Method: `POST`
- Headers:
  - `Authorization: Bearer <jwt_token>`
  - `Content-Type: application/json`
- URL Parameters:
  - `fileId`: string (UUID) - The ID of the file whose chunks need embedding
- Body: None

**Response:**
- **Success (200):**
  ```json
  {
    "message": "Embeddings created successfully",
    "embedded": 10
  }
  ```

- **Error (400):**
  ```json
  {
    "message": "No chunks to embed"
  }
  ```

- **Error (404):**
  ```json
  {
    "message": "File not found"
  }
  ```

- **Error (500):**
  ```json
  {
    "message": "Internal server error"
  }
  ```

---

## 5. RAG (Retrieval-Augmented Generation) Endpoints

### POST /rag/chat
**Description:** Ask a question and get an answer using RAG (Retrieval-Augmented Generation)

**Authentication:** Required (JWT token in Authorization header)

**Request:**
- Method: `POST`
- Headers:
  - `Authorization: Bearer <jwt_token>`
  - `Content-Type: application/json`
- Body:
  ```json
  {
    "question": "string (required)"
  }
  ```

**Response:**
- **Success (200):**
  ```json
  {
    "answer": "string - Generated answer based on RAG"
  }
  ```

- **Error (400):**
  ```json
  {
    "message": "Question is required"
  }
  ```

- **Error (500):**
  ```json
  {
    "message": "Something went wrong"
  }
  ```

---

## Authentication Details

### JWT Token Format
- **Header:** `Authorization: Bearer <token>`
- **Token Payload:** Contains `userId` field
- **Expiration:** 7 days
- **Secret:** Stored in `JWT_SECRET` environment variable

### Protected Endpoints
All endpoints except `/health` and `/auth/*` require authentication via JWT token in the Authorization header.

---

## Error Response Format

All error responses follow this general format:
```json
{
  "message": "Error description"
}
```

## Status Codes Summary

- **200:** Success
- **201:** Created
- **400:** Bad Request (validation errors, missing fields)
- **404:** Not Found (resource doesn't exist)
- **500:** Internal Server Error
- **503:** Service Unavailable (health check failure)

