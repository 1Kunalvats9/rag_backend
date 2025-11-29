export interface RAGResponse {
    answer: string;
    sources: string[];
    confidence: "low" | "medium" | "high";
}
/**
 * Generate RAG answer using Qdrant and Gemini
 * @param query - User query string
 * @param topK - Number of chunks to retrieve (default: 5)
 * @returns RAG response with answer, sources, and confidence
 */
export declare const generateRAGAnswer: (query: string, topK?: number) => Promise<RAGResponse>;
//# sourceMappingURL=rag.service.d.ts.map