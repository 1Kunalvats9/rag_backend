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
/**
 * Store information in Qdrant
 * @param point - Point to upsert with id, vector, and payload
 */
export const upsertToQdrant = async (point) => {
    try {
        await qdrantClient.upsert(QDRANT_COLLECTION_NAME, {
            wait: true,
            points: [
                {
                    id: point.id,
                    vector: point.vector,
                    payload: point.payload,
                },
            ],
        });
    }
    catch (error) {
        console.error("Qdrant upsert error:", error);
        throw new Error(`Failed to store information in Qdrant: ${error.message || "Unknown error"}`);
    }
};
//# sourceMappingURL=qdrant.service.js.map