import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
// import type { Role } from "@prisma/client";
import type { Role } from "@/generated/prisma/client";
import { getSessionFromRequest } from "./auth/session";
import type { SessionPayload } from "./auth/jwt";
import { requestContext } from "./request-context";

type Ctx<P> = { session: SessionPayload; params: P };

export function withAuth<P = Record<string, never>>(
    allowedRoles: Role[],
    handler: (req: NextRequest, ctx: Ctx<P>) => Promise<Response>
) {
    return async (req: NextRequest, routeCtx: { params: Promise<P> }) => {
        const session = await getSessionFromRequest(req);

        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        if (!allowedRoles.includes(session.role)) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        const params = await routeCtx.params;
        const ipAddress =
            req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

        try {
            // Semua query Prisma di dalam handler otomatis tahu siapa pelakunya
            return await requestContext.run({ userId: session.sub, ipAddress }, () =>
                handler(req, { session, params })
            );
        } catch (err) {
            if (err instanceof ZodError) {
                return NextResponse.json(
                    { message: "Validasi gagal", errors: err.flatten().fieldErrors },
                    { status: 400 }
                );
            }

            if ((err as { code?: string })?.code === "P2025") {
                return NextResponse.json({ message: "Data tidak ditemukan" }, { status: 404 });
            }
            console.error(err);
            return NextResponse.json({ message: "Terjadi kesalahan server" }, { status: 500 });
        }
    };
}