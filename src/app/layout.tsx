import type { Metadata } from "next";
import "./globals.css";
import ConditionalNavbar from "@/components/ConditionalNavbar";
import ConditionalFooter from "@/components/ConditionalFooter";
import PageTransition from "@/components/PageTransition";
import { AuthProvider } from "@/hooks/useAuth";
import { CompanyProvider } from "@/contexts/CompanyContext";
import { COMPANY_CONFIG } from "@/lib/companyConfig";

export const metadata: Metadata = {
  title: `${COMPANY_CONFIG.name} - Luxury Furniture`,
  description:
    `Discover timeless elegance with ${COMPANY_CONFIG.name}. ${COMPANY_CONFIG.tagline}.`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body suppressHydrationWarning className="overflow-x-hidden">
        <CompanyProvider>
          <AuthProvider>
            <ConditionalNavbar />
            <div className="overflow-x-hidden w-full">
              <main>
                <PageTransition>
                  {children}
                </PageTransition>
              </main>
              <ConditionalFooter />
            </div>
          </AuthProvider>
        </CompanyProvider>
      </body>
    </html>
  );
}
