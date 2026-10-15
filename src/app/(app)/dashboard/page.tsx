"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatCards } from "@/components/charts/stat-cards";
import { TrendChart } from "@/components/charts/trend-chart";
import { CategoryChart } from "@/components/charts/category-chart";
import { useStats, type StatsParams } from "@/hooks/use-stats";
import { usePrefetchAppData } from "@/hooks/use-prefetch";


export default function DashboardPage() {
  const [params, setParams] = useState<StatsParams>({ granularity: "month", from: "", to: "" });
  const { data, isLoading, isError } = useStats(params);

  const prefetchAll = usePrefetchAppData();
  const dashboardReady = !!data;
  useEffect(() => {
    if (dashboardReady) prefetchAll();
  }, [dashboardReady, prefetchAll]);

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500">Ringkasan keuangan donasi secara real-time</p>
        </div>

        <div className="glass grid w-full grid-cols-2 gap-3 rounded-2xl p-3 sm:flex sm:w-auto sm:flex-wrap sm:items-end">
          {/* Periode */}
          <div className="col-span-2 space-y-1 sm:col-span-1">
            <label className="px-0.5 text-sm font-medium text-slate-500">Periode</label>
            <Select
              value={params.granularity}
              onValueChange={(v) => setParams((p) => ({ ...p, granularity: v as "day" | "month" }))}
            >
              <SelectTrigger className="w-full bg-white/70 sm:w-36">
                <SelectValue>{params.granularity === "month" ? "Per Bulan" : "Per Hari"}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Per Bulan</SelectItem>
                <SelectItem value="day">Per Hari</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Dari */}
          <div className="min-w-0 space-y-1">
            <label htmlFor="stats-from" className="px-0.5 text-sm font-medium text-slate-500">
              Dari
            </label>
            <Input
              id="stats-from"
              type="date"
              value={params.from}
              onChange={(e) => setParams((p) => ({ ...p, from: e.target.value }))}
              className="w-full min-w-0 bg-white/70 sm:w-40"
            />
          </div>

          {/* Sampai */}
          <div className="min-w-0 space-y-1">
            <label htmlFor="stats-to" className="px-0.5 text-sm font-medium text-slate-500">
              Sampai
            </label>
            <Input
              id="stats-to"
              type="date"
              value={params.to}
              onChange={(e) => setParams((p) => ({ ...p, to: e.target.value }))}
              className="w-full min-w-0 bg-white/70 sm:w-40"
            />
          </div>

          {/* Reset */}
          {(params.from || params.to) && (
            <Button
              variant="outline"
              size="sm"
              className="col-span-2 bg-white/70 sm:col-span-1 sm:border-transparent sm:bg-transparent sm:shadow-none"
              onClick={() => setParams((p) => ({ ...p, from: "", to: "" }))}
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {isError && (
        <p className="glass rounded-xl p-4 text-sm text-red-600">
          Gagal memuat statistik. Cek rentang tanggal (mode harian maksimal 366 hari).
        </p>
      )}

      <StatCards summary={data?.summary} />

      <div className="grid gap-6 grid-cols-1 xl:grid-cols-5">
        <section className="glass rounded-2xl p-5 xl:col-span-3">
          <h2 className="mb-4 font-semibold text-slate-800">
            Tren {params.granularity === "month" ? "Bulanan" : "Harian"}
          </h2>
          {isLoading ? <Skeleton className="h-80 w-full" /> : data && <TrendChart data={data.trend} />}
        </section>

        <section className="glass rounded-2xl p-5 xl:col-span-2">
          <h2 className="mb-4 font-semibold text-slate-800">Berdasarkan Kategori</h2>
          {isLoading ? <Skeleton className="h-80 w-full" /> : data && <CategoryChart data={data.byCategory} />}
        </section>
      </div>
    </>
  );
}