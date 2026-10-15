import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { filtersToQuery, type UiFilters } from "@/lib/filters";
import type { ActivityLogItem, Paginated, Stats, Transaction } from "@/types";

// Data dianggap "segar" 5 detik. Lewat itu, membuka halaman memicu fetch ulang
// di belakang layar. Dalam 5 detik, tidak ada request ganda (mis. tepat setelah login).
const STALE = 5_000;

export type StatsParams = { granularity: "day" | "month"; from: string; to: string };
export const defaultStatsParams: StatsParams = { granularity: "month", from: "", to: "" };

export const statsQuery = (params: StatsParams) =>
    queryOptions({
        queryKey: ["stats", params],
        queryFn: () => {
            const p = new URLSearchParams({ granularity: params.granularity });
            if (params.from) p.set("from", params.from);
            if (params.to) p.set("to", params.to);
            return api<Stats>(`/api/stats?${p}`);
        },
        staleTime: STALE,
        placeholderData: keepPreviousData,
    });

export const transactionsQuery = (filters: UiFilters) =>
    queryOptions({
        queryKey: ["transactions", filters],
        queryFn: () => api<Paginated<Transaction>>(`/api/transactions?${filtersToQuery(filters)}`),
        staleTime: STALE,
        placeholderData: keepPreviousData,
    });

export const categoriesQuery = () =>
    queryOptions({
        queryKey: ["categories"],
        queryFn: async () => (await api<{ data: string[] }>("/api/transactions/categories")).data,
        staleTime: 5 * 60_000,
    });

export const activityLogsQuery = (page: number, action: string) =>
    queryOptions({
        queryKey: ["activity-logs", page, action],
        queryFn: () => {
            const p = new URLSearchParams({ page: String(page), pageSize: "15" });
            if (action !== "all") p.set("action", action);
            return api<Paginated<ActivityLogItem>>(`/api/activity-logs?${p}`);
        },
        staleTime: STALE,
        placeholderData: keepPreviousData,
    });