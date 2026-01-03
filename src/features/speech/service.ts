import { GoogleGenAI } from "@google/genai";
import { SpeechGenerationRequest, WavConversionOptions } from "./defs";
import { GEMINI_TTS_VOICES, SPEECH_MODELS } from "./constant";
import { writeFile } from "node:fs/promises";
import mime from "mime";
import { FailureException, logger, ValidationException } from "@/shared";
import * as os from "os";
import * as path from "node:path";
import BaseGenerationService from "../base/BaseClass";

export default class SpeechService implements BaseGenerationService {
  private readonly client: GoogleGenAI;

  constructor(apiKey: string) {
    this.client = new GoogleGenAI({ apiKey });
  }

  async generate({
    prompt,
    model = SPEECH_MODELS.GEMINI_2_5_FLASH_PREVIEW_TTS,
    speakers,
    voice = GEMINI_TTS_VOICES.PUCK.name,
  }: SpeechGenerationRequest): Promise<{ buffer?: Buffer; uri?: string }> {
    let speechConfig: Record<string, any>;

    if (speakers?.length) {
      speechConfig = {
        multiSpeakerVoiceConfig: {
          speakerVoiceConfigs: speakers.map((s) => ({
            speaker: s.name,
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: s.voice,
              },
            },
          })),
        },
      };
    } else {
      speechConfig = {
        voiceConfig: {
          prebuiltVoiceConfig: {
            voiceName: voice,
          },
        },
      };
    }

    const config = {
      temperature: 1,
      responseModalities: ["audio"],
      speechConfig,
    };
    const contents = [
      {
        role: "user",
        parts: [{ text: prompt }],
      },
    ];

    const response = await this.client.models.generateContent({
      model,
      config,
      contents,
    });
    const audioContent =
      response?.candidates?.[0]?.content?.parts?.[0]?.inlineData;

    if (!audioContent)
      throw new FailureException(
        `No audio content found in response for ${model}`
      );

    let fileExtension = mime.getExtension(audioContent.mimeType || "");
    let buffer = Buffer.from(audioContent.data || "", "base64");
    if (!fileExtension) {
      fileExtension = "wav";
      buffer = this.convertToWav(
        audioContent.data || "",
        audioContent.mimeType || ""
      );
    }
    logger.info("Speech generation successful", {});

    return { buffer };
    // const fileName = getRandomUUID();
    // await this.saveBinaryFile(`${fileName}.${fileExtension}`, buffer);
    // logger.debug("Speech generation file saved");
    logger.info("Speech generation response", {
      response,
    });
  }

  async download(uri: string): Promise<Buffer> {
    throw new ValidationException(`Download not supported for speech service`);
  }

  async list(listType: string): Promise<Record<string, any> | any[]> {
    switch (listType) {
      case "models":
        return { models: Object.values(SPEECH_MODELS) };
      case "voices":
        return { voices: Object.values(GEMINI_TTS_VOICES) };
      default:
        throw new ValidationException(`Invalid list type: ${listType}`);
    }
  }

  async saveBinaryFile(fileName: string, content: Buffer) {
    const filePath = path.join(os.tmpdir(), fileName);
    return await writeFile(fileName, content, "utf8");
  }

  convertToWav(rawData: string, mimeType: string) {
    const options = this.parseMimeType(mimeType);
    const wavHeader = this.createWavHeader(rawData.length, options);
    const buffer = Buffer.from(rawData, "base64");

    return Buffer.concat([wavHeader, buffer]);
  }

  parseMimeType(mimeType: string) {
    const [fileType, ...params] = mimeType.split(";").map((s) => s.trim());
    const [_, format] = fileType.split("/");

    const options: Partial<WavConversionOptions> = {
      numChannels: 1,
    };

    if (format && format.startsWith("L")) {
      const bits = parseInt(format.slice(1), 10);
      if (!isNaN(bits)) {
        options.bitsPerSample = bits;
      }
    }

    for (const param of params) {
      const [key, value] = param.split("=").map((s) => s.trim());
      if (key === "rate") {
        options.sampleRate = parseInt(value, 10);
      }
    }

    return options as WavConversionOptions;
  }

  createWavHeader(dataLength: number, options: WavConversionOptions) {
    const { numChannels, sampleRate, bitsPerSample } = options;

    // http://soundfile.sapp.org/doc/WaveFormat

    const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
    const blockAlign = (numChannels * bitsPerSample) / 8;
    const buffer = Buffer.alloc(44);

    buffer.write("RIFF", 0); // ChunkID
    buffer.writeUInt32LE(36 + dataLength, 4); // ChunkSize
    buffer.write("WAVE", 8); // Format
    buffer.write("fmt ", 12); // Subchunk1ID
    buffer.writeUInt32LE(16, 16); // Subchunk1Size (PCM)
    buffer.writeUInt16LE(1, 20); // AudioFormat (1 = PCM)
    buffer.writeUInt16LE(numChannels, 22); // NumChannels
    buffer.writeUInt32LE(sampleRate, 24); // SampleRate
    buffer.writeUInt32LE(byteRate, 28); // ByteRate
    buffer.writeUInt16LE(blockAlign, 32); // BlockAlign
    buffer.writeUInt16LE(bitsPerSample, 34); // BitsPerSample
    buffer.write("data", 36); // Subchunk2ID
    buffer.writeUInt32LE(dataLength, 40); // Subchunk2Size

    return buffer;
  }
}
