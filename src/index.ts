import app from "./app";
import { config } from "./config";
import { logger } from "./config/logger";

// Start server
app.listen(config.port, () => {
  logger.info(`Server is running on port ${config.port}`, {
    port: config.port,
    environment: config.nodeEnv,
  });
});
