'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  FileText,
  History,
  FolderGit2,
  Users,
  ShieldAlert,
  LogOut,
  PlusCircle,
  Settings,
} from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, role, isAdmin, isManager, logout } = useAuth();

  const adminNav = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Team Reports', href: '/reports/history', icon: History },
    { label: 'Weekly Blockers', href: '/manager/blockers', icon: ShieldAlert },
    { label: 'Projects', href: '/projects', icon: FolderGit2 },
    { label: 'Users & Roles', href: '/admin/users', icon: Users },
    { label: 'Profile & Settings', href: '/settings', icon: Settings },
  ];

  const managerNav = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Team Reports', href: '/reports/history', icon: History },
    { label: 'Weekly Blockers', href: '/manager/blockers', icon: ShieldAlert },
    { label: 'Projects', href: '/projects', icon: FolderGit2 },
    { label: 'Users & Roles', href: '/admin/users', icon: Users },
    { label: 'Profile & Settings', href: '/settings', icon: Settings },
  ];

  const memberNav = [
    { label: 'Weekly Report', href: '/reports/new', icon: PlusCircle },
    { label: 'My History', href: '/reports/history', icon: History },
    { label: 'Projects', href: '/projects', icon: FolderGit2 },
    { label: 'Profile & Settings', href: '/settings', icon: Settings },
  ];

  const navItems = isAdmin ? adminNav : isManager ? managerNav : memberNav;

  return (
    <aside className="w-[230px] flex-shrink-0 bg-[#f3f2f2] border-r-2 border-ink/40 flex flex-col h-screen sticky top-0">
      {/* Brand Header - exact 56px height to match Header.tsx */}
      <div className="h-[56px] min-h-[56px] max-h-[56px] flex items-center gap-2.5 px-4 border-b-2 border-ink/40 box-border shrink-0">
        <span className="w-6 h-6 bg-accent text-[#f3f2f2] font-black text-xs grid place-items-center tracking-tighter shrink-0">
          C
        </span>
        <div className="flex flex-col leading-none">
          <span className="font-black text-sm tracking-widest uppercase text-ink leading-tight">
            CADENCE
          </span>
          <span className="text-[10px] text-slateText-muted uppercase tracking-wider leading-tight">
            Acme Engineering
          </span>
        </div>
      </div>

      {/* Nav Group Label */}
      <div className="px-4 pt-4 pb-1 text-[10.5px] font-bold tracking-widest uppercase text-slateText-subtle">
        {isAdmin ? 'Admin Portal' : isManager ? 'Manager View' : 'My Week'}
      </div>

      {/* Navigation Links */}
      <nav className="flex flex-col gap-0.5 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 h-[38px] px-3 text-[13px] font-medium transition-colors border-l-2 ${
                isActive
                  ? 'bg-ink text-[#f3f2f2] font-bold border-accent'
                  : 'bg-transparent text-ink hover:bg-[#eae9e9] border-transparent'
              }`}
            >
              <Icon size={16} className={isActive ? 'text-accent' : 'text-slateText-secondary'} />
              <span className="flex-1 truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="flex-1" />

      {/* User Footer */}
      <div className="p-3 border-t-2 border-ink/40 flex flex-col gap-2">
        <Link href="/settings" className="flex items-center gap-2.5 group cursor-pointer" title="View Profile & Settings">
          <div
            className="w-7 h-7 text-white text-[11px] font-extrabold grid place-items-center flex-shrink-0 group-hover:ring-2 group-hover:ring-accent transition-all"
            style={{ backgroundColor: user?.avatarColor || '#2563eb' }}
          >
            {user?.fullName
              ?.split(' ')
              .map((n) => n[0])
              .join('')
              .slice(0, 2)
              .toUpperCase() || 'U'}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[12.5px] font-bold text-ink truncate leading-snug group-hover:text-accent transition-colors">
              {user?.fullName}
            </span>
            <span className="text-[10.5px] text-slateText-muted truncate">
              {user?.title || user?.role}
            </span>
          </div>
        </Link>

        <button
          onClick={() => {
            logout();
            router.push('/login');
          }}
          className="flex items-center gap-1.5 text-[11.5px] text-slateText-secondary hover:text-accent transition-colors pt-1"
        >
          <LogOut size={13} />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}
