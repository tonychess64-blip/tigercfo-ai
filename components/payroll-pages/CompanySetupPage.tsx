import { Company } from "../../types/company";
import { PageHeader, PageSection } from "./shared";

export function CompanySetupPage({ companies }: { companies: Company[] }) { return <div className="space-y-6"><PageHeader title="Company Setup" subtitle="Configure payroll settings for your company." /><PageSection title="Configured Companies">{companies.map((company) => <div key={company.id} className="mb-2 rounded border border-slate-100 p-3"><p className="font-medium">{company.name}</p><p className="text-xs text-slate-500">{company.state} · {company.payFrequency}</p></div>)}{companies.length === 0 && <p>No companies configured yet.</p>}</PageSection></div>; }
