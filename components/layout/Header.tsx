'use client';

import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, UserCheck } from 'lucide-react';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  backUrl?: string;
  backLabel?: string;
}

export function Header({ title = 'Cadence', subtitle = 'Weekly reporting & engineering insight' }: HeaderProps) {
  const { user, isManager, switchUser, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between min-h-[56px] px-5 bg-[#f3f2f2] border-b-2 border-ink/40">
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

      <div className="flex items-center gap-4">
        {/* Role / Session Switcher */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold tracking-wider uppercase text-slateText-subtle hidden sm:inline-block">
            Session Role:
          </span>
          <div className="flex border border-ink/40 bg-white">
            <button
              onClick={() => switchUser('alex')}
              className={`flex items-center gap-1.5 h-[28px] px-2.5 text-[12px] font-bold transition-colors ${
                !isManager ? 'bg-ink text-[#f3f2f2]' : 'bg-transparent text-ink hover:bg-[#eae9e9]'
              }`}
              title="Switch to Alex Chen (Team Member view)"
            >
              <span className="w-4 h-4 rounded-none bg-[#2563eb] text-white text-[9px] font-extrabold grid place-items-center">
                AC
              </span>
              <span>Alex (Member)</span>
            </button>
            <button
              onClick={() => switchUser('sarah')}
              className={`flex items-center gap-1.5 h-[28px] px-2.5 text-[12px] font-bold border-l border-ink/40 transition-colors ${
                isManager ? 'bg-ink text-[#f3f2f2]' : 'bg-transparent text-ink hover:bg-[#eae9e9]'
              }`}
              title="Switch to Sarah Kim (Manager view)"
            >
              <span className="w-4 h-4 rounded-none bg-[#ec3013] text-white text-[9px] font-extrabold grid place-items-center">
                SK
              </span>
              <span>Sarah (Manager)</span>
            </button>
          </div>
        </div>

        {/* Current Week Tag */}
        <div className="hidden md:flex items-center pl-3 border-l border-ink/20 text-[12px] font-semibold text-slateText-secondary font-mono">
          Week 37
        </div>

        {/* User Badge & Logout */}
        <div className="flex items-center gap-2 pl-3 border-l border-ink/20">
          <div
            className="w-7 h-7 text-white text-[11px] font-extrabold grid place-items-center"
            style={{ backgroundColor: user?.avatarColor || '#ec3013' }}
          >
            {user?.fullName
              ?.split(' ')
              .map((n) => n[0])
              .join('')
              .slice(0, 2)
              .toUpperCase() || 'U'}
          </div>
          <button
            onClick={logout}
            className="p-1 text-slateText-secondary hover:text-accent transition-colors"
            title="Sign out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
