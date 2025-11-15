import { embedText } from "./embed.service.js";
import { searchSimilarChunks } from "./vector.service.js";
import prisma from "../config/database.js";
import { gemini } from "../config/gemini.js";

export const generateRAGAnswer = async (userId: string, question: string) => {
  try {
    // Step 1: Embed the user's question
    const queryEmbedding = await embedText(question);
    
    if (!queryEmbedding || queryEmbedding.length === 0) {
      throw new Error("Failed to generate embedding for question");
    }

    // Step 2: Retrieve top chunks using vector search
    let results: any[];
    try {
      results = await searchSimilarChunks(userId, queryEmbedding, 5);
    } catch (vectorError: any) {
      console.error("Vector search error:", vectorError);
      throw new Error(`Vector search failed: ${vectorError.message || "Unknown error"}`);
    }

    // Check if we have any results
    if (!results || results.length === 0) {
      return "I don't have any documents uploaded yet. Please upload and process some documents first, then generate embeddings for them.";
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

    // Step 4: Call Gemini model
    let answer: string;
    try {
      const model = gemini.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      answer = result.response.text();
    } catch (geminiError: any) {
      console.error("Gemini API error:", geminiError);
      throw new Error(`Failed to generate answer: ${geminiError.message || "Unknown error"}`);
    }

    // Step 5: Save chat history
    try {
      await prisma.chatMessage.create({
        data: {
          userId,
          question,
          answer,
        },
      });
    } catch (dbError: any) {
      // Log but don't fail if chat history save fails
      console.error("Failed to save chat history:", dbError);
    }

    return answer;
  } catch (error: any) {
    console.error("generateRAGAnswer error:", error);
    throw error; // Re-throw to be handled by controller
  }
};
