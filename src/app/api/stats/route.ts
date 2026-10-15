import { NextResponse } from "next/server";
import { z } from "zod";
import {
  differenceInCalendarDays,
  eachDayOfInterval,
  eachMonthOfInterval,
  endOfDay,
  format,
  startOfDay,
  startOfMonth,
  subDays,
  subMonths,
} from "date-fns";
import { id as localeId } from "date-fns/locale";
import { withAuth } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { buildWhere, searchParamsToObject } from "@/lib/transactions";

const statsQuerySchema = z.object({
  granularity: z.enum(["day", "month"]).default("month"),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

export const GET = withAuth(["ADMIN", "USER"], async (req) => {
  const q = statsQuerySchema.parse(searchParamsToObject(req.nextUrl.searchParams));
  const rangeWhere = buildWhere({ from: q.from, to: q.to }); // tanpa from/to = semua waktu

  // ---------- 1) Ringkasan ----------
  const grouped = await prisma.transaction.groupBy({
    by: ["type"],
    where: rangeWhere,
    _sum: { amount: true },
    _count: true,
  });
  const pick = (type: "INCOME" | "EXPENSE") => {
    const g = grouped.find((x) => x.type === type);
    return { sum: Number(g?._sum.amount ?? 0), count: g?._count ?? 0 };
  };
  const income = pick("INCOME");
  const expense = pick("EXPENSE");

  // ---------- 2) Tren ----------
  const now = new Date();
  const end = endOfDay(q.to ?? now);
  const start = q.from
    ? startOfDay(q.from)
    : q.granularity === "month"
      ? startOfMonth(subMonths(now, 11))
      : startOfDay(subDays(now, 29));

  if (start > end) {
    return NextResponse.json({ message: "Rentang tanggal tidak valid" }, { status: 400 });
  }
  if (q.granularity === "day" && differenceInCalendarDays(end, start) > 366) {
    return NextResponse.json(
      { message: "Rentang harian maksimal 366 hari, gunakan granularity=month" },
      { status: 400 }
    );
  }

  const keyFmt = q.granularity === "month" ? "yyyy-MM" : "yyyy-MM-dd";
  const labelFmt = q.granularity === "month" ? "MMM yy" : "dd MMM";
  const points =
    q.granularity === "month"
      ? eachMonthOfInterval({ start, end })
      : eachDayOfInterval({ start, end });

  const buckets = new Map(
    points.map((d) => [
      format(d, keyFmt),
      { key: format(d, keyFmt), label: format(d, labelFmt, { locale: localeId }), income: 0, expense: 0 },
    ])
  );

  const rows = await prisma.transaction.findMany({
    where: { date: { gte: start, lte: end } },
    select: { type: true, amount: true, date: true },
  });
  for (const r of rows) {
    const bucket = buckets.get(format(r.date, keyFmt));
    if (!bucket) continue;
    if (r.type === "INCOME") bucket.income += Number(r.amount);
    else bucket.expense += Number(r.amount);
  }

  // ---------- 3) Per kategori ----------
  const byCat = await prisma.transaction.groupBy({
    by: ["category", "type"],
    where: rangeWhere,
    _sum: { amount: true },
  });
  const catMap = new Map<string, { category: string; income: number; expense: number }>();
  for (const c of byCat) {
    const entry = catMap.get(c.category) ?? { category: c.category, income: 0, expense: 0 };
    if (c.type === "INCOME") entry.income += Number(c._sum.amount ?? 0);
    else entry.expense += Number(c._sum.amount ?? 0);
    catMap.set(c.category, entry);
  }

  return NextResponse.json({
    summary: {
      totalIncome: income.sum,
      totalExpense: expense.sum,
      balance: income.sum - expense.sum,
      transactionCount: income.count + expense.count,
    },
    trend: Array.from(buckets.values()),
    byCategory: Array.from(catMap.values()).sort(
      (a, b) => b.income + b.expense - (a.income + a.expense)
    ),
  });
});