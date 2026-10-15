"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { KeyRound, Loader2, ShieldCheck, Users } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";
import { defaultStatsParams, statsQuery } from "@/lib/queries";
import { PasswordInput } from "@/components/ui/password-input";

const ROLES = [
    { value: "USER", label: "Donatur", desc: "Melihat laporan", icon: Users },
    { value: "ADMIN", label: "Admin", desc: "Mengelola data", icon: ShieldCheck },
] as const;

function FieldError({ message }: { message?: string }) {
    return message ? <p className="text-xs text-red-600">{message}</p> : null;
}

export default function RegisterPage() {
    const router = useRouter();
    const qc = useQueryClient();
    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<RegisterInput>({
        resolver: zodResolver(registerSchema),
        defaultValues: { role: "USER", adminPin: "" },
    });

    const role = watch("role");

    const signUp = useMutation({
        mutationFn: (v: RegisterInput) =>
            api("/api/auth/register", {
                method: "POST",
                // PIN hanya dikirim bila memilih Admin
                body: JSON.stringify({ ...v, adminPin: v.role === "ADMIN" ? v.adminPin : undefined }),
            }),
        onSuccess: () => {
            qc.clear();
            qc.prefetchQuery(statsQuery(defaultStatsParams));
            toast.success("Akun berhasil dibuat");
            router.replace("/dashboard");
            router.refresh();
        },
        onError: (e: Error) => toast.error(e.message),
    });

    return (
        <AuthShell>
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Buat Akun</h2>
                <p className="mt-1 text-sm text-slate-500">Daftar sebagai donatur atau admin</p>
            </div>

            <form onSubmit={handleSubmit((v) => signUp.mutate(v))} className="space-y-4">
                <div className="space-y-2">
                    <Label>Daftar sebagai</Label>
                    <div className="grid grid-cols-2 gap-3">
                        {ROLES.map(({ value, label, desc, icon: Icon }) => (
                            <button
                                key={value}
                                type="button"
                                onClick={() => setValue("role", value, { shouldValidate: true })}
                                aria-pressed={role === value}
                                className={cn(
                                    "rounded-xl border p-3 text-left transition",
                                    role === value
                                        ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500/30"
                                        : "border-white/60 bg-white/60 hover:bg-white/90"
                                )}
                            >
                                <Icon className={cn("mb-1 h-5 w-5", role === value ? "text-blue-600" : "text-slate-400")} />
                                <p className="text-sm font-semibold text-slate-800">{label}</p>
                                <p className="text-xs text-slate-500">{desc}</p>
                            </button>
                        ))}
                    </div>
                </div>

                {role === "ADMIN" && (
                    <div className="space-y-2">
                        <Label htmlFor="adminPin" className="flex items-center gap-1">
                            <KeyRound className="h-3.5 w-3.5 text-blue-600" /> PIN Admin
                        </Label>
                        <PasswordInput
                            id="adminPin"
                            autoComplete="new-password"
                            className="bg-white/70"
                            {...register("adminPin")}
                        />
                        {/* <Input
                            id="adminPin"
                            type="password"
                            autoComplete="off"
                            placeholder="Masukkan PIN dari pengurus"
                            className="bg-white/70"
                            {...register("adminPin")}
                        /> */}
                        <FieldError message={errors.adminPin?.message} />
                    </div>
                )}

                <div className="space-y-2">
                    <Label htmlFor="name">Nama Lengkap</Label>
                    <Input id="name" autoComplete="name" className="bg-white/70" {...register("name")} />
                    <FieldError message={errors.name?.message} />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" autoComplete="email" className="bg-white/70" {...register("email")} />
                    <FieldError message={errors.email?.message} />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <PasswordInput
                            id="password"
                            autoComplete="new-password"
                            className="bg-white/70"
                            {...register("password")}
                        />
                        <FieldError message={errors.password?.message} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Ulangi Password</Label>
                        <PasswordInput
                            id="confirmPassword"
                            autoComplete="new-password"
                            className="bg-white/70"
                            {...register("confirmPassword")}
                        />
                        <FieldError message={errors.confirmPassword?.message} />
                    </div>
                </div>

                <Button
                    type="submit"
                    disabled={signUp.isPending}
                    className="w-full bg-linear-to-r from-blue-600 to-sky-500 text-white shadow-md shadow-blue-500/30 hover:opacity-95"
                >
                    {signUp.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Daftar
                </Button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
                Sudah punya akun?{" "}
                <Link href="/login" className="font-medium text-blue-600 hover:underline">
                    Masuk
                </Link>
            </p>
        </AuthShell>
    );
}