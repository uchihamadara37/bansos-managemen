"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { formatCompact } from "@/lib/format";
import type { Stats } from "@/types";
import { chartConfig, rupiahTooltip } from "./trend-chart";

export function CategoryChart({ data }: { data: Stats["byCategory"] }) {
  return (
    <ChartContainer config={chartConfig} className="h-80 w-full">
      <BarChart data={data.slice(0, 6)} margin={{ left: 4, right: 8, top: 8 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="category" tickLine={false} axisLine={false} />
        <YAxis tickLine={false} axisLine={false} width={52} tickFormatter={formatCompact} />
        <ChartTooltip content={<ChartTooltipContent formatter={rupiahTooltip} />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="income" fill="var(--color-income)" radius={[6, 6, 0, 0]} />
        <Bar dataKey="expense" fill="var(--color-expense)" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ChartContainer>
  );
}