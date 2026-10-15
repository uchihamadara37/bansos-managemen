export type ExportRow = {
  date: Date;
  type: "INCOME" | "EXPENSE";
  category: string;
  description: string;
  amount: number;
  createdBy: string;
};

export type ExportMeta = {
  periodLabel: string; // mis. "01 Jan 2026 - 31 Mar 2026 | Tipe: Pemasukan"
  totalIncome: number;
  totalExpense: number;
  balance: number;
};