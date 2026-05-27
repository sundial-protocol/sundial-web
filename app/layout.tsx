import type React from "react";
import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import CustomThemeProvider from "@/components/theme-provider";
import { cn } from "@/lib/utils";
import { WalletProvider } from "@/components/wallet-provider";
import type { Viewport } from "next";
import { ToastProvider } from "@/components/ui/toast";

// for mobile
export const viewport: Viewport = {
  themeColor: "white",
  width: "device-width", // Matches the viewport width to the device's screen width
  initialScale: 1, // Sets the initial zoom level to 100%
  maximumScale: 1, // Prevents user from zooming out
};

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

const title = "Sundial: Institutional Grade Bitcoin Infrastructure";
const description =
  "Sundial is the first Layer-2 to natively unlock and put trillions of dollars of Bitcoin to work through smart contracts and yield generation.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
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
    title,
    creator: "@sundialprotocol",
    description,
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="canonical" href="https://sundialprotocol.com"></link>
      </head>
      <body className={cn(roboto.variable, galanoGrotesque.variable)}>
        <WalletProvider>
          <CustomThemeProvider>
            <ToastProvider>
              <Navbar />
              <main className="pt-24">{children}</main>
              <Footer />
            </ToastProvider>
          </CustomThemeProvider>
        </WalletProvider>
      </body>
    </html>
  );
}
