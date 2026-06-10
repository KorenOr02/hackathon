import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Swaper Negotiator",
  description: "סוכן AI שמזהה עליות בחשבונות ומשיג הצעות טובות יותר",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="he" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
