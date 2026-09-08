'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { AiChatDrawer } from '@/components/ai/AiChatDrawer';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !token && !user) {
      router.push('/login');
    }
  }, [isLoading, token, user, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen grid place-items-center bg-[#f3f2f2]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent animate-spin" />
          <span className="text-xs font-mono font-bold text-ink uppercase tracking-wider">
            Loading Cadence...
          </span>
        </div>
      </div>
    );
  }

  if (!user && !token) {
    return null;
  }

  return (
    <div className="min-h-screen flex bg-[#f3f2f2]">
      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-5 min-w-0 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>

      {/* Floating AI Assistant Drawer for Managers */}
      <AiChatDrawer />
    </div>
  );
}
