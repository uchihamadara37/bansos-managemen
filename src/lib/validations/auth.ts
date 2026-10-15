import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});


export const registerSchema = z
  .object({
    name: z.string().min(2, "Nama minimal 2 karakter").max(100),
    email: z.string().email("Email tidak valid"),
    password: z.string().min(6, "Password minimal 6 karakter").max(72, "Password maksimal 72 karakter"),
    confirmPassword: z.string(),
    role: z.enum(["USER", "ADMIN"]),
    adminPin: z.string().optional(),
  })
  .superRefine((d, ctx) => {
    if (d.password !== d.confirmPassword) {
      ctx.addIssue({ code: "custom", path: ["confirmPassword"], message: "Konfirmasi password tidak sama" });
    }
    if (d.role === "ADMIN" && !d.adminPin?.trim()) {
      ctx.addIssue({ code: "custom", path: ["adminPin"], message: "PIN admin wajib diisi" });
    }
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;