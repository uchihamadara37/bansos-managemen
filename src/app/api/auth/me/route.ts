import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api";

export const GET = withAuth(["ADMIN", "USER"], async (_req, { session }) => {
  return NextResponse.json({
    user: { id: session.sub, name: session.name, email: session.email, role: session.role },
  });
});