"use client";

import { useMemo } from "react";
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useUser } from "@/components/providers/user-provider";
import { useTransactions } from "@/hooks/use-transactions";
import { formatRupiah } from "@/lib/format";
import { useUiStore } from "@/stores/ui-store";
import type { Transaction } from "@/types";

export function TransactionsTable() {
  const isAdmin = useUser().role === "ADMIN";
  const { filters, setFilters, openEdit, setDeleteTarget } = useUiStore();
  const { data, isLoading, isFetching } = useTransactions(filters);

  const columns = useMemo<ColumnDef<Transaction>[]>(() => {
    const cols: ColumnDef<Transaction>[] = [
      {
        accessorKey: "date",
        header: "Tanggal",
        cell: ({ row }) => format(new Date(row.original.date), "dd MMM yyyy", { locale: localeId }),
      },
      {
        accessorKey: "type",
        header: "Tipe",
        cell: ({ row }) =>
          row.original.type === "INCOME" ? (
            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Pemasukan</Badge>
          ) : (
            <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100">Pengeluaran</Badge>
          ),
      },
      { accessorKey: "category", header: "Kategori" },
      {
        accessorKey: "description",
        header: "Deskripsi",
        cell: ({ row }) => <span className="line-clamp-2 max-w-[320px]">{row.original.description}</span>,
      },
      {
        accessorKey: "amount",
        header: () => <div className="text-right">Nominal</div>,
        cell: ({ row }) => (
          <div
            className={`text-right font-mono font-sm ${
              row.original.type === "INCOME" ? "text-blue-700" : "text-rose-600"
            }`}
          >
            {row.original.type === "INCOME" ? "+" : "-"}
            {formatRupiah(row.original.amount)}
          </div>
        ),
      },
      { id: "by", header: "Dicatat Oleh", cell: ({ row }) => row.original.createdBy.name },
    ];

    if (isAdmin) {
      cols.push({
        id: "actions",
        header: () => <div className="text-right">Aksi</div>,
        cell: ({ row }) => (
          <div className="flex justify-end gap-1">
            <Button variant="ghost" size="icon" onClick={() => openEdit(row.original)} aria-label="Edit">
              <Pencil className="h-4 w-4 text-blue-600" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(row.original)} aria-label="Hapus">
              <Trash2 className="h-4 w-4 text-rose-600" />
            </Button>
          </div>
        ),
      });
    }
    return cols;
  }, [isAdmin, openEdit, setDeleteTarget]);

  const table = useReactTable({
    data: data?.data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true, // pagination dikerjakan server
    pageCount: data?.meta.totalPages ?? 1,
  });

  const meta = data?.meta;

  return (
    <div className="glass overflow-hidden rounded-2xl">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id} className="bg-blue-50/60 hover:bg-blue-50/60">
              {hg.headers.map((h) => (
                <TableHead key={h.id} className="font-semibold text-blue-900">
                  {flexRender(h.column.columnDef.header, h.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody className={""}>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell colSpan={columns.length}>
                  <Skeleton className="h-6 w-full" />
                </TableCell>
              </TableRow>
            ))
          ) : table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} className="hover:bg-white/60">
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-32 text-center text-slate-500">
                Belum ada transaksi yang cocok dengan filter.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {meta && (
        <div className="flex items-center justify-between border-t border-white/60 px-4 py-3 text-sm text-slate-600">
          <span>
            ({meta.total.toLocaleString("id-ID")} transaksi) <br className="block md:hidden"></br> Halaman {meta.page} dari {meta.totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="bg-white/70"
              disabled={meta.page <= 1}
              onClick={() => setFilters({ page: meta.page - 1 })}
            >
              <ChevronLeft className="h-4 w-4" /> Sebelumnya
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-white/70"
              disabled={meta.page >= meta.totalPages}
              onClick={() => setFilters({ page: meta.page + 1 })}
            >
              Berikutnya <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}