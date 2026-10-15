"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDeleteTransaction } from "@/hooks/use-transactions";
import { formatRupiah } from "@/lib/format";
import { useUiStore } from "@/stores/ui-store";

export function DeleteDialog() {
  const { deleteTarget, setDeleteTarget } = useUiStore();
  const del = useDeleteTransaction();

  return (
    <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus transaksi?</AlertDialogTitle>
          <AlertDialogDescription>
            &quot;{deleteTarget?.description}&quot; senilai{" "}
            <strong>{deleteTarget && formatRupiah(deleteTarget.amount)}</strong> akan disembunyikan dari laporan.
            Penghapusan tetap tercatat di log aktivitas.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction
            className="bg-rose-600 hover:bg-rose-700"
            onClick={() => deleteTarget && del.mutate(deleteTarget.id)}
          >
            Ya, hapus
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}