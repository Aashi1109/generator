import dotenv from "dotenv";
import cors from "cors";

dotenv.config({ path: ".env.local" });

interface Config {
  // Server
  port: number;
  nodeEnv: string;

  // Video Service
  maxPollingAttempts: number;
  pollingInterval: number;
  apiKeyHeaderName: string;
  corsOptions: cors.CorsOptions;
  isDev: boolean;
}

function loadConfig(): Config {
  return {
    // Server
    port: parseInt(process.env.PORT || "3000", 10),
    nodeEnv: process.env.NODE_ENV || "development",
    isDev: process.env.NODE_ENV === "development",

    // Video Service
    maxPollingAttempts: parseInt(process.env.MAX_POLLING_ATTEMPTS || "60", 10),
    pollingInterval: parseInt(process.env.POLLING_INTERVAL || "10000", 10),
    apiKeyHeaderName: process.env.API_KEY_HEADER_NAME || "",
    corsOptions: {
      origin: process.env.CORS_ORIGIN || "*",
      methods: process.env.CORS_METHODS || "GET,POST,PUT,DELETE,OPTIONS",
      allowedHeaders:
        process.env.CORS_ALLOWED_HEADERS || "Content-Type,Authorization",
    },
  };
}

export const config = loadConfig();
