import prisma from "../config/database.js";
import { formatVectorLiteral, buildVectorSearchQuery } from "../utils/vectorUtils.js";
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
export const searchSimilarChunks = async (userId, queryEmbedding, topK = 5) => {
    if (queryEmbedding.length === 0) {
        throw new Error("Query embedding cannot be empty");
    }
    // Format as pgvector literal: [0.1,0.2,0.3] (unquoted)
    const vectorLiteral = formatVectorLiteral(queryEmbedding);
    // Build SQL query with vector literal interpolated directly (not as parameter)
    // This prevents Prisma from wrapping it in quotes
    const searchQuery = buildVectorSearchQuery(vectorLiteral, userId, topK);
    const results = await prisma.$queryRawUnsafe(searchQuery);
    return results;
};
//# sourceMappingURL=vector.service.js.map