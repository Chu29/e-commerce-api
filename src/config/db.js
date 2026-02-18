import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import pkg from "@prisma/client";
import { Pool } from "pg";
import logger from "./logger.js";

const { PrismaClient } = pkg;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Create Prisma adapter
const adapter = new PrismaPg(pool);

// Initialize Prisma Client with adapter
const prisma = new PrismaClient({
  adapter,
  log:
    process.env.NODE_ENV === "development"
      ? ["query", "info", "warn", "error"]
      : ["error"],
});

/**
 * Connects to the PostgreSQL database via Prisma.
 * Exits the process with code 1 if the connection fails.
 * @returns {Promise<void>}
 */
const connectDB = async () => {
  try {
    await prisma.$connect();
    logger.info("Database connected successfully");
  } catch (error) {
    logger.error({ err: error }, "Database connection failed");
    process.exit(1);
  }
};

/**
 * Disconnects from the PostgreSQL database.
 * @returns {Promise<void>}
 * @throws {Error} If disconnection fails.
 */
const disconnectDB = async () => {
  try {
    await prisma.$disconnect();
    await pool.end();
    logger.info("Database disconnected successfully");
  } catch (error) {
    logger.error({ err: error }, "Database disconnection failed");
    throw error;
  }
};

export { prisma, connectDB, disconnectDB };
