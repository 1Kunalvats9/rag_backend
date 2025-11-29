import type { Request, Response } from "express";
export declare const ragChat: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * POST /rag endpoint - RAG query without authentication
 * Returns strict JSON format: { answer, sources, confidence }
 */
export declare const ragQuery: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=rag.controller.d.ts.map