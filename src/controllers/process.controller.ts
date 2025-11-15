import type { Request, Response } from "express";
import prisma from "../config/database.js";
import axios from "axios";
import { extractTextFile } from "../services/extract.service.js";
import { chunkText } from "../utils/chunkText.js";

export const processFile = async (req: Request, res: Response) => {
  try {
    const { fileId } = req.params;
    const user = (req as any).user;

    // Validate fileId exists
    if (!fileId || typeof fileId !== "string") {
      return res.status(400).json({ message: "File ID is required" });
    }

    console.log(`[Process] Starting file processing for fileId: ${fileId}`);

    const file = await prisma.file.findUnique({
      where: { id: fileId },
    });

    if (!file || file.userId !== user.userId) {
      return res.status(404).json({ message: "File not found" });
    }

    console.log(`[Process] File found: ${file.type}, downloading from Cloudinary...`);

    // Download file from Cloudinary with increased timeout
    let buffer: Buffer;
    try {
      const response = await axios.get(file.url, { 
        responseType: "arraybuffer",
        timeout: 60000, // 60 second timeout for large files
        maxContentLength: 100 * 1024 * 1024, // 100MB max
        validateStatus: (status) => status === 200,
      });
      buffer = Buffer.from(response.data);
      console.log(`[Process] File downloaded: ${buffer.length} bytes`);
    } catch (downloadError: any) {
      console.error("File download error:", downloadError);
      if (downloadError.response?.status === 401 || downloadError.response?.status === 403) {
        return res.status(500).json({ 
          message: "File access denied. The file URL may have expired or been restricted. Please re-upload the file." 
        });
      }
      if (downloadError.code === 'ECONNABORTED') {
        return res.status(500).json({ 
          message: "File download timed out. The file may be too large. Please try a smaller file." 
        });
      }
      return res.status(500).json({ 
        message: `Failed to download file: ${downloadError.message || "Unknown error"}` 
      });
    }

    let extractedText = "";

    // Extract text (text files only for now)
    try {
      console.log(`[Process] Extracting text from ${file.type}...`);
      const extractionStart = Date.now();
      
      // Only handle text files
      if (!file.type.includes("text") && !file.type.includes("plain")) {
        return res.status(400).json({ 
          message: "Only text files are supported at this time. Please upload a text file." 
        });
      }

      extractedText = await extractTextFile(buffer);

      const extractionTime = Date.now() - extractionStart;
      console.log(`[Process] Text extraction completed in ${extractionTime}ms, extracted ${extractedText.length} characters`);

      // Validate extracted text
      if (!extractedText || extractedText.trim().length === 0) {
        return res.status(400).json({ 
          message: "The text file appears to be empty. Please upload a file with content." 
        });
      }
    } catch (extractError: any) {
      console.error("Text extraction error:", extractError);
      return res.status(400).json({ 
        message: `Failed to extract text: ${extractError.message || "Unknown error"}` 
      });
    }

    // Save text into Prisma
    console.log(`[Process] Saving extracted text to database...`);
    await prisma.file.update({
      where: { id: fileId },
      data: { text: extractedText },
    });

    // Chunk the text
    console.log(`[Process] Chunking text...`);
    const chunks = chunkText(extractedText, 500);
    
    // Ensure we have chunks to insert
    if (chunks.length === 0) {
      return res.status(400).json({ 
        message: "No text chunks could be created from the extracted text" 
      });
    }

    console.log(`[Process] Inserting ${chunks.length} chunks into database...`);

    // Batch insert chunks for better performance
    // Insert chunks in batches of 50 to avoid overwhelming the database
    const batchSize = 50;
    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);
      
      // Build batch insert query
      const values = batch.map((txt, idx) => {
        const escapedText = txt.replace(/'/g, "''"); // Escape single quotes
        return `(gen_random_uuid(), '${user.userId.replace(/'/g, "''")}', '${fileId.replace(/'/g, "''")}', '${escapedText}', '[0.0]'::vector, NOW())`;
      }).join(', ');

      const batchQuery = `
        INSERT INTO "Chunk" ("id", "userId", "fileId", "text", "embedding", "createdAt")
        VALUES ${values}
      `;

      try {
        await prisma.$executeRawUnsafe(batchQuery);
        console.log(`[Process] Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(chunks.length / batchSize)}`);
      } catch (batchError: any) {
        console.error(`[Process] Error inserting batch ${Math.floor(i / batchSize) + 1}:`, batchError);
        // If batch insert fails, fall back to individual inserts for this batch
        for (const txt of batch) {
          try {
            await prisma.$executeRawUnsafe(
              `INSERT INTO "Chunk" ("id", "userId", "fileId", "text", "embedding", "createdAt")
               VALUES (gen_random_uuid(), $1, $2, $3, '[0.0]'::vector, NOW())`,
              user.userId,
              fileId,
              txt
            );
          } catch (individualError: any) {
            console.error(`[Process] Error inserting individual chunk:`, individualError);
            // Continue with next chunk
          }
        }
      }
    }

    console.log(`[Process] File processing completed successfully with ${chunks.length} chunks`);

    return res.status(201).json({
      message: "File processed successfully",
      chunks: chunks.length,
    });
  } catch (err: any) {
    console.error("Process Error:", err);
    console.error("Process Error Stack:", err.stack);
    return res.status(500).json({ 
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? err.message : undefined
    });
  }
};
