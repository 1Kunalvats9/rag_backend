import { QdrantClient } from "@qdrant/js-client-rest";
const qdrantUrl = process.env.QDRANT_URL || "http://localhost:6333";
const qdrantApiKey = process.env.QDRANT_API_KEY;
export const qdrantClient = new QdrantClient(qdrantApiKey
    ? {
        url: qdrantUrl,
        apiKey: qdrantApiKey,
    }
    : {
        url: qdrantUrl,
    });
export const QDRANT_COLLECTION_NAME = process.env.QDRANT_COLLECTION_NAME || "documents";
//# sourceMappingURL=qdrant.js.map