import { NextResponse } from "next/server";
import { z } from "zod";
import { withAuth } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { searchParamsToObject } from "@/lib/transactions";

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(15),
  action: z.enum(["CREATE", "UPDATE", "DELETE"]).optional(),
});

export const GET = withAuth(["ADMIN", "USER"], async (req, { session }) => {
  const q = querySchema.parse(searchParamsToObject(req.nextUrl.searchParams));
  const where = q.action ? { action: q.action } : {};

  const [total, logs] = await Promise.all([
    prisma.activityLog.count({ where }),
    prisma.activityLog.findMany({
      where,
      include: { user: { select: { name: true, role: true } } },
      orderBy: { timestamp: "desc" },
      skip: (q.page - 1) * q.pageSize,
      take: q.pageSize,
    }),
  ]);

  return NextResponse.json({
    data: logs.map((l) => ({
      ...l,
      ipAddress: session.role === "ADMIN" ? l.ipAddress : null,
    })),
    meta: {
      page: q.page,
      pageSize: q.pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / q.pageSize)),
    },
  });
});