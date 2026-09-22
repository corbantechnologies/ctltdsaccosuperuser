"use client";

import { apiActions } from "@/tools/axios";

export const getReferenceIntegrity = async (token) => {
  const response = await apiActions?.get("/api/v1/financials/reference-integrity/", token);
  return response?.data;
};

export const repairReferenceIntegrity = async (token) => {
  const response = await apiActions?.post("/api/v1/financials/reference-integrity/fix/", {}, token);
  return response?.data;
};
