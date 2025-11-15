import prisma from "../config/database.js";

/**
 * Chunk Service - Helper functions for querying chunks
 * Note: Vector similarity search requires raw SQL due to pgvector support
 */

/**
 * Get all chunks for a user using standard Prisma query
 */
export const getUserChunks = async (userId: string) => {
  return await prisma.chunk.findMany({
    where: { userId },
    include: {
      file: {
        select: {
          id: true,
          type: true,
          url: true,
          createdAt: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

/**
 * Get chunks for a specific file using standard Prisma query
 */
export const getFileChunks = async (fileId: string, userId: string) => {
  return await prisma.chunk.findMany({
    where: {
      fileId,
      userId, // Ensure user owns the file
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

/**
 * Search chunks by text content (case-insensitive)
 */
export const searchChunksByText = async (
  userId: string,
  searchText: string,
  limit: number = 10
) => {
  return await prisma.chunk.findMany({
    where: {
      userId,
      text: {
        contains: searchText,
        mode: "insensitive",
      },
    },
    take: limit,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      file: {
        select: {
          id: true,
          type: true,
          url: true,
        },
      },
    },
  });
};

/**
 * Get chunk count for a user
 */
export const getChunkCount = async (userId: string) => {
  return await prisma.chunk.count({
    where: { userId },
  });
};

/**
 * Get chunk count for a specific file
 */
export const getFileChunkCount = async (fileId: string, userId: string) => {
  return await prisma.chunk.count({
    where: {
      fileId,
      userId,
    },
  });
};

/**
 * Delete chunks for a file
 */
export const deleteFileChunks = async (fileId: string, userId: string) => {
  return await prisma.chunk.deleteMany({
    where: {
      fileId,
      userId,
    },
  });
};

