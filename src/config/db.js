import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import logger from "./logger.js";

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

// handle db connection
const connectDB = async () => {
  try {
    await prisma.$connect();
    logger.info("Database connected successfully");
  } catch (error) {
    logger.error({ err: error }, "Database connection failed");
    process.exit(1);
  }
};

//handle db disconnect
const disconnectDB = async () => {
  try {
    await prisma.$disconnect();
    logger.info("Database disconnected successfully");
  } catch (error) {
    logger.error({ err: error }, "Database disconnection failed");
    throw error;
  }
};

export { prisma, connectDB, disconnectDB };
