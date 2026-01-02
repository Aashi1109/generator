import { Router, Request, Response } from "express";
import { asyncHandler, validateRequestMiddleware } from "../middleware";
import {
  SpeechGenerationRequest,
  SpeechService,
  validateSpeechGenerationRequest,
} from "@/features/speech";
import { extractApiKey, logger, NotFoundException } from "@/shared";
import { GEMINI_TTS_VOICES, SPEECH_MODELS } from "@/features/speech";

const router: Router = Router();

router.post(
  "/generate",
  validateRequestMiddleware(validateSpeechGenerationRequest),
  asyncHandler(
    async (req: Request<{}, {}, SpeechGenerationRequest>, res: Response) => {
      logger.info("Speech generation request received", {
        body: req.body,
      });

      const apiKey = extractApiKey(req);

      const speechClass = new SpeechService(apiKey);
      const response = await speechClass.generate(req.body);

      if (response.buffer) {
        res.setHeader("Content-Type", "audio/wav");
        res.setHeader(
          "Content-Disposition",
          'attachment; filename="generated-audio.wav"'
        );
        res.setHeader("Content-Length", response.buffer.length.toString());
        return res.send(response.buffer);
      }

      return res.json(response);
    }
  )
);

router.get(
  "/:type/list",
  asyncHandler(async (req: Request, res: Response) => {
    const { type } = req.params;
    switch (type) {
      case "models":
        return res.json({ data: { models: Object.values(SPEECH_MODELS) } });
      case "voices":
        return res.json({ data: { voices: Object.values(GEMINI_TTS_VOICES) } });
      default:
        throw new NotFoundException(`Invalid type: ${type}`);
    }
  })
);

export default router;
