import prisma from "../config/database.js";
import { embedText } from "../services/embed.service.js";
import { formatVectorLiteral, buildVectorUpdateQuery } from "../utils/vectorUtils.js";
export const embedFileChunks = async (req, res) => {
    try {
        const { fileId } = req.params;
        const user = req.user;
        // Validate fileId exists
        if (!fileId || typeof fileId !== "string") {
            return res.status(400).json({ message: "File ID is required" });
        }
        // Get file
        const file = await prisma.file.findUnique({ where: { id: fileId } });
        if (!file || file.userId !== user.userId) {
            return res.status(404).json({ message: "File not found" });
        }
        // Get chunks
        const chunks = await prisma.chunk.findMany({ where: { fileId } });
        if (chunks.length === 0)
            return res.status(400).json({ message: "No chunks to embed" });
        let embeddedCount = 0;
        let skippedCount = 0;
        // Embed each chunk
        for (const chunk of chunks) {
            try {
                const embedding = await embedText(chunk.text);
                if (embedding.length === 0) {
                    console.warn(`Empty embedding for chunk ${chunk.id}, skipping`);
                    skippedCount++;
                    continue;
                }
                // Format as pgvector literal: [0.1,0.2,0.3] (unquoted)
                const vectorLiteral = formatVectorLiteral(embedding);
                // Build SQL query with vector literal interpolated directly (not as parameter)
                // This prevents Prisma from wrapping it in quotes
                const updateQuery = buildVectorUpdateQuery(vectorLiteral, chunk.id);
                await prisma.$executeRawUnsafe(updateQuery);
                embeddedCount++;
            }
            catch (chunkError) {
                console.error(`Error embedding chunk ${chunk.id}:`, chunkError);
                skippedCount++;
                continue;
            }
        }
        return res.status(200).json({
            message: "Embeddings created successfully",
            embedded: embeddedCount,
            skipped: skippedCount,
        });
    }
    catch (err) {
        console.error("Embedding Controller Error:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};
//# sourceMappingURL=embed.controller.js.map