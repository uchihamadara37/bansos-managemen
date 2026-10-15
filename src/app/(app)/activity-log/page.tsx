"use client";

import { useState } from "react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { ChevronLeft, ChevronRight, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useUser } from "@/components/providers/user-provider";
import { useActivityLogs } from "@/hooks/use-activity-logs";
import type { ActivityLogItem } from "@/types";

const ACTION_STYLE = {
  CREATE: { label: "Tambah", cls: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" },
  UPDATE: { label: "Ubah", cls: "bg-amber-100 text-amber-700 hover:bg-amber-100" },
  DELETE: { label: "Hapus", cls: "bg-rose-100 text-rose-700 hover:bg-rose-100" },
} as const;

const FIELD_LABEL: Record<string, string> = {
  type: "Tipe",
  amount: "Nominal",
  category: "Kategori",
  description: "Deskripsi",
  date: "Tanggal",
};

function Changes({ log }: { log: ActivityLogItem }) {
  const { before, after } = log.metadata ?? {};
  if (log.action !== "UPDATE" || !before || !after) return null;

  const changed = Object.keys(FIELD_LABEL).filter((k) => String(before[k]) !== String(after[k]));
  if (!changed.length) return null;

  return (
    <details className="mt-1 text-xs">
      <summary className="cursor-pointer text-blue-600">Lihat perubahan</summary>
      <ul className="mt-1 space-y-0.5 rounded-md bg-blue-50 p-2">
        {changed.map((k) => (
          <li key={k}>
            <span className="font-medium">{FIELD_LABEL[k]}:</span>{" "}
            <span className="text-rose-600 line-through">{String(before[k])}</span> →{" "}
            <span className="text-blue-700">{String(after[k])}</span>
          </li>
        ))}
      </ul>
    </details>
  );
}

export default function ActivityLogPage() {
  const isAdmin = useUser().role === "ADMIN";
  const [page, setPage] = useState(1);
  const [action, setAction] = useState<string|null>("all");
  const { data, isLoading, isFetching } = useActivityLogs(page, action!);
  const meta = data?.meta;

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
            <ShieldCheck className="h-6 w-6 text-blue-600" /> Log Aktivitas
          </h1>
          <p className="text-sm text-slate-500">Jejak audit setiap perubahan yang dilakukan admin</p>
        </div>

        <Select
          value={action}
          onValueChange={(v) => {
            setAction(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="glass w-42.5">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Aksi</SelectItem>
            <SelectItem value="CREATE">Tambah</SelectItem>
            <SelectItem value="UPDATE">Ubah</SelectItem>
            <SelectItem value="DELETE">Hapus</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="glass overflow-hidden rounded-2xl">
        <Table>
          <TableHeader>
            <TableRow className="bg-blue-50/60 hover:bg-blue-50/60">
              <TableHead className="font-semibold text-blue-900">Waktu</TableHead>
              <TableHead className="font-semibold text-blue-900">Pelaku</TableHead>
              <TableHead className="font-semibold text-blue-900">Aksi</TableHead>
              <TableHead className="font-semibold text-blue-900">Detail</TableHead>
              {isAdmin && <TableHead className="font-semibold text-blue-900">IP</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody className={""}>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={isAdmin ? 5 : 4}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : data?.data.length ? (
              data.data.map((log) => (
                <TableRow key={log.id} className="align-top hover:bg-white/60">
                  <TableCell className="whitespace-nowrap">
                    {format(new Date(log.timestamp), "dd MMM yyyy, HH:mm", { locale: localeId })}
                  </TableCell>
                  <TableCell>{log.user.name}</TableCell>
                  <TableCell>
                    <Badge className={ACTION_STYLE[log.action].cls}>{ACTION_STYLE[log.action].label}</Badge>
                  </TableCell>
                  <TableCell className="max-w-105">
                    {log.details}
                    <Changes log={log} />
                  </TableCell>
                  {isAdmin && <TableCell className="font-mono text-xs text-slate-500">{log.ipAddress}</TableCell>}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={isAdmin ? 5 : 4} className="h-32 text-center text-slate-500">
                  Belum ada aktivitas tercatat.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {meta && (
          <div className="flex items-center justify-between border-t border-white/60 px-4 py-3 text-sm text-slate-600">
            <span>
              ({meta.total.toLocaleString("id-ID")} aktivitas) <br className="block md:hidden"></br> Halaman {meta.page} dari {meta.totalPages}
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="bg-white/70" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                <ChevronLeft className="h-4 w-4" /> Sebelumnya
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-white/70"
                disabled={page >= meta.totalPages}
                onClick={() => setPage(page + 1)}
              >
                Berikutnya <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}