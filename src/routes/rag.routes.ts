import { Router } from "express";
import { ragChat, ragQuery } from "../controllers/rag.controller.js";
import { auth } from "../middlewares/auth.middleware.js";

const router = Router();

// POST /rag - No authentication required
router.post("/", ragQuery);

// POST /rag/chat - Requires authentication (existing endpoint)
router.post("/chat", auth, ragChat);

export default router;
