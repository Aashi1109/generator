import { NextFunction, Request, Response } from "express";
import { validateSpeechGenerationRequest } from "../speech";
import { validateVideoGenerationRequest } from "../video";
import { NotFoundException } from "@/shared";

export const validateGenerationRequest =
  (validator: (handler: any) => any) =>
  (req: Request, res: Response, next: NextFunction) => {
    const { type } = req.params;
    let handler;
    switch (type) {
      case "speech":
        handler = validateSpeechGenerationRequest;
        break;
      case "video":
        handler = validateVideoGenerationRequest;
        break;
      default:
        throw new NotFoundException(`Invalid type: ${type}`);
    }
    return validator(handler as any)(req, res, next);
  };
