"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api-client";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { defaultStatsParams, statsQuery } from "@/lib/queries";
import { PasswordInput } from "@/components/ui/password-input";

export default function LoginPage() {
    const router = useRouter();
    const qc = useQueryClient();
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

    const login = useMutation({
        mutationFn: (v: LoginInput) => api("/api/auth/login", { method: "POST", body: JSON.stringify(v) }),
        onSuccess: () => {
            qc.prefetchQuery(statsQuery(defaultStatsParams));
            toast.success("Login berhasil");
            router.replace("/dashboard");
            router.refresh();
        },
        onError: (e: Error) => toast.error(e.message),
    });

    return (
        <AuthShell>
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Masuk</h2>
                <p className="mt-1 text-sm text-slate-500">Masuk untuk melihat atau mengelola laporan</p>
            </div>

            <form onSubmit={handleSubmit((v) => login.mutate(v))} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" autoComplete="email" className="bg-white/70" {...register("email")} />
                    {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    {/* <Input
                        id="password"
                        type="password"
                        autoComplete="current-password"
                        className="bg-white/70"
                        {...register("password")}
                    /> */}
                    <PasswordInput
                        id="password"
                        autoComplete="new-password"
                        className="bg-white/70"
                        {...register("password")}
                    />
                    {errors.password && <p className="text-xs text-red-600">{errors.password.message}</p>}
                </div>
                <Button
                    type="submit"
                    disabled={login.isPending}
                    className="w-full bg-linear-to-r from-blue-600 to-sky-500 text-white shadow-md shadow-blue-500/30 hover:opacity-95"
                >
                    {login.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Masuk
                </Button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
                Belum punya akun?{" "}
                <Link href="/register" className="font-medium text-blue-600 hover:underline">
                    Daftar
                </Link>
            </p>
        </AuthShell>
    );
}