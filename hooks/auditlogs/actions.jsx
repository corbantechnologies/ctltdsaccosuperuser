"use client";

import { useQuery } from "@tanstack/react-query";
import useAxiosAuth from "../authentication/useAxiosAuth";
import { getAuditLogs } from "@/services/auditlogs";

export function useFetchAuditLogs(params = {}) {
  const token = useAxiosAuth();

  return useQuery({
    queryKey: ["auditlogs", params],
    queryFn: () => getAuditLogs(token, params),
  });
}
