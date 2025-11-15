import type { Request, Response } from "express";
import prisma from "../config/database.js";
import axios from "axios";
import { extractPDF, extractTextFile, extractImage } from "../services/extract.service.js";
import { chunkText } from "../utils/chunkText.js";

export const processFile = async (req: Request, res: Response) => {
  try {
    const { fileId } = req.params;
    const user = (req as any).user;

    const file = await prisma.file.findUnique({
      where: { id: fileId as string },
    });

    if (!file || file.userId !== user.userId) {
      return res.status(404).json({ message: "File not found" });
    }

    // Download file from Cloudinary
    let buffer: Buffer;
    try {
      const response = await axios.get(file.url, { 
        responseType: "arraybuffer",
        timeout: 30000, // 30 second timeout
        validateStatus: (status) => status === 200, // Only accept 200 status
      });
      buffer = Buffer.from(response.data);
    } catch (downloadError: any) {
      console.error("File download error:", downloadError);
      if (downloadError.response?.status === 401 || downloadError.response?.status === 403) {
        return res.status(500).json({ 
          message: "File access denied. The file URL may have expired or been restricted. Please re-upload the file." 
        });
      }
      return res.status(500).json({ 
        message: `Failed to download file: ${downloadError.message || "Unknown error"}` 
      });
    }

    let extractedText = "";

    // Detect file type
    try {
      if (file.type.includes("pdf")) {
        extractedText = await extractPDF(buffer);
      } else if (file.type.includes("text")) {
        extractedText = await extractTextFile(buffer);
      } else if (file.type.startsWith("image/")) {
        extractedText = await extractImage(file.url);
      } else {
        return res.status(400).json({ message: "Unsupported file type" });
      }

      // Validate extracted text
      if (!extractedText || extractedText.trim().length === 0) {
        return res.status(400).json({ 
          message: "Could not extract text from file. The file may be empty, corrupted, or contain only images." 
        });
      }
    } catch (extractError: any) {
      console.error("Text extraction error:", extractError);
      return res.status(400).json({ 
        message: `Failed to extract text: ${extractError.message || "Unknown error"}` 
      });
    }

    // Save text into Prisma
    await prisma.file.update({
      where: { id: fileId as string },
      data: { text: extractedText },
    });

    const chunks = chunkText(extractedText, 500);
    
    // Ensure we have chunks to insert
    if (chunks.length === 0) {
      return res.status(400).json({ 
        message: "No text chunks could be created from the extracted text" 
      });
    }
    for (const txt of chunks) {
      // Insert chunk with placeholder embedding (will be updated during embedding step)
      // Using raw SQL because embedding is Unsupported type in Prisma
      // Using [0.0]::vector as placeholder (1 dimension) - will be replaced with actual embedding
      await prisma.$executeRawUnsafe(
        `INSERT INTO "Chunk" ("id", "userId", "fileId", "text", "embedding", "createdAt")
         VALUES (gen_random_uuid(), $1, $2, $3, '[0.0]'::vector, NOW())`,
        user.userId,
        fileId as string,
        txt
      );
    }

    return res.status(201).json({
      message: "File processed successfully",
      chunks: chunks.length,
    });
  } catch (err: any) {
    console.error("Process Error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
