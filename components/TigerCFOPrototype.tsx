"use client";

import { useMemo, useState } from "react";

export default function TigerCFOPrototype() {
  const nav = ["Home","Cash Command","Transactions","Reconciliations","Close","Reporting","AI Copilot","AR & Billing","Admin"];
  const [viewMode, setViewMode] = useState("landing");
  const [activePage, setActivePage] = useState("Home");
  const [selectedMonth, setSelectedMonth] = useState("March 2026");
  const [selectedEntity, setSelectedEntity] = useState("OG Prime Demo");
  const [selectedDepartment, setSelectedDepartment] = useState("All Departments");
  const [cashScenario, setCashScenario] = useState("Base Case");
  const [transactionFilter, setTransactionFilter] = useState("All Statuses");
  const [selectedAgent, setSelectedAgent] = useState("Cash Flow Agent");
  const [copilotPrompt, setCopilotPrompt] = useState("Why is cash tighter in Week 3 even though revenue is up?");
  const [reportingTab, setReportingTab] = useState("Board Pack");
  const [adminTab, setAdminTab] = useState("Approval Rules");

  const dashboardProfiles = {
    "March 2026|OG Prime Demo|All Departments": { kpis: [
      { label: "Cash on Hand", value: "$482,340", sub: "+$18,240 vs yesterday" },
      { label: "Open AR", value: "$126,900", sub: "18 invoices overdue" },
      { label: "Unreconciled Items", value: "47", sub: "12 high priority" },
      { label: "Close Status", value: "72%", sub: "8 of 11 tasks completed" },
    ]},
    "March 2026|Tiger Sports Demo|All Departments": { kpis: [
      { label: "Cash on Hand", value: "$221,740", sub: "+$4,180 vs yesterday" },
      { label: "Open AR", value: "$34,600", sub: "6 invoices overdue" },
      { label: "Unreconciled Items", value: "18", sub: "4 high priority" },
      { label: "Close Status", value: "76%", sub: "7 of 9 tasks completed" },
    ]},
  } as const;

  const kpis = dashboardProfiles[`${selectedMonth}|${selectedEntity}|${selectedDepartment}` as keyof typeof dashboardProfiles]?.kpis || dashboardProfiles["March 2026|OG Prime Demo|All Departments"].kpis;
  const pageMeta = useMemo(() => ({
    Home: { eyebrow: "Home Dashboard", title: "Good morning, Tony", subtitle: "Review flagged transactions, finish bank recs, and finalize management commentary." },
    "Cash Command": { eyebrow: "Cash Command", title: "Cash visibility and forecast control", subtitle: "Monitor liquidity and pressure weeks from one workspace." },
    Transactions: { eyebrow: "Transactions", title: "Review, code, and approve activity", subtitle: "Use agent-assisted review without losing approval discipline." },
    Reconciliations: { eyebrow: "Reconciliations", title: "Tie book to statement with audit-ready workflow", subtitle: "Surface exceptions, compare balances, and sign off cleanly." },
    Close: { eyebrow: "Close Management", title: "Run month-end with structure", subtitle: "Tasks, blockers, drafts, and approvals in one close board." },
    Reporting: { eyebrow: "Reporting", title: "Turn numbers into management insight", subtitle: "Move from financial data to narrative, variance, and decision support." },
    "AI Copilot": { eyebrow: "AI Copilot", title: "One finance interface, multiple specialized agents", subtitle: "Ask questions, inspect reasoning, and approve next actions with trust controls." },
    "AR & Billing": { eyebrow: "AR & Billing", title: "Protect collections and speed cash in", subtitle: "Track overdue balances, customer behavior, and reminder workflow." },
    Admin: { eyebrow: "Admin", title: "Permissions, integrations, and operating rules", subtitle: "Manage entities, users, mappings, and system controls." },
  }), []);

  const GlobalFilters = () => (
    <div className="grid gap-3 rounded-3xl border border-slate-800 bg-slate-900 p-4 md:grid-cols-3 xl:grid-cols-4">
      <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-200 outline-none"><option>March 2026</option><option>February 2026</option></select>
      <select value={selectedEntity} onChange={(e) => setSelectedEntity(e.target.value)} className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-200 outline-none"><option>OG Prime Demo</option><option>Tiger Sports Demo</option></select>
      <select value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)} className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-200 outline-none"><option>All Departments</option></select>
      <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">Live demo data changes KPIs and workflow context.</div>
    </div>
  );

  const Landing = () => (
    <div className="min-h-screen bg-slate-950 text-slate-100"><main className="mx-auto max-w-7xl px-8 py-12"><h1 className="text-5xl font-semibold">TigerCFO.ai</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-slate-400">The AI-powered controller platform for modern operators and finance teams.</p><button onClick={() => setViewMode("app")} className="mt-8 rounded-2xl bg-amber-400 px-5 py-4 text-sm font-medium text-slate-950">Open App Demo</button></main></div>
  );

  const AppShell = () => (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="flex min-h-screen">
        <aside className="w-72 border-r border-slate-800 bg-slate-900/70 backdrop-blur">
          <div className="border-b border-slate-800 p-6"><button onClick={() => setViewMode("landing")} className="text-left"><div className="text-xs uppercase tracking-[0.25em] text-amber-400">TigerCFO.ai</div><h1 className="mt-2 text-2xl font-semibold">Controller Command Center</h1></button></div>
          <nav className="p-4 space-y-1">{nav.map((item) => <button key={item} onClick={() => setActivePage(item)} className={`w-full rounded-2xl px-4 py-3 text-left text-sm transition ${activePage === item ? "bg-amber-400 font-medium text-slate-950" : "text-slate-300 hover:bg-slate-800"}`}>{item}</button>)}</nav>
        </aside>
        <main className="flex-1">
          <header className="border-b border-slate-800 bg-slate-950/80 px-8 py-5 backdrop-blur"><div className="text-xs uppercase tracking-[0.25em] text-slate-500">{pageMeta[activePage as keyof typeof pageMeta].eyebrow}</div><h2 className="mt-1 text-3xl font-semibold">{pageMeta[activePage as keyof typeof pageMeta].title}</h2><p className="mt-2 max-w-3xl text-sm text-slate-400">{pageMeta[activePage as keyof typeof pageMeta].subtitle}</p></header>
          <section className="space-y-6 p-8"><GlobalFilters /><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{kpis.map((kpi) => <div key={kpi.label} className="rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-xl shadow-black/10"><div className="text-sm text-slate-400">{kpi.label}</div><div className="mt-3 text-3xl font-semibold">{kpi.value}</div><div className="mt-2 text-sm text-emerald-400">{kpi.sub}</div></div>)}</div><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"><div className="rounded-3xl border border-slate-800 bg-slate-900 p-6"><div className="text-xs uppercase tracking-[0.2em] text-slate-500">Scenario</div><div className="mt-2 flex gap-2">{["Base Case","Downside","Delayed Collections"].map((item) => <button key={item} onClick={() => setCashScenario(item)} className={`rounded-2xl px-4 py-2 text-sm ${cashScenario === item ? "bg-amber-400 text-slate-950" : "border border-slate-700 text-slate-300"}`}>{item}</button>)}</div></div><div className="rounded-3xl border border-slate-800 bg-slate-900 p-6"><div className="text-xs uppercase tracking-[0.2em] text-slate-500">AI Agent</div><div className="mt-2 flex gap-2 flex-wrap">{["Cash Flow Agent","Transaction Review Agent","Close Agent","Variance Agent"].map((item) => <button key={item} onClick={() => setSelectedAgent(item)} className={`rounded-2xl px-4 py-2 text-sm ${selectedAgent === item ? "bg-amber-400 text-slate-950" : "border border-slate-700 text-slate-300"}`}>{item}</button>)}</div></div><div className="rounded-3xl border border-slate-800 bg-slate-900 p-6"><div className="text-xs uppercase tracking-[0.2em] text-slate-500">Quick Controls</div><div className="mt-2 flex gap-2 flex-wrap">{["All Statuses","Flagged","Approved"].map((item) => <button key={item} onClick={() => setTransactionFilter(item)} className={`rounded-2xl px-4 py-2 text-sm ${transactionFilter === item ? "bg-amber-400 text-slate-950" : "border border-slate-700 text-slate-300"}`}>{item}</button>)}</div></div></div><div className="rounded-3xl border border-slate-800 bg-slate-900 p-6"><div className="text-xs uppercase tracking-[0.2em] text-slate-500">AI Prompt</div><textarea value={copilotPrompt} onChange={(e) => setCopilotPrompt(e.target.value)} className="mt-3 min-h-[110px] w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-200 outline-none" /><div className="mt-4 flex gap-2 flex-wrap">{["Board Pack","P&L","Cash Flow","Variance"].map((item) => <button key={item} onClick={() => setReportingTab(item)} className={`rounded-2xl px-4 py-2 text-sm ${reportingTab === item ? "bg-amber-400 text-slate-950" : "border border-slate-700 text-slate-300"}`}>{item}</button>)}</div><div className="mt-4 flex gap-2 flex-wrap">{["Approval Rules","Routing","Alerts"].map((item) => <button key={item} onClick={() => setAdminTab(item)} className={`rounded-2xl px-4 py-2 text-sm ${adminTab === item ? "bg-amber-400 text-slate-950" : "border border-slate-700 text-slate-300"}`}>{item}</button>)}</div></div></section>
        </main>
      </div>
    </div>
  );

  return viewMode === "landing" ? <Landing /> : <AppShell />;
}