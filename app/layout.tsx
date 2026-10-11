import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Trevos Assistant",
  description:
    "AI-powered customer support and lead management by Trevos Hub & Services Limited.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}