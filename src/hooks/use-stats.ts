"use client";

import { useQuery } from "@tanstack/react-query";
import { statsQuery, type StatsParams } from "@/lib/queries";

export type { StatsParams };
export const useStats = (params: StatsParams) => useQuery(statsQuery(params));