"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import { filtersToQuery, type UiFilters } from "@/lib/filters";
import type { TransactionInput } from "@/lib/validations/transaction";
import type { Paginated, Transaction } from "@/types";
import { categoriesQuery, transactionsQuery } from "@/lib/queries";

export const useTransactions = (filters: UiFilters) => useQuery(transactionsQuery(filters));
export const useCategories = () => useQuery(categoriesQuery());

function useInvalidateAll() {
  const qc = useQueryClient();
  return () =>
    Promise.all(
      ["transactions", "stats", "activity-logs", "categories"].map((k) =>
        qc.invalidateQueries({ queryKey: [k] })
      )
    );
}

export function useSaveTransaction() {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: ({ id, values }: { id?: string; values: TransactionInput }) =>
      api(id ? `/api/transactions/${id}` : "/api/transactions", {
        method: id ? "PUT" : "POST",
        body: JSON.stringify(values),
      }),
    onSuccess: (_d, vars) => {
      toast.success(vars.id ? "Transaksi berhasil diperbarui" : "Transaksi berhasil ditambahkan");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteTransaction() {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: (id: string) => api(`/api/transactions/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Transaksi berhasil dihapus");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });
}