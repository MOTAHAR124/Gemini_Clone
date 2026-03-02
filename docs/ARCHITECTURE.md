# Architecture

## High-Level

- `apps/frontend`: Next.js App Router UI for chat + tools.
- `apps/backend`: NestJS modular API.
- MongoDB stores users, conversations, messages, PDF metadata.
- Qdrant stores document chunk embeddings for RAG.
- GeminiService centralizes LLM access for chat, RAG, vision, PDF generation.

## Backend Modules

- `AuthModule`: Email/password auth, JWT, Google OAuth.
- `UsersModule`: User persistence and profile lookups.
- `ChatModule`: Conversation CRUD, message history, streaming SSE responses.
- `PdfRagModule`: PDF parsing, chunking, embeddings, vector retrieval QA.
- `PdfGeneratorModule`: Gemini markdown generation, HTML conversion, A4 PDF rendering.
- `ImageReaderModule`: Multimodal image analysis via Gemini.
- `EmbeddingModule`: Local embedding generation.
- `VectorModule`: Qdrant collection management and semantic search.

## Frontend UX Areas

- `/chat/[conversationId]`: Main Gemini-like chat UI with sidebar + streaming.
- `/tools/rag`: PDF upload and context-grounded Q&A.
- `/tools/pdf-generator`: Prompt to markdown/html, preview, download PDF.
- `/tools/image-reader`: Image upload, extraction, visual Q&A.

## Core Design Decisions

- SSE for response streaming (browser-native, simple infra).
- Token-safe history truncation before model calls.
- Prompt contracts isolate behavior by task type.
- Auth token stored in localStorage for SPA simplicity.
- Memory upload handling (PDF/image) avoids file storage complexity in free-tier deployments.