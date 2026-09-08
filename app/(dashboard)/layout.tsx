'use client';

import React from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { AiChatDrawer } from '@/components/ai/AiChatDrawer';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
