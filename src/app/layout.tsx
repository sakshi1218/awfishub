import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import AppLayout from '@/components/layout/AppLayout';

export const metadata: Metadata = {
  title: 'AWSFISHUB | Business Management Platform',
  description: 'A unified workspace for organization, operations, learning, sales, and administration.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen">
        <AuthProvider>
          <AppLayout>{children}</AppLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
