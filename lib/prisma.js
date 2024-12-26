import { PrismaClient } from "@prisma/client";

export const db = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = db;
}

// globalThis.prisma: This is a global variable that we use to store the PrismaClient instance. This is useful because we can reuse the same instance across multiple requests in development. In production, we don't need to do this because the server will be restarted for every request.
// db: This is the PrismaClient instance that we use to interact with the database.

