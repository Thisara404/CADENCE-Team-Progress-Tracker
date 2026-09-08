'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ArrowRight, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, switchUser } = useAuth();

  const [email, setEmail] = useState('manager@company.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'manager' | 'member'>('manager');

  const handleQuickPick = (role: 'manager' | 'member') => {
    setSelectedRole(role);
    if (role === 'manager') {
      setEmail('manager@company.com');
      setPassword('password123');
      switchUser('sarah');
    } else {
      setEmail('alex@company.com');
      setPassword('password123');
      switchUser('alex');
    }
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) {
      setError('Please enter a valid work email.');
      return;
    }
    setIsLoading(true);
    setError('');

    try {
      await login(email, password);
      router.push(selectedRole === 'manager' ? '/dashboard' : '/reports/new');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-[#f3f2f2]">
      {/* Left Form Column */}
      <div className="flex flex-col justify-between p-8 sm:p-12 border-r-2 border-ink/40">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 bg-accent text-white font-black text-xs grid place-items-center">
            C
          </span>
          <span className="font-extrabold text-sm tracking-widest uppercase text-ink">
            CADENCE
          </span>
        </div>

        <div className="max-w-md w-full flex flex-col gap-6 my-auto">
          <div>
            <span className="text-[11px] font-bold tracking-widest uppercase text-slateText-muted">
              Weekly Reporting
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-ink tracking-tight mt-1 mb-2">
              Sign in to Cadence
            </h1>
            <p className="text-sm text-slateText-secondary">
              Weekly reports, correction cycles, and team insight for engineering organizations.
            </p>
          </div>

          <div className="h-0.5 bg-ink/20" />

          {/* Quick Demo Role Picker */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slateText-subtle">
              Quick select demo profile:
            </span>
            <div className="grid grid-cols-2 border border-ink/40 bg-white">
              <button
                type="button"
                onClick={() => handleQuickPick('manager')}
                className={`p-2.5 text-left border-r border-ink/40 transition-colors ${
                  selectedRole === 'manager' ? 'bg-ink text-white font-bold' : 'text-ink hover:bg-[#eae9e9]'
                }`}
              >
                <div className="text-xs font-black">Sarah Kim</div>
                <div className="text-[10.5px] opacity-75">Manager (Full review access)</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickPick('member')}
                className={`p-2.5 text-left transition-colors ${
                  selectedRole === 'member' ? 'bg-ink text-white font-bold' : 'text-ink hover:bg-[#eae9e9]'
                }`}
              >
                <div className="text-xs font-black">Alex Chen</div>
                <div className="text-[10.5px] opacity-75">Team Member (Report author)</div>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold uppercase tracking-wider text-ink">
                Work email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                className="h-10 px-3 bg-white border border-ink/40 text-sm focus:border-accent"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold uppercase tracking-wider text-ink">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-10 px-3 bg-white border border-ink/40 text-sm focus:border-accent"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-2.5 bg-accent-tint border-l-2 border-accent text-accent-hover text-xs font-medium">
                <AlertCircle size={14} />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="h-11 bg-accent text-white font-black text-sm flex items-center justify-center gap-2 hover:bg-accent-hover transition-colors shadow-sm"
            >
              <span>{isLoading ? 'Signing in...' : 'Sign in to workspace'}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          <p className="text-xs text-slateText-secondary">
            Don’t have an account?{' '}
            <Link href="/register" className="font-bold underline text-ink">
              Create an account
            </Link>
          </p>
        </div>

        <p className="text-[11px] text-slateText-muted mt-8">
          Cadence v1.0.0 — Production Build with PostgreSQL & Prisma.
        </p>
      </div>

      {/* Right Visual Teaser Column */}
      <div className="hidden md:flex flex-col justify-center p-12 bg-[#eae9e9] gap-8">
        <div>
          <span className="text-xs font-bold tracking-widest uppercase text-slateText-muted font-mono">
            Week 37 · Acme Engineering
          </span>
          <h2 className="text-2xl font-black text-ink mt-2">
            Engineered for high-performing engineering teams
          </h2>
        </div>

        <div className="grid grid-cols-2 border-t-2 border-l-2 border-ink/40 bg-[#f3f2f2]">
          <div className="p-5 border-r-2 border-b-2 border-ink/40 flex flex-col gap-1">
            <span className="text-4xl font-black text-accent font-mono">82%</span>
            <span className="text-xs text-slateText-secondary font-medium">
              Compliance rate this week
            </span>
          </div>

          <div className="p-5 border-r-2 border-b-2 border-ink/40 flex flex-col gap-1">
            <span className="text-4xl font-black text-ink font-mono">14</span>
            <span className="text-xs text-slateText-secondary font-medium">
              Reports submitted to date
            </span>
          </div>

          <div className="p-5 border-r-2 border-b-2 border-ink/40 flex flex-col gap-1">
            <span className="text-4xl font-black text-ink font-mono">1</span>
            <span className="text-xs text-slateText-secondary font-medium">
              Awaiting correction
            </span>
          </div>

          <div className="p-5 border-r-2 border-b-2 border-ink/40 flex flex-col gap-1">
            <span className="text-4xl font-black text-ink font-mono">4</span>
            <span className="text-xs text-slateText-secondary font-medium">
              Open blockers flagged
            </span>
          </div>
        </div>

        <p className="text-xs leading-relaxed text-slateText-secondary max-w-md">
          Reports move seamlessly through <b>Draft → Submitted → Needs Correction → Approved</b>.
          Every submitted version is permanently archived so engineering managers review historical
          progress and feedback side-by-side.
        </p>
      </div>
    </div>
  );
}
