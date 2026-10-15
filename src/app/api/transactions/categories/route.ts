import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export const GET = withAuth(["ADMIN", "USER"], async () => {
  const rows = await prisma.transaction.findMany({
    distinct: ["category"],
    select: { category: true },
    orderBy: { category: "asc" },
  });
  return NextResponse.json({ data: rows.map((r) => r.category) });
});