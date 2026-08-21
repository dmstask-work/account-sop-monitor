import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter, Inter_Tight } from "next/font/google";
import sopLogo from "@/assets/SOP.png";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const interTight = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sales Performance Report | PT Bhakti Manusia Indonesia",
  description:
    "Dashboard performa penjualan PT Bhakti Manusia Indonesia — revenue, target, dan sesi per sales.",
  icons: {
    icon: sopLogo.src,
  },
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="id">
      <body className={`${inter.variable} ${interTight.variable}`}>
        {children}
      </body>
    </html>
  );
}