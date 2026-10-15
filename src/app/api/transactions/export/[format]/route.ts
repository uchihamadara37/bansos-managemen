import { NextResponse } from "next/server";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { withAuth } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { buildWhere, searchParamsToObject, transactionInclude } from "@/lib/transactions";
import { transactionQuerySchema } from "@/lib/validations/transaction";
import { buildExcel } from "@/lib/export/excel";
import { buildPdf } from "@/lib/export/pdf";
import type { ExportMeta, ExportRow } from "@/lib/export/types";

// export const runtime = "nodejs"; // exceljs & jspdf butuh Node runtime

const MAX_ROWS = 10_000;

export const GET = withAuth<{ format: string }>(["ADMIN", "USER"], async (req, { params }) => {
  if (params.format !== "xlsx" && params.format !== "pdf") {
    return NextResponse.json({ message: "Format harus xlsx atau pdf" }, { status: 404 });
  }

  const filters = transactionQuerySchema.parse(searchParamsToObject(req.nextUrl.searchParams));

  const trx = await prisma.transaction.findMany({
    where: buildWhere(filters),
    include: transactionInclude,
    orderBy: [{ date: "asc" }, { createdAt: "asc" }],
    take: MAX_ROWS,
  });

  const rows: ExportRow[] = trx.map((t) => ({
    date: t.date,
    type: t.type,
    category: t.category,
    description: t.description,
    amount: Number(t.amount),
    createdBy: t.createdBy.name,
  }));

  const totalIncome = rows.filter((r) => r.type === "INCOME").reduce((s, r) => s + r.amount, 0);
  const totalExpense = rows.filter((r) => r.type === "EXPENSE").reduce((s, r) => s + r.amount, 0);

  // Deskripsi filter untuk header laporan
  const fmt = (d: Date) => format(d, "dd MMM yyyy", { locale: localeId });
  const parts = [
    filters.from || filters.to
      ? `Periode: ${filters.from ? fmt(filters.from) : "awal"} - ${filters.to ? fmt(filters.to) : "sekarang"}`
      : "Periode: semua waktu",
    filters.type ? `Tipe: ${filters.type === "INCOME" ? "Pemasukan" : "Pengeluaran"}` : null,
    filters.category ? `Kategori: ${filters.category}` : null,
  ].filter(Boolean);

  const meta: ExportMeta = {
    periodLabel: parts.join(" | "),
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
  };

  const stamp = format(new Date(), "yyyyMMdd-HHmm");
  const isXlsx = params.format === "xlsx";
  const body = isXlsx ? await buildExcel(rows, meta) : buildPdf(rows, meta);

  return new NextResponse(new Uint8Array(body as ArrayBuffer), {
    headers: {
      "Content-Type": isXlsx
        ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        : "application/pdf",
      "Content-Disposition": `attachment; filename="laporan-donasi-${stamp}.${params.format}"`,
      "Cache-Control": "no-store",
    },
  });
});