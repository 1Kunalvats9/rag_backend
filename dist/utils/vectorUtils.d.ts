/**
 * Vector Utilities - Helper functions for pgvector operations
 *
 * IMPORTANT: Vector literals must be interpolated directly into SQL strings
 * (not passed as parameters) because Prisma wraps parameters in quotes,
 * which breaks pgvector's vector literal format.
 */
/**
 * Escapes single quotes in a string for SQL interpolation
 */
export declare const escapeSqlString: (str: string) => string;
/**
 * Formats an embedding array as a pgvector literal string
 * Returns: [0.1,0.2,0.3] (unquoted vector literal format)
 *
 * This will be wrapped in single quotes when interpolated into SQL:
 * '${vectorLiteral}'::vector
 */
export declare const formatVectorLiteral: (embedding: number[]) => string;
/**
 * Safely interpolates a vector literal into SQL UPDATE query
 * Escapes the chunk ID to prevent SQL injection
 *
 * Result: UPDATE "Chunk" SET embedding = '[0.1,0.2,0.3]'::vector WHERE id = 'chunk-id'
 */
export declare const buildVectorUpdateQuery: (vectorLiteral: string, chunkId: string) => string;
/**
 * Safely interpolates a vector literal into a similarity search query
 * Escapes userId to prevent SQL injection
 *
 * Result: SELECT ... ORDER BY embedding <-> CAST('[0.1,0.2,0.3]' AS vector) LIMIT 5
 */
export declare const buildVectorSearchQuery: (vectorLiteral: string, userId: string, topK: number) => string;
//# sourceMappingURL=vectorUtils.d.ts.map