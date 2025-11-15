import { Router } from "express";
import { embedFileChunks } from "../controllers/embed.controller.js";
import { auth } from "../middlewares/auth.middleware.js";
const router = Router();
router.post("/embed/:fileId", auth, embedFileChunks);
export default router;
//# sourceMappingURL=embed.routes.js.map