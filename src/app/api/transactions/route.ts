import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import {
  buildWhere,
  searchParamsToObject,
  serializeTransaction,
  transactionInclude,
} from "@/lib/transactions";
import { transactionQuerySchema, transactionSchema } from "@/lib/validations/transaction";

// USER & ADMIN boleh baca
export const GET = withAuth(["ADMIN", "USER"], async (req) => {
  const q = transactionQuerySchema.parse(searchParamsToObject(req.nextUrl.searchParams));
  const where = buildWhere(q);

  const [total, rows] = await Promise.all([
    prisma.transaction.count({ where }),
    prisma.transaction.findMany({
      where,
      include: transactionInclude,
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      skip: (q.page - 1) * q.pageSize,
      take: q.pageSize,
    }),
  ]);

  return NextResponse.json({
    data: rows.map(serializeTransaction),
    meta: {
      page: q.page,
      pageSize: q.pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / q.pageSize)),
    },
  });
});

// Hanya ADMIN
export const POST = withAuth(["ADMIN"], async (req, { session }) => {
  const body = transactionSchema.parse(await req.json());

  // Log CREATE dicatat otomatis oleh Prisma extension
  const created = await prisma.transaction.create({
    data: { ...body, createdById: session.sub },
    include: transactionInclude,
  });

  return NextResponse.json({ data: serializeTransaction(created) }, { status: 201 });
});