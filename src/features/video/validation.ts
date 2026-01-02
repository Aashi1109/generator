import { validateAjvSchema } from "@/shared";
import { VideoGenerationRequest } from "./defs";
import { VIDEO_MODELS } from "./constant";

const videoGenerationSchema = {
  type: "object",
  properties: {
    prompt: {
      type: "string",
      minLength: 1,
      maxLength: 1024,
    },
    duration: {
      type: "number",
      enum: [4, 6, 8],
    },
    resolution: {
      type: "string",
      enum: ["720p", "1080p"],
    },
    withExtension: {
      type: "boolean",
    },
    previousVideoUri: {
      type: "string",
    },
    model: {
      type: "string",
      enum: Object.values(VIDEO_MODELS),
    },
    outputAsVideoFile: {
      type: "boolean",
    },
  },
  required: ["prompt"],
  additionalProperties: false,
  if: {
    anyOf: [
      {
        properties: {
          withExtension: {
            type: "boolean",
            const: true,
          },
        },
        required: ["withExtension"],
      },
      {
        properties: {
          previousVideoUri: {
            type: "string",
          },
        },
        required: ["previousVideoUri"],
      },
    ],
  },
  then: {
    properties: {
      resolution: {
        type: "string",
        const: "720p",
      },
    },
  },
};

export const validateVideoGenerationRequest = (data: VideoGenerationRequest) =>
  validateAjvSchema<VideoGenerationRequest>(videoGenerationSchema, data);
