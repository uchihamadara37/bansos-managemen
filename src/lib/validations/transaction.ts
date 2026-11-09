import { z } from "zod";

export const PROOF_ALLOWED_HOSTS = ["drive.google.com", "docs.google.com"];

// "" -> null (menghapus nilai).
// undefined tetap undefined (Prisma mengabaikannya, jadi nilai lama tidak berubah).
const blankToNull = (v: string | null | undefined) =>
  v === undefined ? undefined : v === null || v === "" ? null : v;

const proofUrlSchema = z
  .string()
  .trim()
  .max(500, "Link maksimal 500 karakter")
  .nullish()
  .transform(blankToNull)
  .superRefine((value, ctx) => {
    if (!value) return;

    let url: URL;
    try {
      url = new URL(value);
    } catch {
      ctx.addIssue({ code: "custom", message: "Link tidak valid, awali dengan https://" });
      return;
    }
    if (url.protocol !== "https:") {
      ctx.addIssue({ code: "custom", message: "Link harus diawali https://" });
      return;
    }
    if (!PROOF_ALLOWED_HOSTS.includes(url.hostname)) {
      ctx.addIssue({ code: "custom", message: "Hanya link Google Drive yang diterima" });
    }
  });

const proofNoteSchema = z
  .string()
  .trim()
  .max(500, "Keterangan maksimal 500 karakter")
  .nullish()
  .transform(blankToNull);

export const transactionSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE"], { message: "Pilih tipe transaksi" }),
  amount: z.coerce
    .number({ message: "Nominal harus berupa angka" })
    .positive("Nominal harus lebih dari 0")
    .max(999_999_999_999, "Nominal terlalu besar"),
  description: z.string().min(3, "Deskripsi minimal 3 karakter").max(500),
  category: z.string().min(2, "Kategori wajib diisi").max(100),
  date: z.coerce.date({ message: "Tanggal tidak valid" }),
  proofUrl: proofUrlSchema,
  proofNote: proofNoteSchema,
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