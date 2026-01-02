import { Router, Response, Request } from "express";

import {
  asyncHandler,
  validateRequestMiddleware,
} from "@/app/server/middleware";
import {
  config,
  extractApiKey,
  logger,
  UnauthorizedException,
  ValidationException,
} from "@/shared";
import {
  validateVideoGenerationRequest,
  VIDEO_MODELS,
  VideoGenerationRequest,
  VideoService,
} from "@/features/video";

const router: Router = Router();

router.post(
  "/generate",
  validateRequestMiddleware(validateVideoGenerationRequest),
  asyncHandler(
    async (req: Request<{}, {}, VideoGenerationRequest>, res: Response) => {
      logger.info("Video generation request received", {
        body: req.body,
      });

      // Build request with validated body and optional video file
      const request = { ...req.body };
      const apiKey = extractApiKey(req);

      // Generate video
      const videoService = new VideoService(apiKey);
      const response = await videoService.generateVideo(request);

      logger.info("Video generation request completed successfully", {
        response,
      });
      return res.json({ data: response });
    }
  )
);

router.get(
  "/models",
  asyncHandler(async (_, res: Response) => {
    return res.json({ data: Object.values(VIDEO_MODELS) });
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
    return res.send(buffer);
  })
);

export default router;
