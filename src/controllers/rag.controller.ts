import type { Request, Response } from "express";
import { generateRAGAnswerStream } from "../services/chat.service.js";
import { generateRAGAnswer } from "../services/rag.service.js";

export const ragChat = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { question } = req.body;

    if (!question || typeof question !== "string" || question.trim().length === 0) {
      return res.status(400).json({ message: "Question is required and must be a non-empty string" });
    }

    // Stream the response
    await generateRAGAnswerStream(user.userId, question.trim(), res);
  } catch (err: any) {
    console.error("RAG Chat Error:", err);
    console.error("Error stack:", err.stack);
    
    // If response hasn't been sent yet, send error
    if (!res.headersSent) {
      const errorMessage = err.message || "Something went wrong";
      
      // Check for common error types
      if (errorMessage.includes("Vector search failed") || errorMessage.includes("malformed array")) {
        return res.status(500).json({
          message: "Error searching documents. Please ensure embeddings have been generated for your files.",
          error: process.env.NODE_ENV === "development" ? errorMessage : undefined,
        });
      }
      
      if (errorMessage.includes("Failed to generate embedding")) {
        return res.status(500).json({
          message: "Failed to process your question. Please try again.",
          error: process.env.NODE_ENV === "development" ? errorMessage : undefined,
        });
      }
      
      if (errorMessage.includes("Failed to generate answer")) {
        return res.status(500).json({
          message: "Failed to generate answer. Please try again.",
          error: process.env.NODE_ENV === "development" ? errorMessage : undefined,
        });
      }

      return res.status(500).json({
        message: errorMessage,
        error: process.env.NODE_ENV === "development" ? err.stack : undefined,
      });
    }
  }
};

/**
 * POST /rag endpoint - RAG query without authentication
 * Returns strict JSON format: { answer, sources, confidence }
 */
export const ragQuery = async (req: Request, res: Response) => {
  try {
    const { query } = req.body;

    // Validate query
    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return res.status(400).json({ 
        answer: "",
        sources: [],
        confidence: "low"
      });
    }

    // Generate RAG answer
    const result = await generateRAGAnswer(query.trim());

    // Return strict JSON format
    return res.status(200).json({
      answer: result.answer,
      sources: result.sources,
      confidence: result.confidence,
    });
  } catch (err: any) {
    console.error("RAG Query Error:", err);
    console.error("Error stack:", err.stack);
    
    // Return error in the same format
    return res.status(500).json({
      answer: `Error processing query: ${err.message || "Unknown error"}`,
      sources: [],
      confidence: "low" as const,
    });
  }
};
