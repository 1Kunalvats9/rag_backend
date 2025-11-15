import { embedText } from "./embed.service.js";
import { searchSimilarChunks } from "./vector.service.js";
import prisma from "../config/database.js";
import { gemini } from "../config/gemini.js";
import type { Response } from "express";

/**
 * Generate RAG answer with streaming support
 * Streams the response token by token using Gemini's streaming API
 */
export const generateRAGAnswerStream = async (
  userId: string,
  question: string,
  res: Response
): Promise<void> => {
  // Set SSE headers first, before any operations
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");
  
  try {
    // Step 1: Embed the user's question
    const queryEmbedding = await embedText(question);
    
    if (!queryEmbedding || queryEmbedding.length === 0) {
      res.write(`data: ${JSON.stringify({ error: "Failed to generate embedding for question" })}\n\n`);
      res.end();
      return;
    }

    // Step 2: Retrieve top chunks using vector search
    let results: any[];
    try {
      results = await searchSimilarChunks(userId, queryEmbedding, 5);
    } catch (vectorError: any) {
      console.error("Vector search error:", vectorError);
      const errorMsg = `Vector search failed: ${vectorError.message || "Unknown error"}`;
      res.write(`data: ${JSON.stringify({ error: errorMsg })}\n\n`);
      res.end();
      return;
    }

    // Check if we have any results
    if (!results || results.length === 0) {
      const noDocsMessage = "I don't have any documents uploaded yet. Please upload and process some documents first, then generate embeddings for them.";
      res.write(`data: ${JSON.stringify({ content: noDocsMessage, done: true })}\n\n`);
      res.end();
      return;
    }

    const context = results.map((c: any) => c.text).join("\n\n");

    // Step 3: Build RAG Prompt
    const prompt = `
You are an AI assistant. Use ONLY the following context to answer the user's question.
If the answer is not found in the context, say "I don't have information about that."

CONTEXT:
${context}

QUESTION:
${question}

ANSWER:
`;

    // Step 4: Stream response from Gemini
    let fullAnswer = "";

    try {
      const model = gemini.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContentStream(prompt);

      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        if (chunkText) {
          fullAnswer += chunkText;
          // Send each chunk to client
          res.write(`data: ${JSON.stringify({ content: chunkText, done: false })}\n\n`);
        }
      }

      // Send final message indicating stream is complete
      res.write(`data: ${JSON.stringify({ content: "", done: true })}\n\n`);
      res.end();

      // Step 5: Save chat history (async, don't wait)
      prisma.chatMessage.create({
        data: {
          userId,
          question,
          answer: fullAnswer,
        },
      }).catch((dbError: any) => {
        console.error("Failed to save chat history:", dbError);
      });

    } catch (geminiError: any) {
      console.error("Gemini API error:", geminiError);
      const errorMessage = `Failed to generate answer: ${geminiError.message || "Unknown error"}`;
      res.write(`data: ${JSON.stringify({ error: errorMessage })}\n\n`);
      res.end();
    }
  } catch (error: any) {
    console.error("generateRAGAnswerStream error:", error);
    console.error("Error stack:", error.stack);
    
    // Only send error if response hasn't been ended
    if (!res.writableEnded) {
      try {
        res.write(`data: ${JSON.stringify({ error: error.message || "Something went wrong" })}\n\n`);
        res.end();
      } catch (writeError: any) {
        console.error("Failed to write error to response:", writeError);
        // Response might already be closed, ignore
      }
    }
  }
};
