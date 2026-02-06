import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
import { Toaster } from "@/components/ui/toast";
import { SWRProvider } from "@/components/providers/swr-provider";
import { ServiceWorkerRegistration } from "@/components/pwa/service-worker-registration";
import { InstallPrompt } from "@/components/pwa/install-prompt";
import { AuthStateListener } from "@/components/auth/auth-state-listener";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Guess Who - Multiplayer Guessing Game",
  description:
    "A fun multiplayer guessing game where players identify people from photos",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Guess Who",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: "Guess Who - Multiplayer Guessing Game",
    description:
      "A fun multiplayer guessing game where players identify people from photos",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased`}>
        <ServiceWorkerRegistration />
        <AuthStateListener />
        <Toaster />
        <SWRProvider>
          <Suspense>{children}</Suspense>
        </SWRProvider>
        <InstallPrompt />
      </body>
    </html>
  );
}
