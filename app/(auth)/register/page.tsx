'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ArrowRight, AlertCircle } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'TEAM_MEMBER' | 'MANAGER'>('TEAM_MEMBER');
  const [department, setDepartment] = useState('Engineering');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) {
      setError('Please enter a valid work email.');
      return;
    }
    if (password.length < 4) {
      setError('Password must be at least 4 characters.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await register({
        fullName,
        email,
        password,
        role,
        department,
      });
      router.push(role === 'MANAGER' ? '/dashboard' : '/reports/new');
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-[#f3f2f2]">
      <div className="flex flex-col justify-between p-8 sm:p-12 border-r-2 border-ink/40">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 bg-accent text-white font-black text-xs grid place-items-center">
            C
          </span>
          <span className="font-extrabold text-sm tracking-widest uppercase text-ink">
            CADENCE
          </span>
        </div>

        <div className="max-w-md w-full flex flex-col gap-5 my-auto">
          <div>
            <span className="text-[11px] font-bold tracking-widest uppercase text-slateText-muted">
              New Account
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-ink tracking-tight mt-1 mb-2">
              Create your account
            </h1>
            <p className="text-sm text-slateText-secondary">
              Join your team’s weekly reporting cadence.
            </p>
          </div>

          <div className="h-0.5 bg-ink/20" />

          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold uppercase tracking-wider text-ink">
                Full name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Jordan Ellis"
                required
                className="h-10 px-3 bg-white border border-ink/40 text-sm focus:border-accent"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold uppercase tracking-wider text-ink">
                Work email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jordan@company.com"
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
                placeholder="••••••••"
                required
                className="h-10 px-3 bg-white border border-ink/40 text-sm focus:border-accent"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold uppercase tracking-wider text-ink">
                Organization Role
              </label>
              <div className="grid grid-cols-2 border border-ink/40 bg-white">
                <button
                  type="button"
                  onClick={() => setRole('TEAM_MEMBER')}
                  className={`p-2.5 text-left border-r border-ink/40 transition-colors ${
                    role === 'TEAM_MEMBER' ? 'bg-ink text-white font-bold' : 'text-ink hover:bg-[#eae9e9]'
                  }`}
                >
                  <div className="text-xs font-black">Team Member</div>
                  <div className="text-[10px] opacity-75">Submit weekly reports</div>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('MANAGER')}
                  className={`p-2.5 text-left transition-colors ${
                    role === 'MANAGER' ? 'bg-ink text-white font-bold' : 'text-ink hover:bg-[#eae9e9]'
                  }`}
                >
                  <div className="text-xs font-black">Manager</div>
                  <div className="text-[10px] opacity-75">Review team reports</div>
                </button>
              </div>
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
              className="h-11 bg-accent text-white font-black text-sm flex items-center justify-center gap-2 hover:bg-accent-hover transition-colors shadow-sm mt-2"
            >
              <span>{isLoading ? 'Creating account...' : 'Create Account'}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          <p className="text-xs text-slateText-secondary">
            Already have an account?{' '}
            <Link href="/login" className="font-bold underline text-ink">
              Sign in
            </Link>
          </p>
        </div>

        <p className="text-[11px] text-slateText-muted mt-6">
          Cadence — Engineering Weekly Report Generator & Team Dashboard.
        </p>
      </div>

      <div className="hidden md:flex flex-col justify-center p-12 bg-[#eae9e9] gap-6">
        <span className="text-xs font-bold tracking-widest uppercase text-slateText-muted font-mono">
          Structured Reporting
        </span>
        <h2 className="text-3xl font-black text-ink">
          Clear, comparable reporting across the entire organization.
        </h2>
        <p className="text-sm text-slateText-secondary leading-relaxed">
          Every report has a fixed structure across tasks, next week priorities, blockers, and time
          distribution so engineering managers can identify trends and resolve impediments early.
        </p>
      </div>
    </div>
  );
}
