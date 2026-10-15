import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME, verifyToken } from "@/lib/auth/jwt";

const PUBLIC_PAGES = ["/login", "/register"];
const PUBLIC_API = ["/api/auth/login", "/api/auth/register"];

export async function proxy(req: NextRequest) {
  const startTime = Date.now();
  const { method } = req;

  const { pathname } = req.nextUrl;
  const isApi = pathname.startsWith("/api");

  const session = await verifyToken(req.cookies.get(COOKIE_NAME)?.value);

  // Halaman login: kalau sudah login, arahkan ke dashboard
  if (PUBLIC_PAGES.includes(pathname)) {
    if (session) return NextResponse.redirect(new URL("/dashboard", req.url));
    return NextResponse.next();
  }

  if (PUBLIC_API.includes(pathname)) return NextResponse.next();

  // Belum login
  if (!session) {
    if (isApi) {
      return NextResponse.json({ message: "Unauthorized belum login" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Defense in depth: mutasi data hanya untuk ADMIN
  const isMutation = !["GET", "HEAD", "OPTIONS"].includes(req.method);
  const isAuthApi = pathname.startsWith("/api/auth");
  if (isApi && isMutation && !isAuthApi && session.role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  // --- EXPRESS STYLE LOGGER ---
  const duration = Date.now() - startTime;
  const status = NextResponse.next().status; // Mengambil status kode dari response (200, 307, 401, 403, dll)
  
  // Warna/format opsional di terminal server
  console.log(`[HTTP] ${method.toUpperCase()} ${pathname} - ${status} (${duration}ms)`);

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};