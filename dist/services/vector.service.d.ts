/**
 * Vector Service - Vector similarity search using pgvector
 *
 * Note: This requires raw SQL because Prisma doesn't natively support pgvector operations.
 * The embedding field is marked as Unsupported("vector") in the schema, so we must use
 * raw SQL queries for vector similarity operations.
 *
 * IMPORTANT: Vector literals are interpolated directly into SQL (not as parameters)
 * to avoid Prisma wrapping them in quotes, which breaks pgvector.
 */
export declare const searchSimilarChunks: (userId: string, queryEmbedding: number[], topK?: number) => Promise<{
    id: string;
    userId: string;
    fileId: string;
    text: string;
    createdAt: Date;
}[]>;
//# sourceMappingURL=vector.service.d.ts.map