import { endOfDay, startOfDay } from "date-fns";
import type { Prisma } from "@/generated/prisma/client";
import type { z } from "zod";
import type { transactionQuerySchema } from "./validations/transaction";

export type TransactionFilters = z.infer<typeof transactionQuerySchema>;

// Buang param kosong / "all" dari UI agar lolos validasi Zod
export function searchParamsToObject(sp: URLSearchParams) {
  const obj: Record<string, string> = {};
  sp.forEach((value, key) => {
    if (value && value !== "all") obj[key] = value;
  });
  return obj;
}

// Dipakai bersama oleh list, stats, dan export
export function buildWhere(
  f: Partial<Pick<TransactionFilters, "type" | "category" | "from" | "to">>
): Prisma.TransactionWhereInput {
  return {
    ...(f.type && { type: f.type }),
    ...(f.category && { category: f.category }),
    ...((f.from || f.to) && {
      date: {
        ...(f.from && { gte: startOfDay(f.from) }),
        ...(f.to && { lte: endOfDay(f.to) }),
      },
    }),
  };
}

export const transactionInclude = {
  createdBy: { select: { id: true, name: true } },
} satisfies Prisma.TransactionInclude;

// Decimal -> number agar aman di-JSON-kan
export function serializeTransaction<T extends { amount: unknown }>(t: T) {
  return { ...t, amount: Number(t.amount) };
}