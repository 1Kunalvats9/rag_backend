/**
 * Chunk Service - Helper functions for querying chunks
 * Note: Vector similarity search requires raw SQL due to pgvector support
 */
/**
 * Get all chunks for a user using standard Prisma query
 */
export declare const getUserChunks: (userId: string) => Promise<({
    file: {
        id: string;
        createdAt: Date;
        type: string;
        url: string;
    };
} & {
    userId: string;
    id: string;
    createdAt: Date;
    text: string;
    fileId: string;
})[]>;
/**
 * Get chunks for a specific file using standard Prisma query
 */
export declare const getFileChunks: (fileId: string, userId: string) => Promise<{
    userId: string;
    id: string;
    createdAt: Date;
    text: string;
    fileId: string;
}[]>;
/**
 * Search chunks by text content (case-insensitive)
 */
export declare const searchChunksByText: (userId: string, searchText: string, limit?: number) => Promise<({
    file: {
        id: string;
        type: string;
        url: string;
    };
} & {
    userId: string;
    id: string;
    createdAt: Date;
    text: string;
    fileId: string;
})[]>;
/**
 * Get chunk count for a user
 */
export declare const getChunkCount: (userId: string) => Promise<number>;
/**
 * Get chunk count for a specific file
 */
export declare const getFileChunkCount: (fileId: string, userId: string) => Promise<number>;
/**
 * Delete chunks for a file
 */
export declare const deleteFileChunks: (fileId: string, userId: string) => Promise<import("../generated/prisma/index.js").Prisma.BatchPayload>;
//# sourceMappingURL=chunk.service.d.ts.map