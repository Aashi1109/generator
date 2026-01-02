import { GEMINI_TTS_VOICES, SPEECH_MODELS } from "./constant";
import { SpeechGenerationRequest } from "./defs";
import { validateAjvSchema } from "@/shared";

const speechGenerationSchema = {
  type: "object",
  properties: {
    prompt: {
      type: "string",
      minLength: 1,
      maxLength: 1024,
    },
    speakers: {
      type: ["array", "null"],
      items: {
        type: "object",
        properties: {
          name: {
            type: "string",
          },
          voice: {
            type: "string",
            enum: Object.values(GEMINI_TTS_VOICES).map((voice) => voice.name),
          },
        },
        required: ["name", "voice"],
      },
      additionalProperties: false,
      minItems: 1,
    },
    model: {
      type: ["string", "null"],
      enum: Object.values(SPEECH_MODELS),
    },
    voice: {
      type: "string",
      enum: Object.values(GEMINI_TTS_VOICES).map((voice) => voice.name),
    },
    temperature: {
      type: "number",
      minimum: 0,
      maximum: 2,
    },
  },
  if: {
    properties: {
      speakers: {
        type: "array",
        minItems: 1,
      },
    },
    required: ["speakers"],
  },
  then: {
    properties: {
      voice: {
        const: null,
      },
    },
  },
  required: ["prompt"],
  additionalProperties: false,
};

export const validateSpeechGenerationRequest = (
  data: SpeechGenerationRequest
) => validateAjvSchema<SpeechGenerationRequest>(speechGenerationSchema, data);
