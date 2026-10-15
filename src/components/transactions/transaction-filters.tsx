"use client";

import { FilterX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCategories } from "@/hooks/use-transactions";
import { defaultFilters } from "@/lib/filters";
import { useUiStore } from "@/stores/ui-store";

export function TransactionFilters() {
  const { filters, setFilters, resetFilters } = useUiStore();
  const { data: categories = [] } = useCategories();
  const dirty =
    filters.type !== defaultFilters.type ||
    filters.category !== defaultFilters.category ||
    filters.from !== "" ||
    filters.to !== "";

  return (
    <div className="glass grid grid-cols-2 gap-3 rounded-2xl p-3 sm:flex sm:flex-wrap sm:items-end">
      {/* Jenis Transaksi */}
      <div className="min-w-0 space-y-1">
        <label className="px-0.5 text-sm font-medium text-slate-700">Jenis Transaksi</label>
        <Select value={filters.type} onValueChange={(v) => setFilters({ type: v as typeof filters.type })}>
          <SelectTrigger className="w-full bg-white/70 sm:w-40">
            <SelectValue placeholder="Tipe">
              {filters.type === "all" ? "Semua Jenis" : filters.type === "INCOME" ? "Pemasukan" : "Pengeluaran"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Tipe</SelectItem>
            <SelectItem value="INCOME">Pemasukan</SelectItem>
            <SelectItem value="EXPENSE">Pengeluaran</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Kategori */}
      <div className="min-w-0 space-y-1">
        <label className="px-0.5 text-sm font-medium text-slate-700">Kategori</label>
        <Select value={filters.category} onValueChange={(v) => setFilters({ category: v || "all" })}>
          <SelectTrigger className="w-full bg-white/70 sm:w-48">
            <SelectValue placeholder="Kategori">
              {filters.category === "all" ? "Semua Kategori" : filters.category}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Kategori</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Dari */}
      <div className="min-w-0 space-y-1">
        <label htmlFor="trx-from" className="px-0.5 text-sm font-medium text-slate-700">
          Dari
        </label>
        <Input
          id="trx-from"
          type="date"
          value={filters.from}
          onChange={(e) => setFilters({ from: e.target.value })}
          className="w-full min-w-0 bg-white/70 sm:w-40"
        />
      </div>

      {/* Sampai */}
      <div className="min-w-0 space-y-1">
        <label htmlFor="trx-to" className="px-0.5 text-sm font-medium text-slate-700">
          Sampai
        </label>
        <Input
          id="trx-to"
          type="date"
          value={filters.to}
          onChange={(e) => setFilters({ to: e.target.value })}
          className="w-full min-w-0 bg-white/70 sm:w-40"
        />
      </div>

      {/* Reset */}
      {dirty && (
        <Button
          variant="outline"
          size="sm"
          className="col-span-2 bg-white/70 sm:col-span-1 sm:border-transparent sm:bg-transparent sm:shadow-none"
          onClick={resetFilters}
        >
          <FilterX className="mr-1 h-4 w-4" /> Reset
        </Button>
      )}
    </div>
  );
}