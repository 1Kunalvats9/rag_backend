import prisma from "../config/database.js";

export const searchSimilarChunks = async (
  userId: string,
  queryEmbedding: number[],
  topK: number = 5
) => {
  // Convert array to pgvector format string: '[1,2,3]'
  const vectorString = `[${queryEmbedding.join(',')}]`;
  
  // Use same approach as embed controller - pass vectorString as parameter with ::vector cast
  // This works because PostgreSQL accepts the string format when cast to vector type
  return await prisma.$queryRawUnsafe(
    `
    SELECT id, text, embedding
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
};
