// import { PrismaClient, } from "@prisma/client";
import 'dotenv/config';
import { ActivityAction } from "../generated/prisma/client";
import { createBasePrisma } from "./prisma-base";
import { requestContext } from "./request-context";

const READ_OPS = [
    "findMany",
    "findFirst",
    "findFirstOrThrow",
    "findUnique",
    "findUniqueOrThrow",
    "count",
    "aggregate",
    "groupBy",
];

// Hilangkan Decimal/Date agar aman disimpan sebagai JSON
const toJson = (v: unknown) => (v ? JSON.parse(JSON.stringify(v)) : null);

function createPrisma() {
    const base = createBasePrisma();

    async function writeLog(
        action: ActivityAction,
        entityId: string,
        details: string,
        metadata: unknown
    ) {
        const ctx = requestContext.getStore();
        if (!ctx) {
            console.warn(`[audit] Konteks request tidak ada, log ${action} ${entityId} TIDAK dicatat`);
            return;
        }else {
            console.log(`[audit] ada konteks ${ctx.userId} ${action} ${entityId} (${ctx.ipAddress})`);
        }

        await base.activityLog.create({
            data: {
                userId: ctx.userId,
                action,
                entity: "Transaction",
                entityId,
                details,
                metadata: toJson(metadata),
                ipAddress: ctx.ipAddress,
            },
        });
    }

    const extended = base.$extends({
        name: "softDeleteAndAudit",
        query: {
            transaction: {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                async $allOperations({ operation, args, query }: any) {
                    // 1) READ: otomatis sembunyikan data yang sudah di-soft-delete
                    if (READ_OPS.includes(operation)) {
                        args.where = { ...(args.where ?? {}), deletedAt: null };
                        return query(args);
                    }

                    // 2) CREATE
                    if (operation === "create") {
                        const result = await query(args);
                        await writeLog(
                            "CREATE",
                            result.id,
                            `Menambah transaksi ${result.type} "${result.description}" sebesar ${result.amount}`,
                            { after: result }
                        );
                        return result;
                    }

                    // 3) UPDATE (simpan before/after untuk audit)
                    if (operation === "update") {
                        args.where = { ...args.where, deletedAt: null }; // tolak data yang sudah soft-deleted
                        const before = await base.transaction.findUnique({ where: args.where });
                        const result = await query(args);
                        await writeLog(
                            "UPDATE",
                            result.id,
                            `Mengubah transaksi "${result.description}"`,
                            { before, after: result }
                        );
                        return result;
                    }

                    // 4) DELETE -> dialihkan menjadi SOFT DELETE
                    if (operation === "delete") {
                        const before = await base.transaction.findUnique({
                            where: { id: args.where.id, deletedAt: null },
                        });
                        if (!before) throw Object.assign(new Error("Not found"), { code: "P2025" });

                        const result = await base.transaction.update({
                            where: { id: before.id },
                            data: { deletedAt: new Date() },
                        });
                        await writeLog(
                            "DELETE",
                            result.id,
                            `Menghapus transaksi "${result.description}"`,
                            { before }
                        );
                        return result;
                    }

                    // Operasi massal yang tidak diizinkan agar log tidak terlewat
                    if (["deleteMany", "updateMany", "createMany", "upsert"].includes(operation)) {
                        throw new Error(`Operasi ${operation} tidak diizinkan pada Transaction`);
                    }

                    return query(args);
                },
            },
        },
    });

    return extended;
}

type ExtendedPrisma = ReturnType<typeof createPrisma>;

const globalForPrisma = globalThis as unknown as { prisma?: ExtendedPrisma };

export const prisma = globalForPrisma.prisma ?? createPrisma();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;