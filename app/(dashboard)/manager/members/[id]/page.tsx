'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ApiClient } from '@/lib/api';
import { formatDateRange } from '@/lib/utils';
import {
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  FileText,
  TrendingUp,
} from 'lucide-react';

export default function MemberProfilePage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();

  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      ApiClient.getUserProfile(id)
        .then((data) => setProfile(data))
        .catch((err) => {
          console.error('Failed to load user profile from database:', err);
          setError('Member profile not found in database.');
        })
        .finally(() => setIsLoading(false));
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="p-12 text-center text-xs font-mono text-slateText-muted flex flex-col items-center gap-2">
        <div className="w-6 h-6 border-2 border-accent border-t-transparent animate-spin" />
        <span>Loading member performance profile...</span>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="p-8 bg-white border-2 border-ink/40 flex flex-col items-center gap-3 text-center my-8 max-w-lg mx-auto">
        <AlertTriangle size={24} className="text-accent" />
        <h2 className="text-lg font-black text-ink">Member Not Found</h2>
        <p className="text-xs text-slateText-secondary">
          {error || 'Unable to find member details in database.'}
        </p>
        <button
          onClick={() => router.back()}
          className="mt-2 px-4 py-2 bg-ink text-white text-xs font-bold hover:bg-black transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  const { user, stats, blockers, reports } = profile;

  return (
    <div className="flex flex-col gap-6 pb-12">
      <div className="flex items-center justify-between border-b-2 border-ink/40 pb-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-xs font-bold text-ink hover:text-accent transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back</span>
        </button>
      </div>

      {/* Member Profile Header */}
      <div className="p-6 bg-white border-2 border-ink/40 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 text-white text-xl font-black grid place-items-center flex-shrink-0"
            style={{ backgroundColor: user.avatarColor || '#2563eb' }}
          >
            {user.fullName?.[0] || 'U'}
          </div>

          <div className="flex flex-col">
            <span className="text-xs font-bold uppercase tracking-wider text-slateText-muted font-mono">
              Team Member Profile
            </span>
            <h1 className="text-2xl font-black text-ink tracking-tight mt-1">
              {user.fullName}
            </h1>
            <span className="text-xs text-slateText-secondary">
              {user.title || 'Software Engineer'} · {user.department} · {user.email}
            </span>
          </div>
        </div>

        {/* Member KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t sm:border-t-0 sm:border-l border-ink/20 pt-4 sm:pt-0 sm:pl-6">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase text-slateText-muted">Reports</span>
            <span className="text-2xl font-black font-mono text-ink">{stats.totalReports}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase text-slateText-muted">On-Time</span>
            <span className="text-2xl font-black font-mono text-[#166534]">{stats.onTimeRate}%</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase text-slateText-muted">Avg Done</span>
            <span className="text-2xl font-black font-mono text-ink">{stats.avgCompletion}%</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase text-slateText-muted">Logged</span>
            <span className="text-2xl font-black font-mono text-accent">{stats.totalHours}h</span>
          </div>
        </div>
      </div>

      {/* Blocker History */}
      <div className="p-5 bg-white border-2 border-ink/40 flex flex-col gap-3">
        <h3 className="text-sm font-black uppercase tracking-wider text-ink flex items-center gap-1.5">
          <AlertTriangle size={15} className="text-accent" />
          <span>Recorded Blockers & Dependencies</span>
        </h3>

        {blockers.length === 0 ? (
          <p className="text-xs text-slateText-muted italic">No blockers recorded for this member.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {blockers.map((b: any, i: number) => (
              <div
                key={i}
                className={`p-3 border text-xs flex items-center justify-between ${
                  b.isKey ? 'bg-accent-tint border-accent text-accent-hover font-bold' : 'bg-[#f8f7f7] border-ink/20'
                }`}
              >
                <div className="flex items-center gap-2">
                  {b.isKey && (
                    <span className="text-[9px] font-black uppercase bg-accent text-white px-1.5 py-0.5">
                      Key Issue
                    </span>
                  )}
                  <span>{b.text}</span>
                </div>
                <span className="text-[10.5px] font-mono text-slateText-secondary">
                  {b.projectName} · {new Date(b.weekStartDate).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Individual Report History */}
      <div className="flex flex-col gap-2">
        <h3 className="text-xs font-black uppercase tracking-wider text-ink">
          Historical Submissions by {user.fullName}
        </h3>
        <div className="overflow-x-auto border-2 border-ink/40 bg-white">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#eae9e9] border-b-2 border-ink/40 text-[11px] font-black uppercase tracking-wider text-ink">
                <th className="p-3">Week Range</th>
                <th className="p-3">Project</th>
                <th className="p-3">Status</th>
                <th className="p-3">Version</th>
                <th className="p-3">Completion</th>
                <th className="p-3">Hours Logged</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/20">
              {reports.map((r: any) => (
                <tr key={r.id} className="hover:bg-[#f8f7f7]">
                  <td className="p-3 font-mono font-bold">
                    {formatDateRange(r.weekStartDate, r.weekEndDate)}
                  </td>
                  <td className="p-3 font-mono">{r.project?.name}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-black uppercase border ${
                        r.status === 'APPROVED'
                          ? 'bg-[#dcfce7] text-[#166534] border-[#166534]'
                          : r.status === 'SUBMITTED'
                          ? 'bg-[#dbeafe] text-[#1e40af] border-[#1e40af]'
                          : r.status === 'NEEDS_CORRECTION'
                          ? 'bg-accent-tint text-accent-hover border-accent'
                          : 'bg-[#f3f2f2] text-ink border-ink/40'
                      }`}
                    >
                      {r.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-3 font-mono">v{r.currentVersionNumber}</td>
                  <td className="p-3 font-mono font-bold">{r.completion}%</td>
                  <td className="p-3 font-mono font-bold text-accent">{r.hours}h</td>
                  <td className="p-3 text-right">
                    <Link
                      href={`/reports/${r.id}`}
                      className="text-xs font-bold text-ink hover:text-accent underline"
                    >
                      View Report
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
