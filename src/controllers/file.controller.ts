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

    // Only accept text files for now
    if (!fileType.includes("text") && !fileType.includes("plain")) {
      return res.status(400).json({ 
        message: "Only text files (.txt) are supported at this time. Please upload a text file." 
      });
    }

    // Upload to Cloudinary as raw text file
    const uploadRes = await cloudinary.uploader.upload_stream(
      { 
        resource_type: "raw",
        folder: `rag/${user.userId}`,
        use_filename: true,
        unique_filename: true,
        overwrite: false,
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
