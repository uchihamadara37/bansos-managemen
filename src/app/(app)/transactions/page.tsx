"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/components/providers/user-provider";
import { ExportButtons } from "@/components/transactions/export-buttons";
import { TransactionFilters } from "@/components/transactions/transaction-filters";
import { TransactionsTable } from "@/components/transactions/transactions-table";
import { TransactionFormDialog } from "@/components/transactions/transaction-form-dialog";
import { DeleteDialog } from "@/components/transactions/delete-dialog";
import { useUiStore } from "@/stores/ui-store";

export default function TransactionsPage() {
  const isAdmin = useUser().role === "ADMIN";
  const openCreate = useUiStore((s) => s.openCreate);

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Transaksi Donasi</h1>
          <p className="text-sm text-slate-500">
            {isAdmin ? "Kelola pemasukan dan pengeluaran donasi" : "Riwayat donasi yang terbuka untuk publik"}
          </p>
        </div>
        <div className="flex gap-2">
          <ExportButtons />
          {isAdmin && (
            <Button onClick={openCreate} className="bg-linear-to-r from-blue-600 to-sky-500 text-white shadow-md shadow-blue-500/30">
              <Plus className="mr-2 h-4 w-4" /> Tambah
            </Button>
          )}
        </div>
      </div>

      <TransactionFilters />
      <TransactionsTable />

      {isAdmin && (
        <>
          <TransactionFormDialog />
          <DeleteDialog />
        </>
      )}
    </>
  );
}