import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ruang Fokus — Studi Performa Kognitif",
  description:
    "Tes singkat performa kognitif belajar saat mendengarkan musik instrumental dan musik berlirik.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
