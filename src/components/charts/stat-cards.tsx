import { Receipt, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRupiah } from "@/lib/format";
import type { Stats } from "@/types";

export function StatCards({ summary }: { summary?: Stats["summary"] }) {
  const items = [
    { label: "Total Pemasukan", value: summary && formatRupiah(summary.totalIncome), icon: TrendingUp, tone: "bg-blue-100 text-blue-600" },
    { label: "Total Pengeluaran", value: summary && formatRupiah(summary.totalExpense), icon: TrendingDown, tone: "bg-rose-100 text-rose-600" },
    { label: "Saldo Bersih", value: summary && formatRupiah(summary.balance), icon: Wallet, tone: "bg-sky-100 text-sky-600" },
    { label: "Jumlah Transaksi", value: summary && summary.transactionCount.toLocaleString("id-ID"), icon: Receipt, tone: "bg-indigo-100 text-indigo-600" },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map(({ label, value, icon: Icon, tone }) => (
        <div key={label} className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">{label}</p>
            <span className={`grid h-9 w-9 place-items-center rounded-xl ${tone}`}>
              <Icon className="h-4 w-4" />
            </span>
          </div>
          {value ? (
            <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900">{value}</p>
          ) : (
            <Skeleton className="mt-3 h-8 w-40" />
          )}
        </div>
      ))}
    </div>
  );
}