import { Router, Request, Response } from "express";
import { asyncHandler, validateRequestMiddleware } from "../middleware";
import { extractApiKey, logger } from "@/shared";
import {
  validateGenerationRequest,
  GenerationServiceManager,
} from "@/features/generation";

const router: Router = Router();

router.post(
  "/:type",
  validateGenerationRequest(validateRequestMiddleware),
  asyncHandler(async (req: Request, res: Response) => {
    logger.info("Generation request received", {
      body: req.body,
    });

    const apiKey = extractApiKey(req);

    const { type } = req.params;
    const generationService = new GenerationServiceManager(type, apiKey);
    const response = await generationService.generate(req.body);

    const headers = generationService.getResponseHeaders(response);
    res.set(headers);

    if (response?.buffer) return res.send(response.buffer);

    return res.json({ data: { ...response } });
  })
);

router.get(
  "/:type/:listType/list",
  asyncHandler(async (req: Request, res: Response) => {
    const { type, listType } = req.params;
    const generationService = new GenerationServiceManager(type, "");
    const response = await generationService.list(listType);
    return res.json({ data: { ...response } });
  })
);

router.get(
  "/:type/download",
  asyncHandler(async (req: Request, res: Response) => {
    const { type } = req.params;
    const { uri } = req.query;

    const apiKey = extractApiKey(req);
    const generationService = new GenerationServiceManager(type, apiKey);
    const buffer = await generationService.download(uri as string);
    res.set(generationService.getResponseHeaders({ buffer }));
    return res.send(buffer);
  })
);

export default router;
