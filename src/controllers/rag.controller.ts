import type { Request, Response } from "express";
import { generateRAGAnswer } from "../services/chat.service.js";

export const ragChat = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { question } = req.body;

    if (!question)
      return res.status(400).json({ message: "Question is required" });

    const answer = await generateRAGAnswer(user.userId, question);

    return res.json({ answer });
  } catch (err: any) {
    console.error("RAG Chat Error:", err);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};
