import prisma from "../config/database.js";

export const searchSimilarChunks = async (
  userId: string,
  queryEmbedding: number[],
  topK: number = 5
) => {
  return await prisma.$queryRawUnsafe(
    `
    SELECT id, text, embedding
    FROM "Chunk"
    WHERE "userId" = $1
    ORDER BY embedding <-> $2
    LIMIT $3;
  `,
    userId,
    queryEmbedding,
    topK
  );
};
