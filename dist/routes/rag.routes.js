import { Router } from "express";
import { ragChat } from "../controllers/rag.controller.js";
import { auth } from "../middlewares/auth.middleware.js";
const router = Router();
router.post("/chat", auth, ragChat);
export default router;
//# sourceMappingURL=rag.routes.js.map