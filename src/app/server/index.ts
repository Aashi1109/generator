import express, { Express } from "express";
import { config, logger, NotFoundException } from "@/shared";

import { errorHandler, morganLogger } from "./middleware";
import v1Routes from "./v1";
import cors from "cors";
import helmet from "helmet";

const app: Express = express();

// cors setup to allow requests from the frontend only for now
app.use(helmet());
app.use(cors(config.corsOptions));
app.use(morganLogger);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes - v1 routes are automatically imported and mounted
app.use("/v1", v1Routes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use((req, _, next) => {
  next(new NotFoundException(`path not found: ${req.originalUrl}`));
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
app.listen(config.port, () => {
  logger.info(`Server is running on port ${config.port}`, {
    port: config.port,
    environment: config.nodeEnv,
  });
});
