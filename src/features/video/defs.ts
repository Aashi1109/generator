import { VIDEO_MODELS } from "./constant";

export interface VideoGenerationRequest {
  prompt: string;
  duration?: 4 | 6 | 8;
  resolution?: "720p" | "1080p";
  previousVideoUri?: string;
  model?: (typeof VIDEO_MODELS)[keyof typeof VIDEO_MODELS];
}
