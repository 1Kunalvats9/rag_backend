import type { Request, Response } from "express";
import cloudinary from "../config/cloudinary.js";
import prisma from "../config/database.js";

export const uploadFile = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const fileType = req.file.mimetype;

    // Determine resource type based on file type
    let resourceType: "auto" | "raw" | "image" = "auto";
    if (fileType.includes("pdf") || fileType.includes("text")) {
      resourceType = "raw"; // PDFs and text files should be raw
    } else if (fileType.startsWith("image/")) {
      resourceType = "image";
    }

    // Upload to Cloudinary with proper resource type and unsigned upload
    const uploadRes = await cloudinary.uploader.upload_stream(
      { 
        resource_type: resourceType,
        folder: `rag/${user.userId}`,
        use_filename: true,
        unique_filename: true,
        overwrite: false,
        // Don't use signed URLs - use public URLs that don't expire
        type: "upload",
        access_mode: "public"
      },
      async (error, result) => {
        if (error || !result) {
          console.error("Cloudinary upload error:", error);
          return res.status(500).json({ message: "Cloud upload failed" });
        }

        // Save metadata in Prisma
        const file = await prisma.file.create({
          data: {
            userId: user.userId,
            url: result.secure_url,
            type: fileType,
          },
        });

        return res.status(201).json({
          message: "File uploaded successfully",
          file,
        });
      }
    );

    uploadRes.end(req.file.buffer);

  } catch (err: any) {
    console.error("Upload Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
