import { GoogleGenAI } from "@google/genai";
import { logger } from "@/config/logger";
import { config } from "@/config";
import {
  VideoGenerationException,
  OperationTimeoutException,
  ApiKeyException,
} from "@/errors/exceptions";
import { VideoGenerationRequest } from "@/validators/video.validator";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { VIDEO_MODELS } from "@/constants";

export class VideoService {
  private client: GoogleGenAI;
  private readonly maxPollingAttempts: number;
  private readonly pollingInterval: number;

  constructor(apiKey: string) {
    this.maxPollingAttempts = config.maxPollingAttempts;
    this.pollingInterval = config.pollingInterval;

    this.client = new GoogleGenAI({ apiKey });
  }

  private async pollOperation(operation: any): Promise<any> {
    let polledOperation = operation;
    let attempts = 0;

    while (!polledOperation.done && attempts < this.maxPollingAttempts) {
      await new Promise((resolve) => setTimeout(resolve, this.pollingInterval));
      attempts++;

      try {
        polledOperation = await this.client.operations.getVideosOperation({
          operation: polledOperation,
        });

        logger.debug("Polling operation status", {
          attempt: attempts,
          done: polledOperation.done,
        });
      } catch (error: any) {
        logger.error("Error polling operation", { error: error.message });
        throw new VideoGenerationException(
          "Failed to check operation status",
          error
        );
      }
    }

    if (!polledOperation.done) {
      throw new OperationTimeoutException(
        `Video generation timed out after ${attempts * 10} seconds`
      );
    }

    // Check for operation errors
    if (polledOperation.error) {
      logger.error("Operation completed with error", {
        error: polledOperation.error,
      });
      const errorMessage =
        typeof polledOperation.error === "string"
          ? polledOperation.error
          : (polledOperation.error as any)?.message ||
            "Video generation failed";
      throw new VideoGenerationException(errorMessage);
    }

    return polledOperation;
  }

  async downloadVideo(videoFile: any): Promise<Buffer> {
    const tempFilePath = path.join(os.tmpdir(), `video-${Date.now()}.mp4`);

    try {
      await this.client.files.download({
        file: videoFile,
        downloadPath: tempFilePath,
      });

      const videoBuffer = fs.readFileSync(tempFilePath);

      logger.info("Video downloaded successfully", {
        size: videoBuffer.length,
      });

      // Clean up temporary file
      try {
        fs.unlinkSync(tempFilePath);
      } catch (unlinkError) {
        logger.warn("Failed to delete temporary file", {
          path: tempFilePath,
          error: unlinkError,
        });
      }

      return videoBuffer;
    } catch (error: any) {
      // Clean up temporary file on error
      try {
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
        }
      } catch (unlinkError) {
        // Ignore cleanup errors
      }

      logger.error("Error downloading video", { error: error.message });
      throw new VideoGenerationException(
        "Failed to download generated video",
        error
      );
    }
  }

  async generateVideo(
    request: VideoGenerationRequest
  ): Promise<{ uri: string }> {
    const {
      prompt,
      previousVideoUri,
      model = VIDEO_MODELS.VEO_3_1_FAST_GENERATE_PREVIEW,
      duration = 8,
      resolution = "720p",
    } = request;

    logger.info("Starting video generation", {
      prompt: prompt.substring(0, 100),
    });

    try {
      const operation = await this.client.models.generateVideos({
        model,
        prompt,
        config: {
          aspectRatio: "9:16",
          resolution: resolution,
          numberOfVideos: 1,
          durationSeconds: duration,
        },
        ...(previousVideoUri ? { video: { uri: previousVideoUri } } : {}),
      });

      logger.info("Video generation operation started", {
        operationName: operation.name,
      });

      const startTime = performance.now();
      // Poll for operation completion
      const polledOperation = await this.pollOperation(operation);
      const endTime = performance.now();
      const generationDuration = endTime - startTime;
      logger.info("Video generation operation completed", {
        duration: generationDuration,
      });

      // Get the generated video
      if (!polledOperation.response?.generatedVideos?.[0]?.video)
        throw new VideoGenerationException("No video generated in response");

      const generatedVideoFile =
        polledOperation.response.generatedVideos[0].video;

      return generatedVideoFile;
    } catch (error: any) {
      if (
        error instanceof VideoGenerationException ||
        error instanceof OperationTimeoutException ||
        error instanceof ApiKeyException
      ) {
        throw error;
      }

      logger.error("Unexpected error during video generation", {
        error: error.message,
        stack: error.stack,
      });

      throw new VideoGenerationException(
        error.message || "An unexpected error occurred during video generation",
        error
      );
    }
  }
}
