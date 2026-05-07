import { Employee } from "../../types/employee";
import { PageHeader, PageSection } from "./shared";

export function EmployeesPage({ employees }: { employees: Employee[] }) {
  return <div className="space-y-6"><PageHeader title="Employees" subtitle="Employee records for payroll processing." /><PageSection title="Employee Directory">{employees.map((employee) => <div key={employee.id} className="mb-2 flex items-center justify-between rounded-lg border border-slate-100 p-3"><div><p className="font-medium text-slate-900">{employee.firstName} {employee.lastName}</p><p className="text-xs text-slate-500">{employee.payType} · {employee.state}</p></div></div>)}{employees.length === 0 && <p>No employees yet for selected company.</p>}</PageSection></div>;
}
