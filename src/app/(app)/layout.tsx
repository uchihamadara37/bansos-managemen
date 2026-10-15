import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { UserProvider } from "@/components/providers/user-provider";
import { AppShell } from "@/components/layout/app-shell";
import { Suspense } from "react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="app-bg" />}>
      <AuthedShell>{children}</AuthedShell>
    </Suspense>
  );
}

async function AuthedShell({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <UserProvider user={{ id: session.sub, name: session.name, email: session.email, role: session.role }}>
      <AppShell>{children}</AppShell>
    </UserProvider>
  );
}