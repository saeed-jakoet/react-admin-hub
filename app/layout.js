import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider.js";
import { AuthProvider } from "@/components/providers/AuthProvider.js";
import { AppShell } from "@/components/layout/AppShell.js";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Fibre Command Center",
  description: "Mission-critical command center for fibre infrastructure operations",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider defaultTheme="system" storageKey="fibre-admin-theme">
          <AuthProvider>
            <AppShell>{children}</AppShell>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
