"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { formatCompact, formatRupiah } from "@/lib/format";
import type { Stats } from "@/types";

export const chartConfig = {
  income: { label: "Pemasukan", color: "#2563eb" },
  expense: { label: "Pengeluaran", color: "#f43f5e" },
} satisfies ChartConfig;

export const rupiahTooltip = (value: unknown, name: unknown, item: { color?: string }) => (
  <>
    <span className="h-2.5 w-2.5 shrink-0 rounded-xs" style={{ background: item.color }} />
    <span className="flex flex-1 items-center justify-between gap-6">
      <span className="text-muted-foreground">
        {chartConfig[name as keyof typeof chartConfig]?.label ?? String(name)}
      </span>
      <span className="font-mono font-medium">{formatRupiah(Number(value))}</span>
    </span>
  </>
);

export function TrendChart({ data }: { data: Stats["trend"] }) {
  return (
    <ChartContainer config={chartConfig} className="h-80 w-full">
      <AreaChart data={data} margin={{ left: 4, right: 8, top: 8 }}>
        <defs>
          {(["income", "expense"] as const).map((k) => (
            <linearGradient key={k} id={`fill-${k}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={chartConfig[k].color} stopOpacity={0.35} />
              <stop offset="95%" stopColor={chartConfig[k].color} stopOpacity={0.02} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="label" tickLine={false} axisLine={false} minTickGap={24} />
        <YAxis tickLine={false} axisLine={false} width={52} tickFormatter={formatCompact} />
        <ChartTooltip content={<ChartTooltipContent formatter={rupiahTooltip} />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Area dataKey="income" type="monotone" stroke="var(--color-income)" fill="url(#fill-income)" strokeWidth={2} />
        <Area dataKey="expense" type="monotone" stroke="var(--color-expense)" fill="url(#fill-expense)" strokeWidth={2} />
      </AreaChart>
    </ChartContainer>
  );
}