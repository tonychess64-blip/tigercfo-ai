export type PayrollPage =
  | "Dashboard"
  | "Employees"
  | "Run Payroll"
  | "Payroll History"
  | "Benefits"
  | "Garnishments"
  | "Tax Documents"
  | "Tax Liabilities"
  | "Company Setup";

export const payrollNavItems: PayrollPage[] = [
  "Dashboard",
  "Employees",
  "Run Payroll",
  "Payroll History",
  "Benefits",
  "Garnishments",
  "Tax Documents",
  "Tax Liabilities",
  "Company Setup",
];

export const dashboardKpis = [
  { label: "Next Payroll", value: "May 15, 2026", sub: "Semi-monthly run" },
  { label: "Active Employees", value: "84", sub: "3 onboarding" },
  { label: "Pending Approvals", value: "6", sub: "2 high priority" },
  { label: "Tax Notices", value: "1", sub: "California EDD" },
];

export const upcomingRuns = [
  { payrollGroup: "Corporate", payPeriod: "May 1 - May 15", payDate: "May 15, 2026", status: "Ready" },
  { payrollGroup: "Operations", payPeriod: "May 1 - May 15", payDate: "May 15, 2026", status: "Needs Review" },
  { payrollGroup: "Hourly Staff", payPeriod: "May 4 - May 10", payDate: "May 13, 2026", status: "Draft" },
];

export const employees = [
  { name: "Avery Smith", role: "Controller", location: "Austin, TX", status: "Active" },
  { name: "Jordan Lee", role: "Payroll Manager", location: "Denver, CO", status: "Active" },
  { name: "Sam Patel", role: "Warehouse Lead", location: "Phoenix, AZ", status: "Leave" },
];
