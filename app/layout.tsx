import type { Metadata, Viewport } from "next";
import "@fontsource-variable/inter";

import { Toaster } from "@/components/ui/sonner";

import "./globals.css";

export const metadata: Metadata = {
  title: "Ilmo",
  description: "QR-pohjainen tilojen vikailmoituspalvelu",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fi" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
