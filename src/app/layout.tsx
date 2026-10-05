import type { Metadata } from "next";
import { Epilogue } from "next/font/google";
import "./globals.css";

const body = Epilogue({ variable: "--font-body", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Rent vs Buy",
  description: "Compare the long-term cost of renting and buying a home. Demo project with sample numbers.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${body.variable} antialiased`}>
      <body>{children}</body>
    </html>
  );
}
