import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

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
    console.log("Database connected Successfully");
  } catch (error) {
    console.error(`Database connection failed: ${error.message}`);
    process.exit(1);
  }
};

//handle db disconnect
const disconnectDB = async () => {
  try {
    await prisma.$disconnect();
    console.log("Database disconnected Successfully");
  } catch (error) {
    console.error(`Database disconnection failed: ${error.message}`);
    process.exit(1);
  }
};

export { prisma, connectDB, disconnectDB };
