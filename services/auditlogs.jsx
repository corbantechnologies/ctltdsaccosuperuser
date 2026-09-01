"use client";

import { apiActions } from "@/tools/axios";

// View all audit logs
export const getAuditLogs = async (token, params = {}) => {
  const response = await apiActions?.get("/api/v1/auditlogs/", { ...token, params });
  return response?.data;
};
