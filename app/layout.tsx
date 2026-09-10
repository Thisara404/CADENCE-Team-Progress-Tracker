import './globals.css';
import type { Metadata } from 'next';
import { AuthProvider } from '@/context/AuthContext';
import { SWRProvider } from '@/components/providers/SWRProvider';
import { MobileRestriction } from '@/components/ui/MobileRestriction';

export const metadata: Metadata = {
  title: 'Cadence — Weekly Report Generator & Team Dashboard',
  description: 'Enterprise multi-user weekly reporting, review-correction workflow, and engineering analytics dashboard.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-[#f3f2f2] text-ink antialiased" suppressHydrationWarning>
        {/* Mobile View Disabler Screen */}
        <MobileRestriction />

        {/* Desktop Experience Container */}
        <div className="hidden lg:block min-h-screen">
          <AuthProvider>
            <SWRProvider>
              {children}
            </SWRProvider>
          </AuthProvider>
        </div>
      </body>
    </html>
  );
}
