import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BlockLedger",
  description: "Offline-first block yard operations",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
