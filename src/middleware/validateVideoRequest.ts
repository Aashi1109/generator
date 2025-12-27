import { Request, Response, NextFunction } from "express";
import {
  validateVideoRequest,
  VideoGenerationRequest,
} from "@/validators/video.validator";

export interface ValidatedVideoRequest extends Request {
  validatedBody?: VideoGenerationRequest;
  withExtension?: boolean;
}

export function validateVideoRequestMiddleware(
  req: ValidatedVideoRequest,
  res: Response,
  next: NextFunction
) {
  try {
    // Validate JSON body (prompt and optional fields)
    const validatedBody = validateVideoRequest(req.body);
    req.validatedBody = validatedBody;
    req.withExtension = req.body.withExtension || false;

    next();
  } catch (error) {
    next(error);
  }
}
