"use client";

import { ThemeProvider } from "next-themes";
import { useState, useEffect } from "react";

export default function CustomThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <>{children}</>; // Render children without ThemeProvider during SSR
  }

  return (
    <ThemeProvider attribute="class" enableSystem={true} defaultTheme="dark">
      {children}
    </ThemeProvider>
  ); // Wrap children with ThemeProvider after mount
}
