import { SignJWT, jwtVerify } from "jose";

export type SessionPayload = {
  sub: string; // user id
  name: string;
  email: string;
  role: "ADMIN" | "USER";
};

export const COOKIE_NAME = "donasi_token";

const secret = () => new TextEncoder().encode(process.env.JWT_SECRET!);

export async function signToken(payload: SessionPayload) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(process.env.JWT_EXPIRES_IN ?? "7d")
    .sign(secret());
}

export async function verifyToken(token?: string): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}