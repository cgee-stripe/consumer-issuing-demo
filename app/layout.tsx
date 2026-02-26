import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ApiLoggerProvider } from "@/context/ApiLoggerContext";
import { CustomizationProvider } from "@/context/CustomizationContext";
import { ApiConsole } from "@/components/layout/ApiConsole";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Credit Card Portal",
  description: "Manage your credit card with Stripe Issuing",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <CustomizationProvider>
          <ApiLoggerProvider>
            <div className="flex h-screen">
              {/* Sidebar - Hidden on mobile */}
              <aside className="hidden md:block w-64 flex-shrink-0">
                <Sidebar />
              </aside>

              {/* Main Content */}
              <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto bg-gray-50 scrollbar-thin">
                  {children}
                </main>
              </div>
            </div>

            {/* API Console - Always present */}
            <ApiConsole />
          </ApiLoggerProvider>
        </CustomizationProvider>
      </body>
    </html>
  );
}
