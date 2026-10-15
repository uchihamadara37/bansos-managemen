import { createBasePrisma } from "@/lib/prisma-base";
// import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import 'dotenv/config';

const prisma = createBasePrisma();

async function main() {
  const pw = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@donasi.test" },
    update: {},
    create: { name: "Admin Donasi", email: "admin@donasi.test", password: pw, role: "ADMIN" },
  });

  await prisma.user.upsert({
    where: { email: "donatur@donasi.test" },
    update: {},
    create: { name: "Donatur", email: "donatur@donasi.test", password: pw, role: "USER" },
  });

  const categories = ["Pendidikan", "Kesehatan", "Bencana Alam", "Operasional"];
  const rows = Array.from({ length: 30 }).map((_, i) => {
    const income = i % 3 !== 0;
    return {
      type: income ? ("INCOME" as const) : ("EXPENSE" as const),
      amount: (Math.floor(Math.random() * 50) + 1) * 100_000,
      description: income ? `Donasi dari donatur #${i + 1}` : `Penyaluran bantuan #${i + 1}`,
      category: categories[i % categories.length],
      date: new Date(Date.now() - i * 5 * 24 * 60 * 60 * 1000),
      createdById: admin.id,
    };
  });

  await prisma.transaction.createMany({ data: rows });
  console.log("✅ Seed selesai");
}

main().finally(() => prisma.$disconnect());