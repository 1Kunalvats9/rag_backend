import type { Response } from "express";
/**
 * Generate RAG answer with streaming support
 * Streams the response token by token using Gemini's streaming API
 */
export declare const generateRAGAnswerStream: (userId: string, question: string, res: Response) => Promise<void>;
//# sourceMappingURL=chat.service.d.ts.map