# Prisma Studio - Chunk Table Issue

## Why Prisma Studio Fails on Chunk Table

Prisma Studio fails when viewing the `Chunk` table because the `embedding` field is marked as `Unsupported("vector")` in the Prisma schema. Prisma Studio cannot display or interact with `Unsupported` types.

## Solution: Use Standard Prisma Queries

While vector similarity search requires raw SQL (due to pgvector), you can use standard Prisma queries for other operations:

### Example: Query Chunks Using Prisma

```typescript
import prisma from "./config/database.js";

// Get all chunks for a user
const chunks = await prisma.chunk.findMany({
  where: { userId: "user-id" },
  include: {
    file: true,
  },
});

// Search chunks by text content
const results = await prisma.chunk.findMany({
  where: {
    userId: "user-id",
    text: {
      contains: "search term",
      mode: "insensitive",
    },
  },
});

// Get chunks for a specific file
const fileChunks = await prisma.chunk.findMany({
  where: {
    fileId: "file-id",
    userId: "user-id",
  },
});
```

## Why Raw SQL is Needed for Vector Search

Vector similarity search uses PostgreSQL's pgvector extension with the `<->` operator, which Prisma doesn't natively support. Therefore, raw SQL is required for:

- Vector similarity search (`embedding <-> query_vector`)
- Inserting/updating vector embeddings

## Workaround for Prisma Studio

To view chunks in Prisma Studio, you can:

1. **Query specific fields** (excluding embedding):
   ```typescript
   const chunks = await prisma.chunk.findMany({
     select: {
       id: true,
       userId: true,
       fileId: true,
       text: true,
       createdAt: true,
       // embedding is excluded
     },
   });
   ```

2. **Use the chunk.service.ts helper functions** for common queries

3. **Use raw SQL queries** directly in your database client for vector operations

