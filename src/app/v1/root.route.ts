import { Router, Response, Request } from "express";
import { VideoService } from "@/services/video.service";
import { logger } from "@/config/logger";

import { validateVideoRequestMiddleware, asyncHandler } from "@/middleware";
import { config } from "@/config";
import { ValidatedVideoRequest } from "@/middleware/validateVideoRequest";
import { VIDEO_MODELS } from "@/constants";
import { ApiKeyException, ValidationException } from "@/errors/exceptions";

const router: Router = Router();

router.post(
  "/generate",
  validateVideoRequestMiddleware,
  asyncHandler(async (req: ValidatedVideoRequest, res: Response) => {
    logger.info("Video generation request received", {
      body: req.body,
    });
    const apiKey =
      (req.headers[config.apiKeyHeaderName] as string) ||
      (req.query?.key as string | undefined);

    if (!apiKey) throw new ApiKeyException("Invalid or missing API key");

    // Build request with validated body and optional video file
    const request = {
      ...req.validatedBody!,
    };

    // Generate video
    const videoService = new VideoService(apiKey);
    const response = await videoService.generateVideo(request);

    logger.info("Video generation request completed successfully", {
      response,
    });
    return res.json({ data: response });
  })
);

router.get(
  "/models",
  asyncHandler(async (req: Request, res: Response) => {
    res.json({ data: Object.values(VIDEO_MODELS) });
  })
);

router.get(
  "/download",
  asyncHandler(async (req: Request, res: Response) => {
    const apiKey =
      req.headers[config.apiKeyHeaderName] || (req.query.key as string);
    const { uri } = req.query;
    if (!uri) throw new ValidationException("URI is required");

    const videoService = new VideoService(apiKey as string);
    const buffer = await videoService.downloadVideo(uri as string);
    res.setHeader("Content-Type", "video/mp4");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="generated-video.mp4"'
    );
    res.setHeader("Content-Length", buffer.length.toString());
    res.send(buffer);
  })
);

export default router;
