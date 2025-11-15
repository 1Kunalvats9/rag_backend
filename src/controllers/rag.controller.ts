import type { Request, Response } from "express";
import { generateRAGAnswer } from "../services/chat.service.js";

export const ragChat = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { question } = req.body;

    if (!question || typeof question !== "string" || question.trim().length === 0) {
      return res.status(400).json({ message: "Question is required and must be a non-empty string" });
    }

    const answer = await generateRAGAnswer(user.userId, question.trim());

    return res.json({ answer });
  } catch (err: any) {
    console.error("RAG Chat Error:", err);
    console.error("Error stack:", err.stack);
    
    // Provide more specific error messages
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
};
