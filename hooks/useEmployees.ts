"use client";

import { useEffect, useState } from "react";
import { Employee } from "../types/employee";
import { fetchEmployees } from "../services/apiClient";

export function useEmployees(companyId: string | null) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!companyId) {
      setEmployees([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetchEmployees(companyId).then(setEmployees).finally(() => setLoading(false));
  }, [companyId]);

  return { employees, loading };
}
