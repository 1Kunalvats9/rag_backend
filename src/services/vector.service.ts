import prisma from "../config/database.js";

export const searchSimilarChunks = async (
  userId: string,
  queryEmbedding: number[],
  topK: number = 5
) => {
  // Convert array to pgvector format string: '[1,2,3]'
  const vectorString = `[${queryEmbedding.join(',')}]`;
  
  return await prisma.$queryRawUnsafe(
    `
    SELECT id, text, embedding
    FROM "Chunk"
    WHERE "userId" = $1
      AND embedding IS NOT NULL
      AND array_length(embedding::text::float[], 1) > 0
    ORDER BY embedding <-> $2::vector
    LIMIT $3;
  `,
    userId,
    vectorString,
    topK
  );
};
