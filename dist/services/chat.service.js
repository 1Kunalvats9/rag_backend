import { embedText } from "./embed.service.js";
import { searchSimilarChunks } from "./vector.service.js";
import prisma from "../config/database.js";
import { gemini } from "../config/gemini.js";
export const generateRAGAnswer = async (userId, question) => {
    // Step 1: Embed the user's question
    const queryEmbedding = await embedText(question);
    // Step 2: Retrieve top chunks using vector search
    const results = await searchSimilarChunks(userId, queryEmbedding, 5);
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
    // Step 4: Call Gemini model
    const model = gemini.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const answer = result.response.text();
    // Step 5: Save chat history
    const saved = await prisma.chatMessage.create({
        data: {
            userId,
            question,
            answer,
        },
    });
    return answer;
};
//# sourceMappingURL=chat.service.js.map