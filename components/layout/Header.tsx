'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  backUrl?: string;
  backLabel?: string;
}

export function Header({ title = 'Cadence', subtitle = 'Weekly reporting & engineering insight' }: HeaderProps) {
  const { user, role } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-[56px] min-h-[56px] max-h-[56px] px-5 bg-[#f3f2f2] border-b-2 border-ink/40 box-border">
      <div className="flex items-center gap-3">
        <div className="flex flex-col">
          <h2 className="text-[15px] font-extrabold tracking-tight text-ink m-0 uppercase">
            {title}
          </h2>
          <span className="text-[11.5px] text-slateText-muted">
            {subtitle}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {/* Authenticated User Status (Read-Only - Role is strictly based on AUTH) */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10.5px] font-mono font-bold tracking-wider uppercase px-2.5 py-1 bg-white border border-ink/40 text-ink shadow-[1px_1px_0px_rgba(0,0,0,0.15)]">
            {role ? role.replace('_', ' ') : 'USER'}
          </span>
          <span className="hidden sm:inline text-xs font-bold text-ink truncate max-w-[150px]">
            {user?.fullName}
          </span>
        </div>

        {/* Current Week Tag */}
        <div className="hidden md:flex items-center pl-3 border-l border-ink/20 text-[12px] font-semibold text-slateText-secondary font-mono">
          Week 37
        </div>

        {/* User Profile Avatar Link to Settings */}
        <div className="flex items-center pl-3 border-l border-ink/20">
          <Link
            href="/settings"
            className="w-7 h-7 text-white text-[11px] font-extrabold grid place-items-center hover:opacity-90 transition-opacity border border-ink/30 shadow-[1px_1px_0px_rgba(0,0,0,0.2)]"
            style={{ backgroundColor: user?.avatarColor || '#ec3013' }}
            title="Profile & Settings"
          >
            {user?.fullName
              ?.split(' ')
              .map((n) => n[0])
              .join('')
              .slice(0, 2)
              .toUpperCase() || 'U'}
          </Link>
        </div>
      </div>
    </header>
  );
}
