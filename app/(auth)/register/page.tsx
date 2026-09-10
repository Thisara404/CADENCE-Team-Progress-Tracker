'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Eye,
  EyeOff,
  User,
  Mail,
  Lock,
  Briefcase,
  Layers,
  ShieldCheck,
} from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [title, setTitle] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid work email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please check and try again.');
      return;
    }

    setIsLoading(true);

    try {
      await register({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        department: department.trim() || 'Engineering',
        title: title.trim() || 'Software Engineer',
      });

      // After successful registration as Team Member, route to weekly report creation
      router.push('/reports/new');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check your details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-[#f3f2f2]">
      {/* Left Form Column */}
      <div className="flex flex-col justify-between p-6 sm:p-12 border-r-2 border-ink/40 overflow-y-auto">
        {/* Brand Header */}
        <div className="flex items-center justify-between">
          <Link href="/login" className="flex items-center gap-2 group">
            <span className="w-6 h-6 bg-accent text-white font-black text-xs grid place-items-center">
              C
            </span>
            <span className="font-extrabold text-sm tracking-widest uppercase text-ink group-hover:text-accent transition-colors">
              CADENCE
            </span>
          </Link>

          <Link
            href="/login"
            className="text-xs text-slateText-secondary hover:text-ink flex items-center gap-1 font-semibold transition-colors"
          >
            <ArrowLeft size={13} />
            <span>Sign in instead</span>
          </Link>
        </div>

        <div className="max-w-md w-full flex flex-col gap-6 my-8">
          <div>
            <span className="text-[11px] font-bold tracking-widest uppercase text-slateText-muted font-mono">
              Member Self-Registration
            </span>
            <h1 className="text-3xl font-black text-ink tracking-tight mt-1 mb-2">
              Create Member Account
            </h1>
            <p className="text-sm text-slateText-secondary">
              Sign up as a team member to draft, edit, and submit your weekly reports and deliverables.
            </p>
          </div>

          {/* Role Default Notice (No role dropdown on registration) */}
          <div className="p-3 bg-[#e0f2fe] border border-[#7dd3fc] text-[#0369a1] text-xs flex flex-col gap-1 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[11px]">
                <ShieldCheck size={14} className="text-[#0284c7]" />
                <span>Default Role: Team Member</span>
              </div>
              <span className="text-[9.5px] font-bold uppercase px-1.5 py-0.2 bg-[#bae6fd] border border-[#7dd3fc]">
                Member Access
              </span>
            </div>
            <p className="text-[11px] text-[#075985] leading-relaxed">
              All new users register with <b>Team Member</b> permissions to submit and manage their weekly reports. Workspace administrators can assign Manager or Admin permissions as needed.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Full Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
                <User size={13} className="text-slateText-muted" />
                <span>Full Name *</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                placeholder="e.g. Alex Chen"
                className="h-10 px-3 bg-white border border-ink/40 text-sm focus:border-accent font-sans text-ink placeholder:text-[#999]"
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
                <Mail size={13} className="text-slateText-muted" />
                <span>Work Email Address *</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="alex@company.com"
                className="h-10 px-3 bg-white border border-ink/40 text-sm focus:border-accent font-sans text-ink placeholder:text-[#999]"
              />
            </div>

            {/* Passwords (2 columns on tablet/desktop) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
                  <Lock size={13} className="text-slateText-muted" />
                  <span>Password *</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="Min 6 characters"
                    className="h-10 px-3 pr-9 w-full bg-white border border-ink/40 text-sm focus:border-accent font-mono text-ink placeholder:text-[#999]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-2.5 text-slateText-muted hover:text-ink transition-colors p-0.5"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
                  <Lock size={13} className="text-slateText-muted" />
                  <span>Confirm Password *</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="Re-enter password"
                    className="h-10 px-3 pr-9 w-full bg-white border border-ink/40 text-sm focus:border-accent font-mono text-ink placeholder:text-[#999]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2.5 top-2.5 text-slateText-muted hover:text-ink transition-colors p-0.5"
                    title={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Department & Job Title */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
                  <Layers size={13} className="text-slateText-muted" />
                  <span>Department</span>
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="Engineering"
                  className="h-10 px-3 bg-white border border-ink/40 text-sm focus:border-accent font-sans text-ink placeholder:text-[#999]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
                  <Briefcase size={13} className="text-slateText-muted" />
                  <span>Job Title</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Software Engineer"
                  className="h-10 px-3 bg-white border border-ink/40 text-sm focus:border-accent font-sans text-ink placeholder:text-[#999]"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-2.5 bg-[#fee2e2] border-l-2 border-accent text-[#991b1b] text-xs font-semibold">
                <AlertCircle size={15} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="h-11 bg-accent text-white font-black text-sm flex items-center justify-center gap-2 hover:bg-accent-hover transition-colors shadow-sm mt-2 disabled:opacity-60 cursor-pointer"
            >
              <span>{isLoading ? 'Registering...' : 'Register as Team Member'}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Already have an account link */}
          <div className="flex items-center justify-between p-3.5 bg-white border border-ink/40 text-xs shadow-2xs">
            <span className="text-slateText-secondary font-medium">
              Already have a Cadence account?
            </span>
            <Link
              href="/login"
              className="font-black text-accent hover:underline flex items-center gap-1 uppercase tracking-wider text-[11px]"
            >
              <span>Sign In</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        <p className="text-[11px] text-slateText-muted mt-4">
          Cadence v1.0.0 — Engineering Weekly Report Generator
        </p>
      </div>

      {/* Right Visual Teaser Column */}
      <div className="hidden md:flex flex-col justify-center p-12 bg-[#eae9e9] gap-8">
        <div>
          <span className="text-xs font-bold tracking-widest uppercase text-slateText-muted font-mono">
            Role-Based Access Control
          </span>
          <h2 className="text-2xl font-black text-ink mt-2">
            Clear role boundaries built for engineering teams
          </h2>
          <p className="text-xs text-slateText-secondary mt-1 max-w-md">
            Individual accountability combined with high-level managerial visibility.
          </p>
        </div>

        {/* Roles Comparison Cards */}
        <div className="flex flex-col gap-3 max-w-md">
          {/* Team Member Card */}
          <div className="p-4 bg-white border-2 border-ink/40 shadow-sm flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-ink">
                Team Member (Your Role)
              </span>
              <span className="px-2 py-0.5 bg-[#e0f2fe] text-[#075985] text-[10px] font-bold border border-[#7dd3fc]">
                Active on Register
              </span>
            </div>
            <ul className="text-xs text-slateText-secondary space-y-1 list-disc pl-4 mt-1">
              <li>Create, edit, and submit your own weekly reports</li>
              <li>Track dev, testing, meeting, and documentation hours</li>
              <li>Record blockers and flag key obstacles for managers</li>
              <li>Inspect past submissions and revise based on review feedback</li>
            </ul>
          </div>

          {/* Manager / Admin Card */}
          <div className="p-4 bg-white border-2 border-ink/40 shadow-sm flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-ink">
                Manager / Admin
              </span>
              <span className="px-2 py-0.5 bg-[#fef3c7] text-[#92400e] text-[10px] font-bold border border-[#fcd34d]">
                Assigned by Admin
              </span>
            </div>
            <ul className="text-xs text-slateText-secondary space-y-1 list-disc pl-4 mt-1">
              <li>View and analyze reports across all team members</li>
              <li>Review and approve or request changes on submitted reports</li>
              <li>Side-by-side blocker and achievement triage</li>
              <li>Role assignment, user governance, and compliance dashboards</li>
            </ul>
          </div>
        </div>

        <p className="text-xs leading-relaxed text-slateText-secondary max-w-md">
          Once your account is created, you can begin filling out your current week’s report immediately.
        </p>
      </div>
    </div>
  );
}
