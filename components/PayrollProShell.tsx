"use client";

import { useMemo, useState } from "react";
import { PayrollPage, payrollNavItems } from "./payrollProData";
import { DashboardPage } from "./payroll-pages/DashboardPage";
import { EmployeesPage } from "./payroll-pages/EmployeesPage";
import { RunPayrollPage } from "./payroll-pages/RunPayrollPage";
import { PayrollHistoryPage } from "./payroll-pages/PayrollHistoryPage";
import { BenefitsPage } from "./payroll-pages/BenefitsPage";
import { GarnishmentsPage } from "./payroll-pages/GarnishmentsPage";
import { TaxDocumentsPage } from "./payroll-pages/TaxDocumentsPage";
import { TaxLiabilitiesPage } from "./payroll-pages/TaxLiabilitiesPage";
import { CompanySetupPage } from "./payroll-pages/CompanySetupPage";
import { useCompanies } from "../hooks/useCompanies";
import { useEmployees } from "../hooks/useEmployees";

export default function PayrollProShell() {
  const [activePage, setActivePage] = useState<PayrollPage>("Dashboard");
  const { companies, loading: companiesLoading } = useCompanies();
  const activeCompanyId = companies[0]?.id ?? null;
  const { employees, loading: employeesLoading } = useEmployees(activeCompanyId);

  const pageMap: Record<PayrollPage, JSX.Element> = useMemo(() => ({
    Dashboard: <DashboardPage />,
    Employees: employeesLoading ? <p>Loading employees...</p> : <EmployeesPage employees={employees} />,
    "Run Payroll": <RunPayrollPage />,
    "Payroll History": <PayrollHistoryPage />,
    Benefits: <BenefitsPage />,
    Garnishments: <GarnishmentsPage />,
    "Tax Documents": <TaxDocumentsPage />,
    "Tax Liabilities": <TaxLiabilitiesPage />,
    "Company Setup": companiesLoading ? <p>Loading companies...</p> : <CompanySetupPage companies={companies} />,
  }), [companies, companiesLoading, employees, employeesLoading]);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex min-h-screen">
        <aside className="w-72 border-r border-slate-200 bg-white">
          <div className="border-b border-slate-200 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-600">PayrollPro</p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-900">Payroll Console</h1>
            <p className="mt-2 text-sm text-slate-500">Persistence-backed shell</p>
          </div>
          <nav className="space-y-1 p-4">
            {payrollNavItems.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setActivePage(item)}
                className={`w-full rounded-xl px-4 py-3 text-left text-sm transition ${
                  activePage === item
                    ? "bg-sky-600 font-medium text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {item}
              </button>
            ))}
          </nav>
        </aside>

        <main className="flex-1 p-8">{pageMap[activePage]}</main>
      </div>
    </div>
  );
}
