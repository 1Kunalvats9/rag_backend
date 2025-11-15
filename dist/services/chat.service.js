import { embedText } from "./embed.service.js";
import { searchSimilarChunks } from "./vector.service.js";
import prisma from "../config/database.js";
import { gemini } from "../config/gemini.js";
/**
 * Generate RAG answer with streaming support
 * Streams the response token by token using Gemini's streaming API
 */
export const generateRAGAnswerStream = async (userId, question, res) => {
    try {
        // Step 1: Embed the user's question
        const queryEmbedding = await embedText(question);
        if (!queryEmbedding || queryEmbedding.length === 0) {
            throw new Error("Failed to generate embedding for question");
        }
        // Step 2: Retrieve top chunks using vector search
        let results;
        try {
            results = await searchSimilarChunks(userId, queryEmbedding, 5);
        }
        catch (vectorError) {
            console.error("Vector search error:", vectorError);
            throw new Error(`Vector search failed: ${vectorError.message || "Unknown error"}`);
        }
        // Check if we have any results
        if (!results || results.length === 0) {
            const noDocsMessage = "I don't have any documents uploaded yet. Please upload and process some documents first, then generate embeddings for them.";
            res.write(`data: ${JSON.stringify({ content: noDocsMessage, done: true })}\n\n`);
            res.end();
            return;
        }
        const context = results.map((c) => c.text).join("\n\n");
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
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
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
            }).catch((dbError) => {
                console.error("Failed to save chat history:", dbError);
            });
        }
        catch (geminiError) {
            console.error("Gemini API error:", geminiError);
            const errorMessage = `Failed to generate answer: ${geminiError.message || "Unknown error"}`;
            res.write(`data: ${JSON.stringify({ error: errorMessage })}\n\n`);
            res.end();
        }
    }
    catch (error) {
        console.error("generateRAGAnswerStream error:", error);
        res.write(`data: ${JSON.stringify({ error: error.message || "Something went wrong" })}\n\n`);
        res.end();
    }
};
//# sourceMappingURL=chat.service.js.map