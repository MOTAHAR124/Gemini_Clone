# API Contracts

Base URL: `http://localhost:4000`
Auth: Bearer token (`Authorization: Bearer <jwt>`) for protected routes.

## Health

### `GET /health`
- Response: `{ ok: true, timestamp: string }`

## Auth

### `POST /auth/register`
Request:
```json
{
  "email": "user@example.com",
  "name": "Jane Doe",
  "password": "StrongPass123"
}
```
Response:
```json
{
  "accessToken": "jwt",
  "user": {
    "id": "...",
    "email": "user@example.com",
    "name": "Jane Doe"
  }
}
```

### `POST /auth/login`
Request:
```json
{
  "email": "user@example.com",
  "password": "StrongPass123"
}
```
Response: same as register.

### `GET /auth/google`
- Starts Google OAuth flow.

### `GET /auth/google/callback`
- Redirects to frontend: `/auth/callback?token=<jwt>`.

### `GET /auth/me` (protected)
Response:
```json
{
  "id": "...",
  "email": "user@example.com",
  "name": "Jane Doe"
}
```

## Chat

### `POST /chat/conversations` (protected)
Request:
```json
{ "title": "Optional title" }
```
Response:
```json
{
  "id": "...",
  "title": "New Chat",
  "lastMessageAt": "...",
  "createdAt": "...",
  "updatedAt": "..."
}
```

### `GET /chat/conversations` (protected)
Response: `Conversation[]`

### `PATCH /chat/conversations/:id` (protected)
Request:
```json
{ "title": "Renamed" }
```

### `DELETE /chat/conversations/:id` (protected)
Response:
```json
{ "success": true }
```

### `GET /chat/conversations/:id/messages` (protected)
Response: `ChatMessage[]`

### `POST /chat/conversations/:id/messages` (protected)
Request:
```json
{
  "message": "Explain RAG in simple words",
  "temperature": 0.2,
  "maxOutputTokens": 1024
}
```
Response:
```json
{ "message": "...assistant reply..." }
```

### `POST /chat/conversations/:id/stream` (protected)
Request: same as above.
Response: `text/event-stream` events:
- `data: {"type":"chunk","content":"..."}`
- `data: {"type":"done","message":"full text","id":"messageId"}`
- `data: {"type":"error","message":"..."}`

## PDF RAG

### `POST /pdf-rag/upload` (protected)
Form-data:
- `file`: PDF

Response:
```json
{
  "id": "...",
  "fileName": "contract.pdf",
  "status": "ready",
  "pageCount": 12,
  "chunkCount": 48
}
```

### `GET /pdf-rag/documents` (protected)
Response: `DocumentRecord[]`

### `DELETE /pdf-rag/documents/:id` (protected)
Response:
```json
{ "success": true }
```

### `POST /pdf-rag/ask` (protected)
Request:
```json
{
  "documentId": "...",
  "question": "What is the payment due date?"
}
```
Response:
```json
{
  "answer": "Net 30 from invoice date.",
  "citations": [
    {
      "chunkIndex": 7,
      "score": 0.8123,
      "preview": "..."
    }
  ]
}
```

## PDF Generator

### `POST /pdf-generator/preview` (protected)
Request:
```json
{ "prompt": "Create a software invoice with tax row" }
```
Response:
```json
{
  "markdown": "# Invoice ...",
  "html": "<!doctype html>..."
}
```

### `POST /pdf-generator/download` (protected)
Request:
```json
{
  "markdown": "# Invoice",
  "fileName": "invoice-june"
}
```
Response: binary PDF (`application/pdf`).

## Image Reader

### `POST /image-reader/analyze` (protected)
Form-data:
- `file`: PNG/JPG
- `question` (optional)

Response:
```json
{
  "answer": "The chart shows quarterly growth from 12% to 18%..."
}
```