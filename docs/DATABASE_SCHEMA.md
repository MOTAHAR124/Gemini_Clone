# Database Schema

## MongoDB Collections

### users

- `_id: ObjectId`
- `email: string` (unique, lowercase)
- `name: string`
- `passwordHash?: string`
- `googleId?: string` (unique sparse)
- `avatarUrl?: string`
- `createdAt: Date`
- `updatedAt: Date`

### conversations

- `_id: ObjectId`
- `userId: ObjectId` (indexed)
- `title: string`
- `lastMessageAt: Date` (indexed)
- `createdAt: Date`
- `updatedAt: Date`

Indexes:
- `{ userId: 1, lastMessageAt: -1 }`

### messages

- `_id: ObjectId`
- `conversationId: ObjectId` (indexed)
- `userId: ObjectId` (indexed)
- `role: 'user' | 'assistant' | 'system'`
- `content: string`
- `tokens: number`
- `metadata?: object`
- `createdAt: Date`
- `updatedAt: Date`

Indexes:
- `{ conversationId: 1, createdAt: 1 }`

### documentrecords

- `_id: ObjectId`
- `userId: ObjectId` (indexed)
- `fileName: string`
- `status: 'processing' | 'ready' | 'failed'`
- `pageCount: number`
- `chunkCount: number`
- `errorMessage?: string`
- `createdAt: Date`
- `updatedAt: Date`

Indexes:
- `{ userId: 1, createdAt: -1 }`

## Qdrant Collection (`rag_chunks`)

Vector:
- `size`: derived from embedding model output (MiniLM: 384)
- `distance`: `Cosine`

Payload per point:
- `userId: string`
- `documentId: string`
- `chunkIndex: number`
- `text: string`