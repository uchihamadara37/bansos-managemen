"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { activityLogsQuery, categoriesQuery, transactionsQuery } from "@/lib/queries";
import { useUiStore } from "@/stores/ui-store";

export function usePrefetchAppData() {
  const qc = useQueryClient();
  const router = useRouter();

  return useCallback(() => {
    const { filters } = useUiStore.getState();

    // Data (fire-and-forget; error diabaikan, nanti dicoba lagi saat halaman dibuka)
    qc.prefetchQuery(transactionsQuery(filters));
    qc.prefetchQuery(categoriesQuery());
    qc.prefetchQuery(activityLogsQuery(1, "all"));

    // Kode halaman (JS chunk) juga dimuat lebih awal
    router.prefetch("/transactions");
    router.prefetch("/activity-log");
  }, [qc, router]);
}