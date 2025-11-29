import { qdrantClient, QDRANT_COLLECTION_NAME } from "../config/qdrant.js";
/**
 * Search Qdrant for similar vectors
 * @param queryEmbedding - The query vector embedding
 * @param topK - Number of results to return (default: 5)
 * @returns Array of search results with id, score, and payload
 */
export const searchQdrant = async (queryEmbedding, topK = 5) => {
    if (queryEmbedding.length === 0) {
        throw new Error("Query embedding cannot be empty");
    }
    try {
        const searchResults = await qdrantClient.search(QDRANT_COLLECTION_NAME, {
            vector: queryEmbedding,
            limit: topK,
            with_payload: true,
        });
        return searchResults.map((result) => ({
            id: result.id,
            score: result.score,
            payload: result.payload,
        }));
    }
    catch (error) {
        console.error("Qdrant search error:", error);
        throw new Error(`Qdrant search failed: ${error.message || "Unknown error"}`);
    }
};
//# sourceMappingURL=qdrant.service.js.map