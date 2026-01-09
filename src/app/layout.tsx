import type { Metadata } from "next";
import "./globals.css";
import ConditionalNavbar from "@/components/ConditionalNavbar";
import ConditionalFooter from "@/components/ConditionalFooter";
import PageTransition from "@/components/PageTransition";
import FirebaseStatus from "@/components/FirebaseStatus";
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
      <body suppressHydrationWarning>
        <CompanyProvider>
          <AuthProvider>
            <ConditionalNavbar />
            <main className="pt-20">
              <PageTransition>
                {children}
              </PageTransition>
            </main>
            <ConditionalFooter />
            <FirebaseStatus />
          </AuthProvider>
        </CompanyProvider>
      </body>
    </html>
  );
}
