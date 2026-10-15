import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { serializeTransaction, transactionInclude } from "@/lib/transactions";
import { transactionSchema } from "@/lib/validations/transaction";

type Params = { id: string };

export const GET = withAuth<Params>(["ADMIN", "USER"], async (_req, { params }) => {
  const trx = await prisma.transaction.findUnique({
    where: { id: params.id },
    include: transactionInclude,
  });
  if (!trx) return NextResponse.json({ message: "Data tidak ditemukan" }, { status: 404 });
  return NextResponse.json({ data: serializeTransaction(trx) });
});

export const PUT = withAuth<Params>(["ADMIN"], async (req, { params }) => {
  const body = transactionSchema.parse(await req.json());
  const updated = await prisma.transaction.update({
    where: { id: params.id },
    data: body,
    include: transactionInclude,
  });
  return NextResponse.json({ data: serializeTransaction(updated) });
});

// Soft delete (dialihkan oleh Prisma extension)
export const DELETE = withAuth<Params>(["ADMIN"], async (_req, { params }) => {
  await prisma.transaction.delete({ where: { id: params.id } });
  return NextResponse.json({ message: "Transaksi berhasil dihapus" });
});