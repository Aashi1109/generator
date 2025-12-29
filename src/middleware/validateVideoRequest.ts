import { Request, Response, NextFunction } from "express";
import {
  validateVideoRequest,
  VideoGenerationRequest,
} from "@/validators/video.validator";

export interface ValidatedVideoRequest extends Request {
  validatedBody?: VideoGenerationRequest;
}

export default function validateVideoRequestMiddleware(
  req: ValidatedVideoRequest,
  res: Response,
  next: NextFunction
) {
  try {
    // Validate JSON body (prompt and optional fields)
    const validatedBody = validateVideoRequest(req.body);
    req.validatedBody = validatedBody;

    next();
  } catch (error) {
    next(error);
  }
}
