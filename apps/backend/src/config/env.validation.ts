import * as Joi from 'joi';

export const validationSchema = Joi.object({
  PORT: Joi.number().default(4000),
  FRONTEND_URL: Joi.string().uri().required(),
  MONGO_URI: Joi.string().required(),
  JWT_SECRET: Joi.string().min(16).required(),
  JWT_EXPIRES_IN: Joi.string().default('7d'),
  GOOGLE_CLIENT_ID: Joi.string().required(),
  GOOGLE_CLIENT_SECRET: Joi.string().required(),
  GOOGLE_CALLBACK_URL: Joi.string().uri().required(),
  GEMINI_API_KEY: Joi.string().required(),
  GEMINI_MODEL: Joi.string().default('gemini-2.5-flash'),
  QDRANT_URL: Joi.string().uri().required(),
  QDRANT_COLLECTION: Joi.string().default('rag_chunks'),
  EMBEDDING_MODEL: Joi.string().default('Xenova/all-MiniLM-L6-v2'),
  MAX_HISTORY_MESSAGES: Joi.number().integer().min(4).max(100).default(24),
  MAX_CONTEXT_CHUNKS: Joi.number().integer().min(1).max(20).default(6),
});