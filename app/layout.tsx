import { getDatabase } from "../db/sqliteAdapter";
import "./globals.css";

export const metadata = {
  title: "PayrollPro Desktop",
  description: "React + TypeScript shell for PayrollPro",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build";
  if (!isBuildPhase) {
    getDatabase();
  }
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
