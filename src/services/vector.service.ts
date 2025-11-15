import prisma from "../config/database.js";

export const searchSimilarChunks = async (
  userId: string,
  queryEmbedding: number[],
  topK: number = 5
) => {
  // Convert array to pgvector format string: '[1,2,3]'
  const vectorString = `[${queryEmbedding.join(',')}]`;
  
  // Embed vector string directly in SQL to avoid parameter quoting issues
  // Use parameterized query for userId and topK to prevent SQL injection
  return await prisma.$queryRawUnsafe(
    `
    SELECT id, text, embedding
    FROM "Chunk"
    WHERE "userId" = $1
      AND embedding IS NOT NULL
      AND array_length(embedding::text::float[], 1) > 0
    ORDER BY embedding <-> ${vectorString}::vector
    LIMIT $2;
  `,
    userId,
    topK
  );
};
