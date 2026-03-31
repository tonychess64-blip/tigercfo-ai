import "./globals.css";

export const metadata = {
  title: "TigerCFO.AI",
  description: "AI-driven CFO, controller, systems, dashboards, and finance transformation.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
