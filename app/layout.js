import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider.js";
import { AuthProvider } from "@/components/providers/AuthProvider.js";
import { AppShell } from "@/components/layout/AppShell.js";
import { ToastProvider } from "@/components/shared/Toast.js";

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
            <ToastProvider>
                <AppShell>{children}</AppShell>
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
