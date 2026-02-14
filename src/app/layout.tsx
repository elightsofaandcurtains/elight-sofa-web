import type { Metadata, Viewport } from "next";
import "./globals.css";
import ConditionalNavbar from "@/components/ConditionalNavbar";
import ConditionalFooter from "@/components/ConditionalFooter";
import PageTransition from "@/components/PageTransition";
import { AuthProvider } from "@/hooks/useAuth";
import { CompanyProvider } from "@/contexts/CompanyContext";
import { COMPANY_CONFIG } from "@/lib/companyConfig";

export const metadata: Metadata = {
  title: `${COMPANY_CONFIG.name} - Luxury Furniture & Interiors`,
  description: `Premium furniture and interior solutions. Browse luxury sofas, chairs, tables, bedroom furniture, and custom curtains. ${COMPANY_CONFIG.tagline}.`,
  applicationName: COMPANY_CONFIG.name,
  authors: [{ name: COMPANY_CONFIG.owner.name }],
  generator: 'Next.js',
  keywords: ['furniture', 'sofa', 'luxury furniture', 'interior design', 'custom curtains', 'chairs', 'tables', 'bedroom furniture', 'Surat furniture', 'premium furniture'],
  referrer: 'origin-when-cross-origin',
  creator: COMPANY_CONFIG.owner.name,
  publisher: COMPANY_CONFIG.name,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://elight-sofa-web.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: `${COMPANY_CONFIG.name} - Luxury Furniture & Interiors`,
    description: 'Premium furniture and interior solutions. Browse luxury sofas, chairs, tables, bedroom furniture, and custom curtains.',
    url: 'https://elight-sofa-web.vercel.app',
    siteName: COMPANY_CONFIG.name,
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/icons/icon-512x512.png',
        width: 512,
        height: 512,
        alt: `${COMPANY_CONFIG.name} Logo`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${COMPANY_CONFIG.name} - Luxury Furniture`,
    description: 'Premium furniture and interior solutions',
    images: ['/icons/icon-512x512.png'],
  },
  appleWebApp: {
    capable: true,
    title: 'Elight Sofa',
    statusBarStyle: 'black-translucent',
    startupImage: [
      {
        url: '/icons/apple-splash-2048-2732.png',
        media: '(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)',
      },
      {
        url: '/icons/apple-splash-1668-2388.png',
        media: '(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2)',
      },
      {
        url: '/icons/apple-splash-1536-2048.png',
        media: '(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2)',
      },
      {
        url: '/icons/apple-splash-1125-2436.png',
        media: '(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)',
      },
      {
        url: '/icons/apple-splash-1242-2688.png',
        media: '(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)',
      },
      {
        url: '/icons/apple-splash-750-1334.png',
        media: '(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)',
      },
      {
        url: '/icons/apple-splash-640-1136.png',
        media: '(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)',
      },
    ],
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/icons/safari-pinned-tab.svg',
        color: '#D4AF37',
      },
    ],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#D4AF37' },
    { media: '(prefers-color-scheme: dark)', color: '#2D2926' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* PWA Meta Tags */}
        <meta name="application-name" content="Elight Sofa House" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Elight Sofa" />

        {/* MS Tiles */}
        <meta name="msapplication-TileColor" content="#D4AF37" />
        <meta name="msapplication-TileImage" content="/icons/icon-144x144.png" />
        <meta name="msapplication-config" content="/browserconfig.xml" />

        {/* Additional Apple Touch Icons */}
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="144x144" href="/icons/icon-144x144.png" />
        <link rel="apple-touch-icon" sizes="120x120" href="/icons/icon-128x128.png" />

        {/* Favicon */}
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png" />
        <link rel="shortcut icon" href="/favicon.ico" />

        {/* Safari Pinned Tab */}
        <link rel="mask-icon" href="/icons/safari-pinned-tab.svg" color="#D4AF37" />

        {/* Prevent zoom on input focus (iOS) */}
        <meta name="format-detection" content="telephone=no" />
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
