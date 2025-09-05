import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import CustomThemeProvider from "@/components/theme-provider";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sundial: Institutional Grade Bitcoin Infrastructure",
  description:
    "The first UTXO-native Layer 2 enabling secure, compliant Bitcoin yield generation at scale.",
  openGraph: {
    title: "Sundial: Institutional Grade Bitcoin Infrastructure",
    description:
      "The first UTXO-native Layer 2 enabling secure, compliant Bitcoin yield generation at scale.",
    url: `https://${process.env.NEXT_PUBLIC_SITE_URL}/`,
    siteName: "Sundial",
    images: [
      {
        url: "/logo_rd.png",
        width: 600,
        height: 600,
        alt: "Sundial Protocol",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  metadataBase: new URL(`https://${process.env.NEXT_PUBLIC_SITE_URL}`),
  twitter: {
    card: "summary_large_image",
    site: "@sundial",
    title: "Sundial: Institutional Grade Bitcoin Infrastructure",
    description:
      "The first UTXO-native Layer 2 enabling secure, compliant Bitcoin yield generation at scale.",
    images: [
      {
        url: "/logo_rd.png",
        width: 600,
        height: 600,
        alt: "Sundial Protocol",
      },
    ],
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
