import { hf } from "../config/huggingFace.js";
export const embedText = async (text) => {
    try {
        const response = await hf.featureExtraction({
            model: "sentence-transformers/all-MiniLM-L6-v2",
            inputs: text,
        });
        // HF returns nested arrays sometimes — flatten it
        const result = Array.isArray(response[0]) ? response[0] : response;
        // Ensure we always return a flat number array
        if (Array.isArray(result) && result.length > 0 && Array.isArray(result[0])) {
            return result.flat();
        }
        return result;
    }
    catch (err) {
        console.error("Embedding error:", err);
        return [];
    }
};
//# sourceMappingURL=embed.service.js.map