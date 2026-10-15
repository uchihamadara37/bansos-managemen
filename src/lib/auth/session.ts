import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { COOKIE_NAME, verifyToken } from "./jwt";

// Untuk Server Components / Server Actions
export async function getSession() {
  const store = await cookies();
  return verifyToken(store.get(COOKIE_NAME)?.value);
}

// Untuk Route Handlers
export async function getSessionFromRequest(req: NextRequest) {
  return verifyToken(req.cookies.get(COOKIE_NAME)?.value);
}