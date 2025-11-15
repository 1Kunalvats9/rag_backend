import prisma from "../config/database.js";
import axios from "axios";
import { extractPDF, extractTextFile, extractImage } from "../services/extract.service.js";
import { chunkText } from "../utils/chunkText.js";
export const processFile = async (req, res) => {
    try {
        const { fileId } = req.params;
        const user = req.user;
        const file = await prisma.file.findUnique({
            where: { id: fileId },
        });
        if (!file || file.userId !== user.userId) {
            return res.status(404).json({ message: "File not found" });
        }
        const response = await axios.get(file.url, { responseType: "arraybuffer" });
        const buffer = Buffer.from(response.data);
        let extractedText = "";
        // Detect file type
        if (file.type.includes("pdf")) {
            extractedText = await extractPDF(buffer);
        }
        else if (file.type.includes("text")) {
            extractedText = await extractTextFile(buffer);
        }
        else if (file.type.startsWith("image/")) {
            extractedText = await extractImage(file.url);
        }
        else {
            return res.status(400).json({ message: "Unsupported file type" });
        }
        // Save text into Prisma
        await prisma.file.update({
            where: { id: fileId },
            data: { text: extractedText },
        });
        const chunks = chunkText(extractedText, 500);
        for (const txt of chunks) {
            await prisma.$executeRaw `
        INSERT INTO "Chunk" ("id", "userId", "fileId", "text", "embedding", "createdAt")
        VALUES (gen_random_uuid(), ${user.userId}, ${fileId}, ${txt}, '[]'::vector, NOW())
      `;
        }
        return res.status(201).json({
            message: "File processed successfully",
            chunks: chunks.length,
        });
    }
    catch (err) {
        console.error("Process Error:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};
//# sourceMappingURL=process.controller.js.map