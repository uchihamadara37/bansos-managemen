import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { formatRupiah } from "../format";
import type { ExportMeta, ExportRow } from "./types";

const PROOF_COL = 7; // indeks kolom "Bukti" (mulai dari 0)
const LINK_BLUE: [number, number, number] = [37, 99, 235];

const proofText = (r: ExportRow) =>
  [r.proofUrl ? "Lihat bukti" : null, r.proofNote].filter(Boolean).join("\n") || "-";

export function buildPdf(rows: ExportRow[], meta: ExportMeta): ArrayBuffer {
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });

  doc.setFontSize(18);
  doc.setTextColor(29, 78, 216);
  doc.text("Laporan Transaksi Donasi", 40, 44);

  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(meta.periodLabel, 40, 62);
  doc.text(`Dicetak: ${format(new Date(), "dd/MM/yyyy HH:mm")}`, 40, 76);

  const footLabel = (text: string) => ({
    content: text,
    colSpan: 5,
    styles: { halign: "right" as const },
  });

  autoTable(doc, {
    startY: 92,
    head: [["No", "Tanggal", "Tipe", "Kategori", "Deskripsi", "Nominal", "Dicatat Oleh", "Bukti"]],
    body: rows.map((r, i) => [
      i + 1,
      format(r.date, "dd/MM/yyyy"),
      r.type === "INCOME" ? "Pemasukan" : "Pengeluaran",
      r.category,
      r.description,
      formatRupiah(r.amount),
      r.createdBy,
      proofText(r),
    ]),
    foot: [
      [footLabel("Total Pemasukan"), formatRupiah(meta.totalIncome), "", ""],
      [footLabel("Total Pengeluaran"), formatRupiah(meta.totalExpense), "", ""],
      [footLabel("Saldo Bersih"), formatRupiah(meta.balance), "", ""],
    ],
    showFoot: "lastPage",
    styles: { fontSize: 9, cellPadding: 5 },
    headStyles: { fillColor: [29, 78, 216], textColor: 255 },
    footStyles: { fillColor: [219, 234, 254], textColor: [30, 58, 138], fontStyle: "bold" },
    alternateRowStyles: { fillColor: [239, 246, 255] },
    columnStyles: {
      0: { cellWidth: 30 },
      5: { halign: "right", cellWidth: 90 },
      [PROOF_COL]: { cellWidth: 110 },
    },
    margin: { left: 40, right: 40 },

    // Warna biru untuk sel yang punya link
    didParseCell: (data) => {
      if (data.section === "body" && data.column.index === PROOF_COL && rows[data.row.index]?.proofUrl) {
        data.cell.styles.textColor = LINK_BLUE;
      }
    },
    // Jadikan seluruh sel bisa diklik
    didDrawCell: (data) => {
      if (data.section !== "body" || data.column.index !== PROOF_COL) return;
      const url = rows[data.row.index]?.proofUrl;
      if (url) doc.link(data.cell.x, data.cell.y, data.cell.width, data.cell.height, { url });
    },
  });

  // Nomor halaman
  const pages = doc.getNumberOfPages();
  const { width, height } = doc.internal.pageSize;
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.text(`Halaman ${i} dari ${pages}`, width - 40, height - 20, { align: "right" });
  }

  return doc.output("arraybuffer");
}