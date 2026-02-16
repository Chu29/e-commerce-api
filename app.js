import express from "express";
import cors from "cors";
import "dotenv/config";
import pinoHttp from "pino-http";
import { connectDB, disconnectDB } from "./src/config/db.js";
import logger from "./src/config/logger.js";

import uploadImageRoute from "./src/modules/image_upload/image.routes.js";
import createCategoryRoute from "./src/modules/category/category.routes.js";

const app = express();

// setup cors
app.use(cors());

// Request logging middleware
app.use(pinoHttp({ logger }));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get("/", (req, res) => {
  res.json({ message: "E-Commerce API is running" });
});

// routes
app.use("/api", uploadImageRoute);
app.use("/api", createCategoryRoute);

// Initialize server
let server;

const startServer = async () => {
  try {
    // Connect to database first
    await connectDB();

    // Start server only after database is connected
    const PORT = process.env.PORT || 3000;
    server = app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    logger.fatal({ err: error }, "Failed to start server");
    process.exit(1);
  }
};

// Start the server
startServer();

/**
 * Let's handle some common edge cases that may occur and cause the application to crash or behave unexpectedly.
 */

// 1. Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  logger.error({ err: reason, promise }, "Unhandled Rejection");
  if (server) {
    server.close(async () => {
      try {
        await disconnectDB();
      } catch (dbError) {
        logger.error(
          { err: dbError },
          "Failed to disconnect database during shutdown",
        );
      }
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

// 2. Handle uncaught exceptions
process.on("uncaughtException", async (error) => {
  logger.fatal({ err: error }, "Uncaught Exception");
  if (server) {
    server.close(async () => {
      try {
        await disconnectDB();
      } catch (dbError) {
        logger.error(
          { err: dbError },
          "Failed to disconnect database during shutdown",
        );
      }
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

// 3. Handle SIGTERM gracefully
process.on("SIGTERM", () => {
  logger.info("SIGTERM signal received: closing HTTP server");
  if (server) {
    server.close(async () => {
      logger.info("HTTP server closed");
      try {
        await disconnectDB();
      } catch (dbError) {
        logger.error(
          { err: dbError },
          "Failed to disconnect database during shutdown",
        );
      }
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});
