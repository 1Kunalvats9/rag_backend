import { Router } from "express";
import { uploadFile } from "../controllers/file.controller.js";
import { processFile } from "../controllers/process.controller.js";
import { auth } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";
const router = Router();
router.post("/upload", auth, upload.single("file"), uploadFile);
router.post("/process/:fileId", auth, processFile);
export default router;
//# sourceMappingURL=files.routes.js.map