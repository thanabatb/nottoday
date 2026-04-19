import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { AppStateProvider } from "@/components/app-state-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Not Today",
  description:
    "A playful emotional reset app for quick check-ins, safe release rituals, reflection, and progress tracking.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body>
        <AppStateProvider>{children}</AppStateProvider>
        <Analytics />
      </body>
    </html>
  );
}
