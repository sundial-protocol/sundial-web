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
  title: "Sundial",
  description: "Unlocking Bitcoin Defi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
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
