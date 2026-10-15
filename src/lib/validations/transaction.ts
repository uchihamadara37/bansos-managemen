import { z } from "zod";

export const transactionSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE"], { message: "Pilih tipe transaksi" }),
  amount: z.coerce
    .number({ message: "Nominal harus berupa angka" })
    .positive("Nominal harus lebih dari 0")
    .max(999_999_999_999, "Nominal terlalu besar"),
  description: z.string().min(3, "Deskripsi minimal 3 karakter").max(500),
  category: z.string().min(2, "Kategori wajib diisi").max(100),
  date: z.coerce.date({ message: "Tanggal tidak valid" }),
});

export type TransactionInput = z.infer<typeof transactionSchema>;

// Query string untuk filter + pagination
export const transactionQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  type: z.enum(["INCOME", "EXPENSE"]).optional(),
  category: z.string().optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});