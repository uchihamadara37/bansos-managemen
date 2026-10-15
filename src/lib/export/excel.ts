import ExcelJS from "exceljs";
import type { ExportMeta, ExportRow } from "./types";

const RUPIAH_FMT = '"Rp" #,##0';
const BLUE = "FF1D4ED8";

export async function buildExcel(rows: ExportRow[], meta: ExportMeta) {
  const wb = new ExcelJS.Workbook();
  wb.creator = "Sistem Transparansi Donasi";
  wb.created = new Date();

  const ws = wb.addWorksheet("Transaksi", { views: [{ state: "frozen", ySplit: 4 }] });

  // Lebar kolom
  [6, 14, 14, 20, 50, 20, 20].forEach((w, i) => (ws.getColumn(i + 1).width = w));

  // Judul
  ws.mergeCells("A1:G1");
  ws.getCell("A1").value = "Laporan Transaksi Donasi";
  ws.getCell("A1").font = { size: 16, bold: true, color: { argb: BLUE } };
  ws.mergeCells("A2:G2");
  ws.getCell("A2").value = meta.periodLabel;
  ws.getCell("A2").font = { italic: true, color: { argb: "FF64748B" } };

  // Header tabel (baris 4)
  const header = ws.getRow(4);
  header.values = ["No", "Tanggal", "Tipe", "Kategori", "Deskripsi", "Nominal", "Dicatat Oleh"];
  header.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: BLUE } };
    cell.alignment = { vertical: "middle", horizontal: "center" };
  });
  header.height = 22;

  // Data
  rows.forEach((r, i) => {
    const row = ws.addRow([
      i + 1,
      r.date,
      r.type === "INCOME" ? "Pemasukan" : "Pengeluaran",
      r.category,
      r.description,
      r.amount,
      r.createdBy,
    ]);
    row.getCell(2).numFmt = "dd/mm/yyyy";
    row.getCell(6).numFmt = RUPIAH_FMT;
    row.getCell(6).font = {
      color: { argb: r.type === "INCOME" ? "FF15803D" : "FFB91C1C" },
    };
    row.getCell(5).alignment = { wrapText: true, vertical: "top" };
    if (i % 2 === 1) {
      row.eachCell((c) => {
        c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFEFF6FF" } };
      });
    }
  });

  // Ringkasan
  ws.addRow([]);
  const summary: [string, number][] = [
    ["Total Pemasukan", meta.totalIncome],
    ["Total Pengeluaran", meta.totalExpense],
    ["Saldo Bersih", meta.balance],
  ];
  for (const [label, value] of summary) {
    const row = ws.addRow([]);
    row.getCell(5).value = label;
    row.getCell(5).font = { bold: true };
    row.getCell(5).alignment = { horizontal: "right" };
    row.getCell(6).value = value;
    row.getCell(6).numFmt = RUPIAH_FMT;
    row.getCell(6).font = { bold: true };
  }

  return wb.xlsx.writeBuffer();
}