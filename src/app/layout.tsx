import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gabinete Inteligente — GI",
  description: "SaaS de apoio administrativo, documental e juridico para municipios brasileiros."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
