import { embedText } from "./embed.service.js";
import { searchQdrant, upsertToQdrant } from "./qdrant.service.js";
import { extractInformation } from "./extract.service.js";
import { gemini } from "../config/gemini.js";
import { randomUUID } from "crypto";
/**
 * Calculate confidence based on similarity scores
 * @param scores - Array of similarity scores from Qdrant
 * @returns Confidence level
 */
const calculateConfidence = (scores) => {
    if (scores.length === 0)
        return "low";
    const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const maxScore = Math.max(...scores);
    // High confidence: average > 0.8 or max > 0.9
    if (avgScore > 0.8 || maxScore > 0.9) {
        return "high";
    }
    // Medium confidence: average > 0.6 or max > 0.7
    if (avgScore > 0.6 || maxScore > 0.7) {
        return "medium";
    }
    // Low confidence: everything else
    return "low";
};
/**
 * Generate RAG answer using Qdrant and Gemini
 * @param query - User query string
 * @param topK - Number of chunks to retrieve (default: 5)
 * @returns RAG response with answer, sources, and confidence
 */
export const generateRAGAnswer = async (query, topK = 5) => {
    // Step 1: Get embeddings from HuggingFace
    const queryEmbedding = await embedText(query);
    if (!queryEmbedding || queryEmbedding.length === 0) {
        throw new Error("Failed to generate embedding for query");
    }
    // Step 2: Search Qdrant for top-k relevant chunks
    let searchResults;
    try {
        searchResults = await searchQdrant(queryEmbedding, topK);
    }
    catch (error) {
        // If Qdrant search fails (e.g., collection doesn't exist), treat as no results
        searchResults = [];
    }
    if (!searchResults || searchResults.length === 0) {
        // No results found - extract and save information from the query
        try {
            // Extract structured information from the query
            const extractedInfo = await extractInformation(query);
            // Generate a unique ID for this information
            const infoId = randomUUID();
            // Prepare text representation for storage
            const textToStore = extractedInfo.summary || query;
            // Store in Qdrant
            await upsertToQdrant({
                id: infoId,
                vector: queryEmbedding,
                payload: {
                    text: textToStore,
                    chunkId: infoId,
                    type: "user_info",
                    extractedInfo: extractedInfo.keyValuePairs,
                    createdAt: new Date().toISOString(),
                },
            });
            // Generate a friendly response acknowledging the information was saved
            const acknowledgmentPrompt = `The user provided the following information: "${query}"

Based on the extracted information, provide a friendly acknowledgment that you've saved this information. 
Be conversational and natural. Keep it brief (1-2 sentences).

Examples:
- If they said "my name is kunal": "Got it! I've saved that your name is kunal. I'll remember that."
- If they said "I like pizza": "Thanks for letting me know! I've noted that you like pizza."
- Generic: "I've saved that information for future reference. Thanks for sharing!"`;
            let answer = "";
            try {
                const model = gemini.getGenerativeModel({ model: "gemini-1.5-flash" });
                const result = await model.generateContent(acknowledgmentPrompt);
                answer = result.response.text();
            }
            catch (geminiError) {
                // Fallback acknowledgment
                answer = `I've saved that information: ${textToStore}. I'll remember it for future reference.`;
            }
            return {
                answer: answer.trim(),
                sources: [infoId],
                confidence: "medium",
            };
        }
        catch (saveError) {
            console.error("Error saving information to Qdrant:", saveError);
            // If saving fails, return a helpful message
            return {
                answer: "I don't have any relevant information to answer your question, and I encountered an issue saving your information. Please try again later.",
                sources: [],
                confidence: "low",
            };
        }
    }
    // Extract chunk texts and IDs
    const chunks = searchResults.map((result) => ({
        id: result.payload?.chunkId || result.id,
        text: result.payload?.text || "",
        score: result.score,
    }));
    // Filter out chunks without text
    const validChunks = chunks.filter((chunk) => chunk.text.trim().length > 0);
    if (validChunks.length === 0) {
        return {
            answer: "I found some results but they don't contain text content.",
            sources: [],
            confidence: "low",
        };
    }
    // Step 3: Build RAG prompt
    const context = validChunks.map((chunk) => chunk.text).join("\n\n");
    const prompt = `You are an AI assistant. Use ONLY the following context to answer the user's question.
If the answer is not found in the context, say "I don't have information about that."

CONTEXT:
${context}

QUESTION:
${query}

ANSWER:
`;
    // Step 4: Send to Gemini
    let answer = "";
    try {
        const model = gemini.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(prompt);
        const response = result.response;
        answer = response.text();
    }
    catch (error) {
        console.error("Gemini API error:", error);
        throw new Error(`Failed to generate answer: ${error.message || "Unknown error"}`);
    }
    // Step 5: Extract sources and calculate confidence
    const sources = validChunks.map((chunk) => chunk.id);
    const scores = validChunks.map((chunk) => chunk.score);
    const confidence = calculateConfidence(scores);
    return {
        answer: answer.trim(),
        sources,
        confidence,
    };
};
//# sourceMappingURL=rag.service.js.map