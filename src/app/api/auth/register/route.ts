import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations/auth";
import { COOKIE_NAME, signToken } from "@/lib/auth/jwt";
import { ADMIN_PIN } from "@/lib/admin-pin";

export async function POST(req: Request) {
  const parsed = registerSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Validasi gagal", errors: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { name, email, password, role, adminPin } = parsed.data;

  // PIN dicek di server, bukan di browser
  if (role === "ADMIN" && adminPin?.trim() !== ADMIN_PIN) {
    return NextResponse.json({ message: "PIN admin salah" }, { status: 403 });
  }

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    return NextResponse.json({ message: "Email sudah terdaftar" }, { status: 409 });
  }

  const user = await prisma.user.create({
    data: { name, email, password: await bcrypt.hash(password, 10), role },
  });

  // Langsung login setelah daftar
  const token = await signToken({ sub: user.id, name: user.name, email: user.email, role: user.role });
  const res = NextResponse.json(
    { user: { id: user.id, name: user.name, email: user.email, role: user.role } },
    { status: 201 }
  );
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}