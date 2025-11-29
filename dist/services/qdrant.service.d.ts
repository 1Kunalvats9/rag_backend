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
//# sourceMappingURL=qdrant.service.d.ts.map