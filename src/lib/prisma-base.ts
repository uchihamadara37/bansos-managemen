import { readFileSync } from "node:fs";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../generated/prisma/client";

export function createBasePrisma() {
  const url = new URL(process.env.DATABASE_URL!);
  const isLocal = url.hostname === "localhost" || url.hostname === "127.0.0.1";
  const host = url.hostname === "localhost" ? "127.0.0.1" : url.hostname;

  // CA opsional: kalau tidak diisi, Node memakai daftar sertifikat bawaannya
  const ca = process.env.DATABASE_CA_PATH
    ? readFileSync(process.env.DATABASE_CA_PATH)
    : undefined;

  const adapter = new PrismaMariaDb({
    host,
    port: Number(url.port || 3306),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.slice(1),
    connectionLimit: 5,
    connectTimeout: 10000, // koneksi ke cloud lebih lambat dari lokal
    allowPublicKeyRetrieval: true,
    ...(isLocal ? {} : { ssl: { rejectUnauthorized: true, ...(ca && { ca }) } }),
  });

  return new PrismaClient({ adapter });
}