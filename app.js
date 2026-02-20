import express from "express";
import cors from "cors";
import "dotenv/config";
import pinoHttp from "pino-http";
import { swaggerSpec } from "./src/config/swagger.js";
import swaggerUi from "swagger-ui-express";
import { connectDB, disconnectDB } from "./src/config/db.js";
import logger from "./src/config/logger.js";
import axios from "axios";

import uploadImageRoute from "./src/modules/image_upload/image.routes.js";
import categoryRoute from "./src/modules/category/category.routes.js";
import productRoute from "./src/modules/product/product.routes.js";

const URL = "https://e-commerce-api-mv92.onrender.com";
const INTERVAL = 60 * 15 * 1000; // 15 minutes interval

const app = express();

const pingRender = () => {
  axios
    .get(URL)
    .then((response) => {
      logger.info("Render service is alive");
    })
    .catch((error) => {
      logger.error("Failed to ping Render service", error);
    });
};

app.use("/ping", (req, res) => res.send({ message: "Service is alive" }));

setInterval(() => {
  pingRender();
}, INTERVAL);

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
app.use("/api", categoryRoute);
app.use("/api", productRoute);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

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
 * Gracefully shuts down the server and database connection.
 * @param {number} exitCode - The process exit code.
 * @returns {Promise<void>}
 */
const gracefulShutdown = async (exitCode) => {
  try {
    await disconnectDB();
  } catch (dbError) {
    logger.error(
      { err: dbError },
      "Failed to disconnect database during shutdown",
    );
  }
  process.exit(exitCode);
};

// 1. Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  logger.error({ err: reason, promise }, "Unhandled Rejection");
  if (server) {
    server.close(() => {
      gracefulShutdown(1);
    });
  } else {
    process.exit(1);
  }
});

// 2. Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  logger.fatal({ err: error }, "Uncaught Exception");
  if (server) {
    server.close(() => {
      gracefulShutdown(1);
    });
  } else {
    process.exit(1);
  }
});

// 3. Handle SIGTERM gracefully
process.on("SIGTERM", () => {
  logger.info("SIGTERM signal received: closing HTTP server");
  if (server) {
    server.close(() => {
      logger.info("HTTP server closed");
      gracefulShutdown(0);
    });
  } else {
    process.exit(0);
  }
});
// 4. Handle SIGINT gracefully
process.on("SIGINT", () => {
  if (server) {
    server.close(() => {
      gracefulShutdown(0);
    });
  }
});
