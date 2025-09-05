import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import CustomThemeProvider from "@/components/theme-provider";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

// Example for app/page.tsx or any page file

export const metadata: Metadata = {
  title: "Sundial",
  description: "Unlocking Bitcoin Defi",
  openGraph: {
    title: "Sundial",
    description: "Unlocking Bitcoin Defi",
    url: `https://${process.env.NEXT_PUBLIC_SITE_URL}/`,
    siteName: "Sundial",
    images: [
      {
        url: "/sundial-text-logo.png",
        width: 1200,
        height: 630,
        alt: "Sundial Protocol",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <body className={cn(inter.className, "overflow-visible")}>
        <CustomThemeProvider>
          <Navbar />
          <main className="pt-12">{children}</main>
          <Footer />
        </CustomThemeProvider>
      </body>
    </html>
  );
}
