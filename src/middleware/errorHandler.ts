import { Request, Response, NextFunction } from "express";
import { BaseException } from "@/errors/exceptions";
import { logger } from "@/config/logger";

export default function errorHandler(
  err: Error | BaseException,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Log the error
  logger.error("Request error", {
    error: {
      name: err.name,
      message: err.message,
      stack: err.stack,
    },
    request: {
      method: req.method,
      path: req.path,
      body: req.body,
    },
  });

  // Handle known exceptions
  if (err instanceof BaseException) {
    return res.status(err.statusCode).json(err.toJSON());
  }

  // Handle unknown errors
  return res.status(500).json({
    error: {
      name: "InternalServerError",
      message: "An unexpected error occurred",
      statusCode: 500,
    },
  });
}
