import dotenv from "dotenv";

// Load environment variables
dotenv.config();

interface Config {
  // Server
  port: number;
  nodeEnv: string;

  // Video Service
  maxPollingAttempts: number;
  pollingInterval: number;
  apiKeyHeaderName: string;
}

function loadConfig(): Config {
  return {
    // Server
    port: parseInt(process.env.PORT || "3000", 10),
    nodeEnv: process.env.NODE_ENV || "development",

    // Video Service
    maxPollingAttempts: parseInt(process.env.MAX_POLLING_ATTEMPTS || "60", 10),
    pollingInterval: parseInt(process.env.POLLING_INTERVAL || "10000", 10),
    apiKeyHeaderName: process.env.API_KEY_HEADER_NAME || "",
  };
}

export const config = loadConfig();
