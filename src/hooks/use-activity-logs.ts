"use client";

import { useQuery } from "@tanstack/react-query";
import { activityLogsQuery } from "@/lib/queries";

export const useActivityLogs = (page: number, action: string) =>
    useQuery(activityLogsQuery(page, action));