import express from "express";
import "dotenv/config";
import pinoHttp from "pino-http";
import { connectDB, disconnectDB, prisma } from "./src/config/db.js";
import logger from "./src/config/logger.js";

const app = express();

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});

// Request logging middleware
app.use(pinoHttp({ logger }));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
connectDB();

// Health check route
app.get("/", (req, res) => {
  res.json({ message: "E-Commerce API is running" });
});

/**
 * Let's handle some common edge cases that may occur and cause the application to crash or behave unexpectedly.
 */

// 1. Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  logger.error({ err: reason, promise }, "Unhandled Rejection");
  server.close(async () => {
    await disconnectDB();
    process.exit(1);
  });
});

// 2. Handle uncaught exceptions
process.on("uncaughtException", async (error) => {
  logger.fatal({ err: error }, "Uncaught Exception");
  server.close(async () => {
    await disconnectDB();
    process.exit(1);
  });
});

// 3. Handle SIGTERM gracefully
process.on("SIGTERM", () => {
  logger.info("SIGTERM signal received: closing HTTP server");
  server.close(async () => {
    logger.info("HTTP server closed");
    server.close(async () => {
      await disconnectDB();
      process.exit(0);
    });
  });
});
