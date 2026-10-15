export type TransactionType = "INCOME" | "EXPENSE";

export type Transaction = {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  category: string;
  date: string;
  createdAt: string;
  createdBy: { id: string; name: string };
};

export type Meta = { page: number; pageSize: number; total: number; totalPages: number };
export type Paginated<T> = { data: T[]; meta: Meta };

export type ActivityLogItem = {
  id: string;
  action: "CREATE" | "UPDATE" | "DELETE";
  entity: string;
  entityId: string | null;
  details: string;
  metadata: { before?: Record<string, unknown>; after?: Record<string, unknown> } | null;
  ipAddress: string | null;
  timestamp: string;
  user: { name: string; role: "ADMIN" | "USER" };
};

export type Stats = {
  summary: { totalIncome: number; totalExpense: number; balance: number; transactionCount: number };
  trend: { key: string; label: string; income: number; expense: number }[];
  byCategory: { category: string; income: number; expense: number }[];
};

export type SessionUser = { id: string; name: string; email: string; role: "ADMIN" | "USER" };