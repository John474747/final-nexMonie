import type { Metadata, Viewport } from 'next';

export const runtime = 'edge';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AuthGuard } from '@/components/auth/AuthGuard';

export const metadata: Metadata = {
  title: 'nex Monie | Elite Financial Command Center',
  description: 'Experience the future of bespoke banking with nex Monie. Smart, fast, and secure.',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-background text-foreground pb-safe overflow-x-hidden">
        <AuthGuard>
          {children}
        </AuthGuard>
        <Toaster />
      </body>
    </html>
  );
}
