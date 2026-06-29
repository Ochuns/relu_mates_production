import { PrismaClient } from "@prisma/client";
import path from "path";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// SQLiteのパスをCWD基準の絶対パスで指定し、実行環境によるパス解決の差異を回避する
const dbUrl = process.env.DATABASE_URL?.startsWith("file:./")
  ? `file:${path.resolve(process.cwd(), process.env.DATABASE_URL.slice(5))}`
  : process.env.DATABASE_URL;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    datasources: { db: { url: dbUrl } },
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
