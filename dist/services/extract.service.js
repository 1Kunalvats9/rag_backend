import { gemini } from "../config/gemini.js";
/**
 * Extract text from a file buffer (for text files)
 * @param buffer - File buffer
 * @returns Extracted text as string
 */
export const extractTextFile = async (buffer) => {
    try {
        // Convert buffer to string (assuming UTF-8 encoding)
        const text = buffer.toString("utf-8");
        return text;
    }
    catch (error) {
        console.error("Text extraction error:", error);
        throw new Error(`Failed to extract text from file: ${error.message || "Unknown error"}`);
    }
};
/**
 * Extract structured information from user query using Gemini
 * @param query - User query string
 * @returns Extracted information with key-value pairs
 */
export const extractInformation = async (query) => {
    const prompt = `Extract key information from the following user statement. 
Identify facts, personal information, preferences, or any structured data.

User statement: "${query}"

Return a JSON object with:
- "type": one of "personal_info", "fact", "preference", or "other"
- "keyValuePairs": an object with key-value pairs (e.g., {"name": "kunal", "age": "25"})
- "summary": a brief summary of what information was provided

Example:
Input: "my name is kunal"
Output: {"type": "personal_info", "keyValuePairs": {"name": "kunal"}, "summary": "User's name is kunal"}

Input: "I like pizza"
Output: {"type": "preference", "keyValuePairs": {"favorite_food": "pizza"}, "summary": "User likes pizza"}

Only return valid JSON, no additional text.`;
    try {
        const model = gemini.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text().trim();
        // Extract JSON from response (handle markdown code blocks if present)
        let jsonText = text;
        if (text.includes("```json")) {
            const parts = text.split("```json");
            if (parts[1]) {
                const codeBlock = parts[1].split("```")[0];
                if (codeBlock) {
                    jsonText = codeBlock.trim();
                }
            }
        }
        else if (text.includes("```")) {
            const parts = text.split("```");
            if (parts[1]) {
                jsonText = parts[1].trim();
            }
        }
        const extracted = JSON.parse(jsonText);
        // Validate and normalize
        return {
            type: extracted.type || "other",
            keyValuePairs: extracted.keyValuePairs || {},
            summary: extracted.summary || query,
        };
    }
    catch (error) {
        console.error("Information extraction error:", error);
        // Fallback: return basic structure
        return {
            type: "other",
            keyValuePairs: {},
            summary: query,
        };
    }
};
//# sourceMappingURL=extract.service.js.map