import prisma from "../config/database.js";
export const healthCheck = async (_req, res) => {
    try {
        // Check database connectivity
        await prisma.$queryRaw `SELECT 1`;
        res.status(200).json({
            status: "healthy",
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            database: "connected",
        });
    }
    catch (error) {
        res.status(503).json({
            status: "unhealthy",
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            database: "disconnected",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
//# sourceMappingURL=health.controller.js.map