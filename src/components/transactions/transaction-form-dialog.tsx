"use client";

import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
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
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCategories, useSaveTransaction } from "@/hooks/use-transactions";
import { formatRupiah } from "@/lib/format";
import { transactionSchema, type TransactionInput } from "@/lib/validations/transaction";
import { useUiStore } from "@/stores/ui-store";
import type { Transaction } from "@/types";

type FormIn = z.input<typeof transactionSchema>;

const emptyValues: FormIn = {
  type: "INCOME",
  amount: 0,
  description: "",
  category: "",
  date: new Date(),
};

const toFormValues = (t: Transaction): FormIn => ({
  type: t.type,
  amount: t.amount,
  description: t.description,
  category: t.category,
  date: new Date(t.date),
});

const typeLabel = (t: string) => (t === "INCOME" ? "Pemasukan" : "Pengeluaran");

// Daftar perubahan untuk dialog konfirmasi
function diffRows(before: Transaction, after: TransactionInput) {
  const rows: { label: string; from: string; to: string }[] = [];
  const add = (label: string, from: string, to: string) => from !== to && rows.push({ label, from, to });

  add("Tipe", typeLabel(before.type), typeLabel(after.type));
  add("Nominal", formatRupiah(before.amount), formatRupiah(after.amount));
  add("Kategori", before.category, after.category);
  add("Deskripsi", before.description, after.description);
  add(
    "Tanggal",
    format(new Date(before.date), "dd MMM yyyy", { locale: localeId }),
    format(after.date, "dd MMM yyyy", { locale: localeId })
  );
  return rows;
}

function FieldError({ message }: { message?: string }) {
  return message ? <p className="text-xs text-red-600">{message}</p> : null;
}

export function TransactionFormDialog() {
  const { formOpen, editing, closeForm } = useUiStore();
  const { data: categories = [] } = useCategories();
  const save = useSaveTransaction();
  const [pending, setPending] = useState<TransactionInput | null>(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormIn, unknown, TransactionInput>({
    resolver: zodResolver(transactionSchema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (formOpen) reset(editing ? toFormValues(editing) : emptyValues);
  }, [formOpen, editing, reset]);

  const onValid = (values: TransactionInput) => {
    if (!editing) {
      save.mutate({ values }, { onSuccess: closeForm });
      return;
    }
    // Mode edit: minta konfirmasi dulu
    if (diffRows(editing, values).length === 0) {
      toast.info("Tidak ada perubahan untuk disimpan");
      return;
    }
    setPending(values);
  };

  const confirmEdit = () => {
    if (!editing || !pending) return;
    save.mutate(
      { id: editing.id, values: pending },
      {
        onSuccess: () => {
          setPending(null);
          closeForm();
        },
        onError: () => setPending(null),
      }
    );
  };

  return (
    <>
      <Dialog open={formOpen} onOpenChange={(o) => !o && !save.isPending && closeForm()}>
        <DialogContent className="glass sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Transaksi" : "Tambah Transaksi"}</DialogTitle>
            <DialogDescription>
              {editing ? "Perubahan akan tercatat di log aktivitas publik." : "Catat donasi masuk atau keluar."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onValid)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipe</Label>
                <Controller
                  control={control}
                  name="type"
                  render={({ field }) => (
                    <Select value={field.value as string} onValueChange={field.onChange}>
                      <SelectTrigger className="bg-white/70">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INCOME">Pemasukan</SelectItem>
                        <SelectItem value="EXPENSE">Pengeluaran</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError message={errors.type?.message} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Tanggal</Label>
                <Input id="date" type="date" className="bg-white/70" {...register("date")} />
                <FieldError message={errors.date?.message} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Nominal (Rp)</Label>
              <Input
                id="amount"
                type="number"
                inputMode="numeric"
                min={0}
                step="1"
                placeholder="500000"
                className="bg-white/70"
                {...register("amount")}
              />
              <FieldError message={errors.amount?.message} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Kategori</Label>
              <Input
                id="category"
                list="category-options"
                placeholder="mis. Pendidikan"
                className="bg-white/70"
                {...register("category")}
              />
              <datalist id="category-options">
                {categories.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
              <FieldError message={errors.category?.message} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea id="description" rows={3} className="bg-white/70" {...register("description")} />
              <FieldError message={errors.description?.message} />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeForm} disabled={save.isPending}>
                Batal
              </Button>
              <Button
                type="submit"
                disabled={save.isPending}
                className="bg-linear-to-r from-blue-600 to-sky-500 text-white"
              >
                {save.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editing ? "Simpan Perubahan" : "Simpan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Konfirmasi perubahan (khusus edit) */}
      <AlertDialog open={!!pending} onOpenChange={(o) => !o && setPending(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Simpan perubahan ini?</AlertDialogTitle>
            <AlertDialogDescription>
              Data lama dan baru akan tercatat di log aktivitas yang dapat dilihat semua pengguna.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <ul className="space-y-2 rounded-lg bg-blue-50 p-3 text-sm">
            {editing &&
              pending &&
              diffRows(editing, pending).map((r) => (
                <li key={r.label}>
                  <span className="font-medium text-slate-700">{r.label}:</span>{" "}
                  <span className="text-rose-600 line-through">{r.from}</span>{" "}
                  <span className="text-slate-400">→</span>{" "}
                  <span className="font-medium text-blue-700">{r.to}</span>
                </li>
              ))}
          </ul>

          <AlertDialogFooter>
            <AlertDialogCancel>Periksa lagi</AlertDialogCancel>
            <AlertDialogAction onClick={confirmEdit}>Ya, simpan</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}