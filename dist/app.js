import express from "express";
import dotenv from "dotenv";
dotenv.config();
const app = express();
// JSON parsing middleware - skip for GET/HEAD/OPTIONS, apply for others
const jsonParser = express.json();
app.use((req, res, next) => {
    // Skip JSON parsing for GET, HEAD, OPTIONS requests
    if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
        return next();
    }
    // Apply JSON parsing for POST, PUT, PATCH, DELETE
    jsonParser(req, res, next);
});
// Routes
import authRoutes from "./routes/auth.routes.js";
import healthRoutes from "./routes/health.routes.js";
import filesRoutes from "./routes/files.routes.js";
import embedRoutes from "./routes/embed.routes.js";
import ragRoutes from "./routes/rag.routes.js";
app.use("/health", healthRoutes);
app.use("/auth", authRoutes);
app.use("/files", filesRoutes);
app.use("/embed", embedRoutes);
app.use("/rag", ragRoutes);
import { errorHandler } from "./middlewares/errorHandler.middleware.js";
app.use(errorHandler);
export default app;
//# sourceMappingURL=app.js.map