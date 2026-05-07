import { dashboardKpis, upcomingRuns } from "../payrollProData";
import { PageHeader, PageSection } from "./shared";

export function DashboardPage() {
  return <div className="space-y-6"><PageHeader title="Dashboard" subtitle="Monitor payroll readiness across your organization." />
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{dashboardKpis.map((kpi)=> <div key={kpi.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">{kpi.label}</p><p className="mt-2 text-2xl font-semibold">{kpi.value}</p><p className="mt-1 text-xs text-emerald-600">{kpi.sub}</p></div>)}</div>
    <PageSection title="Upcoming Payroll Runs"><table className="w-full text-left"><thead><tr className="text-xs uppercase text-slate-500"><th>Group</th><th>Period</th><th>Pay Date</th><th>Status</th></tr></thead><tbody>{upcomingRuns.map((run)=><tr key={run.payrollGroup} className="border-t"><td className="py-2">{run.payrollGroup}</td><td>{run.payPeriod}</td><td>{run.payDate}</td><td>{run.status}</td></tr>)}</tbody></table></PageSection>
  </div>;
}
