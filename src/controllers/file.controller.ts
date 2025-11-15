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

    // Upload to Cloudinary
    const uploadRes = await cloudinary.uploader.upload_stream(
      { resource_type: "auto", folder: `rag/${user.userId}` },
      async (error, result) => {
        if (error || !result) {
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
