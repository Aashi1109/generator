import dotenv from "dotenv";

// Load environment variables
dotenv.config();

interface Config {
  // Server
  port: number;
  nodeEnv: string;

  // API Keys
  geminiApiKey: string;

  // Video Service
  maxPollingAttempts: number;
  pollingInterval: number;
}

function loadConfig(): Config {
  // Validate required environment variables
  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (!geminiApiKey) {
    throw new Error("GEMINI_API_KEY environment variable is required");
  }

  return {
    // Server
    port: parseInt(process.env.PORT || "3000", 10),
    nodeEnv: process.env.NODE_ENV || "development",

    // API Keys
    geminiApiKey,

    // Video Service
    maxPollingAttempts: parseInt(
      process.env.MAX_POLLING_ATTEMPTS || "60",
      10
    ),
    pollingInterval: parseInt(
      process.env.POLLING_INTERVAL || "10000",
      10
    ),
  };
}

export const config = loadConfig();

