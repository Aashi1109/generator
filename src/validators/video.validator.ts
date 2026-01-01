import Ajv, { ValidateFunction } from "ajv";
import { ValidationException } from "@/errors/exceptions";
import { VIDEO_MODELS } from "@/constants";

const ajv = new Ajv({ allErrors: true });

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

const validate: ValidateFunction = ajv.compile(videoGenerationSchema);

export interface VideoGenerationRequest {
  prompt: string;
  duration?: 4 | 6 | 8;
  resolution?: "720p" | "1080p";
  withExtension?: boolean;
  previousVideoUri?: string;
  model?: (typeof VIDEO_MODELS)[keyof typeof VIDEO_MODELS];
}

export function validateVideoRequest(data: any): VideoGenerationRequest {
  const valid = validate(data);

  if (!valid) {
    const errors = validate.errors?.map((err) => ({
      field: err.instancePath || err.params?.missingProperty || "root",
      message: err.message,
      params: err.params,
    }));

    throw new ValidationException("Invalid request payload", errors);
  }

  return data as VideoGenerationRequest;
}
