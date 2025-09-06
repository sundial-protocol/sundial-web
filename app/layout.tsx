import type React from "react";
import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import CustomThemeProvider from "@/components/theme-provider";
import { cn } from "@/lib/utils";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-roboto",
  display: "swap",
});

const galanoGrotesque = localFont({
  src: [
    {
      path: "../public/fonts/GalanoGrotesqueRegular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/GalanoGrotesqueMedium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/GalanoGrotesqueBold.otf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-galano",
  display: "swap",
});

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
        url: "/SocialDefaultLogo.png",
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
    creator: "@sundialprotocol",
    description:
      "The first UTXO-native Layer 2 enabling secure, compliant Bitcoin yield generation at scale.",
    images: [
      {
        url: "/SocialDefaultLogo.png",
        width: 1200,
        height: 630,
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
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body
        className={cn(
          roboto.variable,
          galanoGrotesque.variable,
          "overflow-visible"
        )}
      >
        <CustomThemeProvider>
          <Navbar />
          <main className="pt-12">{children}</main>
          <Footer />
        </CustomThemeProvider>
      </body>
    </html>
  );
}
