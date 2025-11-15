/**
 * Cleanup Utilities - Fix corrupted or invalid vector embeddings
 */
/**
 * Find and delete chunks with invalid/corrupted embeddings
 */
export declare const cleanupInvalidEmbeddings: (userId?: string) => Promise<number>;
/**
 * Count chunks with valid embeddings for a user
 */
export declare const countValidEmbeddings: (userId: string) => Promise<number>;
//# sourceMappingURL=cleanupVectors.d.ts.map