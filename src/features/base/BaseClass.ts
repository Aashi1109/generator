export default interface BaseGenerationService {
  generate(payload: any): Promise<{ buffer?: Buffer; uri?: string }>;
  download(uri: string): Promise<Buffer>;
  list(listType: string): Record<string, any> | any[];
}
