/**
 * Cleanup Utilities - Fix corrupted or invalid vector embeddings
 */

import prisma from "../config/database.js";

/**
 * Find and delete chunks with invalid/corrupted embeddings
 */
export const cleanupInvalidEmbeddings = async (userId?: string) => {
  try {
    // Find chunks with NULL embeddings or invalid vector dimensions
    const query = userId
      ? `
        DELETE FROM "Chunk"
        WHERE "userId" = '${userId.replace(/'/g, "''")}'
          AND (embedding IS NULL OR array_length(embedding::text::float[], 1) IS NULL OR array_length(embedding::text::float[], 1) = 0)
      `
      : `
        DELETE FROM "Chunk"
        WHERE embedding IS NULL 
          OR array_length(embedding::text::float[], 1) IS NULL 
          OR array_length(embedding::text::float[], 1) = 0
      `;

    const result = await prisma.$executeRawUnsafe(query);
    return result;
  } catch (err: any) {
    console.error("Error cleaning up invalid embeddings:", err);
    throw err;
  }
};

/**
 * Count chunks with valid embeddings for a user
 */
export const countValidEmbeddings = async (userId: string): Promise<number> => {
  try {
    const result = await prisma.$queryRawUnsafe<Array<{ count: bigint }>>(
      `
      SELECT COUNT(*) as count
      FROM "Chunk"
      WHERE "userId" = $1
        AND embedding IS NOT NULL
        AND array_length(embedding::text::float[], 1) > 0
      `,
      userId
    );

    return Number(result[0]?.count || 0);
  } catch (err: any) {
    console.error("Error counting valid embeddings:", err);
    return 0;
  }
};

