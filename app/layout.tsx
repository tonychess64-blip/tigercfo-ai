import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "TigerCFO.AI", description: "AI-driven CFO platform." };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
