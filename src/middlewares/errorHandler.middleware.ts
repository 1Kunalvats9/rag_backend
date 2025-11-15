import type { Request, Response, NextFunction } from "express";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // JSON parsing errors (from body-parser/express.json)
  if (err instanceof SyntaxError && err.message.includes("JSON")) {
    return res.status(400).json({
      message: "Invalid JSON in request body",
      error: err.message,
    });
  }

  // Other errors
  console.error("Error:", err);
  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

