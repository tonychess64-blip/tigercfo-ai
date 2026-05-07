"use client";

import { useEffect, useState } from "react";
import { Company } from "../types/company";
import { createCompany, fetchCompanies } from "../services/apiClient";

export function useCompanies() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompanies().then(setCompanies).finally(() => setLoading(false));
  }, []);

  async function addCompany(input: Omit<Company, "id">) {
    const company = await createCompany(input);
    setCompanies((prev) => [...prev, company]);
    return company;
  }

  return { companies, loading, addCompany };
}
