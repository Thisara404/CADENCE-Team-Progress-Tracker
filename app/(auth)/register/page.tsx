'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Lock, ShieldCheck } from 'lucide-react';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f3f2f2] p-6">
      <div className="max-w-md w-full p-8 bg-white border-2 border-ink/40 shadow-sm flex flex-col gap-5 text-center">
        <div className="w-12 h-12 bg-[#fee2e2] text-[#991b1b] grid place-items-center mx-auto border border-[#991b1b]/30">
          <Lock size={22} />
        </div>

        <div>
          <span className="text-[11px] font-bold tracking-widest uppercase text-slateText-muted">
            Access Restricted
          </span>
          <h1 className="text-2xl font-black text-ink mt-1">
            Sign-up is Disabled
          </h1>
          <p className="text-xs text-slateText-secondary mt-2 leading-relaxed">
            Cadence does not permit self-registration. All user accounts must be created and provisioned directly by an Administrator with an assigned role and password.
          </p>
        </div>

        <div className="p-3.5 bg-[#f8f7f7] border border-ink/20 text-xs text-left flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5 font-bold text-ink text-[11px] uppercase tracking-wider">
            <ShieldCheck size={14} className="text-accent" />
            <span>How to get access</span>
          </div>
          <span className="text-slateText-secondary text-[11.5px] leading-relaxed">
            Please reach out to your team’s workspace administrator. Administrators can create your account with your initial password in the <b>Users & Roles</b> management console.
          </span>
        </div>

        <Link
          href="/login"
          className="h-10 bg-ink text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-black transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Return to Workspace Sign in</span>
        </Link>
      </div>
    </div>
  );
}
