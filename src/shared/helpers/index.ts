import { Request } from "express";
import { config } from "../config";
import { UnauthorizedException } from "../errors";

export const extractApiKey = (req: Request) => {
  const apiKey =
    (req.headers[config.apiKeyHeaderName] as string) ||
    (req.query?.key as string | undefined);

  if (!apiKey) throw new UnauthorizedException("Invalid or missing API key");
  return apiKey;
};

export const getRandomUUID = () => crypto.randomUUID();
