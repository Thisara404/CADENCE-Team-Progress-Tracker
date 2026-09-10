'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { ArrowRight, AlertCircle, Eye, EyeOff, Lock, Shield } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('admin@cadence.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
      // Read user from storage to decide redirection
      const saved = localStorage.getItem('cadence_user');
      const parsed = saved ? JSON.parse(saved) : null;
      if (parsed?.role === 'TEAM_MEMBER') {
        router.push('/reports/new');
      } else {
        router.push('/dashboard');
      }
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
              Weekly Reporting & Organization Insights
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-ink tracking-tight mt-1 mb-2">
              Sign in to Cadence
            </h1>
            <p className="text-sm text-slateText-secondary">
              Weekly reports, correction cycles, and team insight for engineering organizations.
            </p>
          </div>

          <div className="h-0.5 bg-ink/20" />

          {/* Test Credentials Reference in Text */}
          {/* <div className="p-3.5 bg-white border border-ink/40 text-xs flex flex-col gap-2.5 shadow-[1px_1px_0px_rgba(0,0,0,0.15)]">
            <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-slateText-subtle text-[10.5px]">
              <Shield size={13} className="text-accent" />
              <span>System Test Credentials</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
              <div className="p-2.5 bg-[#f8f7f7] border border-ink/20 flex flex-col gap-0.5">
                <span className="font-bold text-ink uppercase text-[10px] tracking-wider font-sans">
                  Admin / Manager
                </span>
                <span className="text-ink font-semibold select-all break-all">admin@cadence.com</span>
                <span className="text-slateText-muted text-[10.5px]">
                  Password: <span className="text-ink font-bold font-mono">password123</span>
                </span>
              </div>

              <div className="p-2.5 bg-[#f8f7f7] border border-ink/20 flex flex-col gap-0.5">
                <span className="font-bold text-ink uppercase text-[10px] tracking-wider font-sans">
                  Team Member
                </span>
                <span className="text-ink font-semibold select-all break-all">alex@company.com</span>
                <span className="text-slateText-muted text-[10.5px]">
                  Password: <span className="text-ink font-bold font-mono">password123</span>
                </span>
              </div>
            </div>
          </div> */}

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
                className="h-10 px-3 bg-white border border-ink/40 text-sm focus:border-accent font-mono text-ink"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold uppercase tracking-wider text-ink">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  className="h-10 px-3 pr-10 w-full bg-white border border-ink/40 text-sm focus:border-accent font-mono text-ink"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slateText-muted hover:text-ink transition-colors p-0.5"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
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
              className="h-11 bg-accent text-white font-black text-sm flex items-center justify-center gap-2 hover:bg-accent-hover transition-colors shadow-sm"
            >
              <span>{isLoading ? 'Signing in...' : 'Sign in to workspace'}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Member Registration Link */}
          <div className="flex items-center justify-between p-3.5 bg-white border border-ink/40 text-xs shadow-2xs">
            <div className="flex flex-col">
              <span className="font-bold text-ink text-[12px]">New team member?</span>
              <span className="text-slateText-muted text-[11px]">Register as a Member to submit reports</span>
            </div>
            <Link
              href="/register"
              className="h-8 px-3 bg-ink text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 hover:bg-black transition-colors"
            >
              <span>Register</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        <p className="text-[11px] text-slateText-muted mt-8">
          Cadence v1.0.0 — By <a href="https://www.linkedin.com/in/thisaradasun/" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">Thisara Dasun</a>
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
