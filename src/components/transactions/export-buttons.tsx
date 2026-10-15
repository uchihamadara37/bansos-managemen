"use client";

import { FileSpreadsheet, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { filtersToQuery } from "@/lib/filters";
import { useUiStore } from "@/stores/ui-store";

export function ExportButtons() {
  const filters = useUiStore((s) => s.filters);

  // Browser mengirim cookie otomatis; Content-Disposition memicu download
  const download = (fmt: "xlsx" | "pdf") => {
    window.location.assign(`/api/transactions/export/${fmt}?${filtersToQuery(filters, false)}`);
  };

  return (
    <>
      <Button variant="outline" className="bg-white/70" onClick={() => download("xlsx")}>
        <FileSpreadsheet className="mr-2 h-4 w-4 text-emerald-600" /> Excel
      </Button>
      <Button variant="outline" className="bg-white/70" onClick={() => download("pdf")}>
        <FileText className="mr-2 h-4 w-4 text-rose-600" /> PDF
      </Button>
    </>
  );
}