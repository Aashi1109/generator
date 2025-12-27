import { Router, Response } from "express";
import { VideoService } from "@/services/video.service";
import { logger } from "@/config/logger";
import { asyncHandler } from "@/middleware/asyncHandler";
import { upload } from "@/middleware/upload";
import {
  validateVideoRequestMiddleware,
  ValidatedVideoRequest,
} from "@/middleware/validateVideoRequest";

const router: Router = Router();
const videoService = new VideoService();

router.post(
  "/video/generate",
  validateVideoRequestMiddleware,
  asyncHandler(async (req: ValidatedVideoRequest, res: Response) => {
    logger.info("Video generation request received", {
      body: req.body,
    });

    // Build request with validated body and optional video file
    const request = {
      ...req.validatedBody!,
    };

    // Generate video
    const { buffer, uri } = await videoService.generateVideo(request);

    logger.info("Video generation request completed successfully");

    if (uri) return res.json({ data: uri });

    if (buffer) {
      // Send video file
      res.setHeader("Content-Type", "video/mp4");
      res.setHeader(
        "Content-Disposition",
        'attachment; filename="generated-video.mp4"'
      );
      res.setHeader("Content-Length", buffer.length.toString());
      return res.send(buffer);
    }
  })
);

export default router;
