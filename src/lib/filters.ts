export type UiFilters = {
  type: "all" | "INCOME" | "EXPENSE";
  category: string; // "all" = semua
  from: string; // yyyy-MM-dd
  to: string;
  page: number;
  pageSize: number;
};

export const defaultFilters: UiFilters = {
  type: "all",
  category: "all",
  from: "",
  to: "",
  page: 1,
  pageSize: 10,
};

export function filtersToQuery(f: UiFilters, withPaging = true) {
  const p = new URLSearchParams();
  if (f.type !== "all") p.set("type", f.type);
  if (f.category !== "all") p.set("category", f.category);
  if (f.from) p.set("from", f.from);
  if (f.to) p.set("to", f.to);
  if (withPaging) {
    p.set("page", String(f.page));
    p.set("pageSize", String(f.pageSize));
  }
  return p.toString();
}