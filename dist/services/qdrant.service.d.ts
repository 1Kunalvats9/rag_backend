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
export declare const searchQdrant: (queryEmbedding: number[], topK?: number) => Promise<QdrantSearchResult[]>;
export interface QdrantPoint {
    id: string;
    vector: number[];
    payload: {
        text: string;
        chunkId?: string;
        type?: string;
        extractedInfo?: Record<string, any>;
        createdAt?: string;
        [key: string]: any;
    };
}
/**
 * Store information in Qdrant
 * @param point - Point to upsert with id, vector, and payload
 */
export declare const upsertToQdrant: (point: QdrantPoint) => Promise<void>;
//# sourceMappingURL=qdrant.service.d.ts.map