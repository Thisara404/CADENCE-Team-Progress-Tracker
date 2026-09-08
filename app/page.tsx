'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const router = useRouter();
  const { isManager } = useAuth();

  useEffect(() => {
    if (isManager) {
      router.replace('/dashboard');
    } else {
      router.replace('/reports/new');
    }
  }, [isManager, router]);

  return (
    <div className="min-h-screen grid place-items-center bg-[#f3f2f2] text-xs font-mono">
      Redirecting to Cadence workspace...
    </div>
  );
}
