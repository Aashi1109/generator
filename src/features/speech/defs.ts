import { GEMINI_TTS_VOICES, SPEECH_MODELS } from "./constant";

export type GeminiTTSVoiceName =
  (typeof GEMINI_TTS_VOICES)[keyof typeof GEMINI_TTS_VOICES]["name"];

export interface SpeechGenerationRequest {
  prompt: string;
  model?: (typeof SPEECH_MODELS)[keyof typeof SPEECH_MODELS];
  speakers?: {
    name: string;
    voice: GeminiTTSVoiceName;
  }[];
  voice?: GeminiTTSVoiceName;
  temperature?: number;
}

export interface GeminiTTSVoice {
  name: string;
  gender: "male" | "female";
  description: string;
}

export interface WavConversionOptions {
  numChannels: number;
  sampleRate: number;
  bitsPerSample: number;
}
