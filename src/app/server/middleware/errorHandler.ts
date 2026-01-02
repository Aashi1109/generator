import { Request, Response, NextFunction } from "express";
import { BaseException } from "@/shared/errors";
import { config, logger } from "@/shared";

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

  // Ensure response is JSON
  res.setHeader("Content-Type", "application/json");

  // Handle known exceptions
  if (err instanceof BaseException) {
    const errorResponse = {
      error: {
        name: err.name,
        message: err.message,
        code: err.code,
        statusCode: err.statusCode,
        details: err.details,
        ...(config.isDev ? { stack: err.stack } : {}),
      },
    };
    // Ensure the response is a proper JSON object, not a string
    return res.status(+(err.statusCode || 500)).json(errorResponse);
  }

  // Handle unknown errors - ensure message is not stringified JSON
  let errorMessage = "An unexpected error occurred";
  if (err.message) {
    // Check if message is a stringified JSON object
    try {
      const parsed = JSON.parse(err.message);
      // If it parses successfully, use the parsed object
      errorMessage = parsed;
    } catch {
      // If not JSON, use the message as-is
      errorMessage = err.message;
    }
  }

  return res.status(500).json({
    error: {
      name: "InternalServerError",
      message: errorMessage,
      statusCode: 500,
      details: (err as any).details,
      ...(config.isDev ? { stack: err.stack } : {}),
    },
  });
}
