import { Router, Response } from "express";
import { VideoService } from "@/services/video.service";
import { logger } from "@/config/logger";

import { validateVideoRequestMiddleware, asyncHandler } from "@/middleware";
import { config } from "@/config";
import { ValidatedVideoRequest } from "@/middleware/validateVideoRequest";
import { ApiKeyException } from "@/errors/exceptions";

const router: Router = Router();

router.post(
  "/video/generate",
  validateVideoRequestMiddleware,
  asyncHandler(async (req: ValidatedVideoRequest, res: Response) => {
    logger.info("Video generation request received", {
      body: req.body,
    });
    const apiKey =
      (req.headers[config.apiKeyHeaderName] as string) ||
      (req.query?.key as string | undefined);

    if (!apiKey) throw new ApiKeyException("Invalid or missing API key");

    const { outputAsVideoFile } = req.validatedBody || {};

    // Build request with validated body and optional video file
    const request = {
      ...req.validatedBody!,
    };

    // Generate video
    const videoService = new VideoService(apiKey);
    const response = await videoService.generateVideo(request);

    logger.info("Video generation request completed successfully");
    if (!outputAsVideoFile) return res.json({ data: response });
    const downloadedVideoBuffer = await videoService.downloadVideo(response);

    if (downloadedVideoBuffer) {
      // Send video file
      res.setHeader("Content-Type", "video/mp4");
      res.setHeader(
        "Content-Disposition",
        'attachment; filename="generated-video.mp4"'
      );
      res.setHeader("Content-Length", downloadedVideoBuffer.length.toString());
      return res.send(downloadedVideoBuffer);
    }
  })
);

export default router;
