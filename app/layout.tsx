import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import CustomThemeProvider from "@/components/theme-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sundial (Dev)",
  description: "Unlocking Bitcoin Defi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <CustomThemeProvider>
          <Navbar />
          <main className="pt-12">{children}</main>
          <Footer />
        </CustomThemeProvider>
      </body>
    </html>
  );
}
