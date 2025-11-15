import prisma from "../config/database.js";

/**
 * Vector Service - Vector similarity search using pgvector
 * 
 * Note: This requires raw SQL because Prisma doesn't natively support pgvector operations.
 * The embedding field is marked as Unsupported("vector") in the schema, so we must use
 * raw SQL queries for vector similarity operations.
 */

export const searchSimilarChunks = async (
  userId: string,
  queryEmbedding: number[],
  topK: number = 5
) => {
  // Convert array to pgvector format string: '[1,2,3]'
  const vectorString = `[${queryEmbedding.join(',')}]`;
  
  // Use raw SQL for vector similarity search (pgvector <-> operator)
  // This is necessary because Prisma doesn't support pgvector operations natively
  // Cast parameter through text first, then to vector type
  const results = await prisma.$queryRawUnsafe<Array<{
    id: string;
    text: string;
    embedding: unknown; // Vector type, can't be properly typed
  }>>(
    `
    SELECT id, "userId", "fileId", text, "createdAt"
    FROM "Chunk"
    WHERE "userId" = $1
      AND embedding IS NOT NULL
      AND array_length(embedding::text::float[], 1) > 0
    ORDER BY embedding <-> ($2::text::vector)
    LIMIT $3;
  `,
    userId,
    vectorString,
    topK
  );

  return results;
};
