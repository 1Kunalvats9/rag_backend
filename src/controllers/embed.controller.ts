import type { Request, Response } from "express";
import prisma from "../config/database.js";
import { embedText } from "../services/embed.service.js";

export const embedFileChunks = async (req: Request, res: Response) => {
  try {
    const { fileId } = req.params;
    const user = (req as any).user;

    // Get file
    const file = await prisma.file.findUnique({ where: { id: fileId as string } });
    if (!file || file.userId !== user.userId) {
      return res.status(404).json({ message: "File not found" });
    }

    // Get chunks
    const chunks = await prisma.chunk.findMany({ where: { fileId: fileId as string } });

    if (chunks.length === 0)
      return res.status(400).json({ message: "No chunks to embed" });

    // Embed each chunk
    for (const chunk of chunks) {
      const embedding = await embedText(chunk.text);

      if (embedding.length === 0) {
        console.warn(`Empty embedding for chunk ${chunk.id}, skipping`);
        continue;
      }

      // Convert array to pgvector format: '[1,2,3]'::vector
      const vectorString = `[${embedding.join(',')}]`;

      // Save embedding (pgvector) - using $executeRawUnsafe for vector type casting
      await prisma.$executeRawUnsafe(
        `UPDATE "Chunk" SET embedding = $1::vector WHERE id = $2`,
        vectorString,
        chunk.id
      );
    }

    return res.status(200).json({
      message: "Embeddings created successfully",
      embedded: chunks.length,
    });

  } catch (err: any) {
    console.error("Embedding Controller Error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
