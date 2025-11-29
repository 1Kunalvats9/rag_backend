import { qdrantClient, QDRANT_COLLECTION_NAME } from "../config/qdrant.js";

export interface QdrantSearchResult {
  id: string;
  score: number;
  payload?: {
    text?: string;
    chunkId?: string;
    [key: string]: any;
  } | undefined;
}

/**
 * Search Qdrant for similar vectors
 * @param queryEmbedding - The query vector embedding
 * @param topK - Number of results to return (default: 5)
 * @returns Array of search results with id, score, and payload
 */
export const searchQdrant = async (
  queryEmbedding: number[],
  topK: number = 5
): Promise<QdrantSearchResult[]> => {
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
      id: result.id as string,
      score: result.score,
      payload: result.payload as QdrantSearchResult["payload"],
    }));
  } catch (error: any) {
    console.error("Qdrant search error:", error);
    throw new Error(`Qdrant search failed: ${error.message || "Unknown error"}`);
  }
};

export interface QdrantPoint {
  id: string;
  vector: number[];
  payload: {
    text: string;
    chunkId?: string;
    type?: string; // 'document' | 'user_info'
    extractedInfo?: Record<string, any>;
    createdAt?: string;
    [key: string]: any;
  };
}

/**
 * Store information in Qdrant
 * @param point - Point to upsert with id, vector, and payload
 */
export const upsertToQdrant = async (point: QdrantPoint): Promise<void> => {
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
  } catch (error: any) {
    console.error("Qdrant upsert error:", error);
    throw new Error(`Failed to store information in Qdrant: ${error.message || "Unknown error"}`);
  }
};

