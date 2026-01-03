import SpeechService from "../speech/service";
import VideoService from "../video/service";

export default class GenerationServiceManager {
  private readonly type: string;
  private readonly service;
  constructor(type: string, apiKey: string) {
    this.type = type;
    this.service = getService(type, apiKey);
  }

  async generate(payload: any) {
    return this.service.generate(payload);
  }

  async download(uri: string) {
    return this.service.download(uri);
  }

  async list(listType: string) {
    return this.service.list(listType);
  }

  getResponseHeaders(response: { buffer?: Buffer; uri?: string }) {
    if (response?.buffer) {
      return {
        "Content-Type": this.type === "speech" ? "audio/wav" : "video/mp4",
        "Content-Disposition": `attachment; filename="generated-${this.type}.${
          this.type === "speech" ? "wav" : "mp4"
        }`,
        "Content-Length": response.buffer.length.toString(),
      };
    }
    return {
      "Content-Type": "application/json",
    };
  }
}

function getService(type: string, apiKey: string) {
  switch (type) {
    case "speech":
      return new SpeechService(apiKey);
    case "video":
      return new VideoService(apiKey);
    default:
      throw new Error(`Invalid type: ${type}`);
  }
}
