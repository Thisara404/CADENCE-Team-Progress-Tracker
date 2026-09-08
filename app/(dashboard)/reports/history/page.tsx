'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ApiClient } from '@/lib/api';
import { formatDateRange } from '@/lib/utils';
import {
  History,
  CheckCircle,
  Clock,
  AlertCircle,
  FileEdit,
  Eye,
  Filter,
  ArrowUpRight,
} from 'lucide-react';

export default function ReportHistoryPage() {
  const router = useRouter();
  const { user, isManager } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      if (isManager) {
        const res = await ApiClient.getReports({
          status: statusFilter !== 'ALL' ? (statusFilter as any) : undefined,
        });
        setReports(res.reports || []);
      } else {
        const res = await ApiClient.getMyHistory(1, 50);
        let list = res.reports || [];
        if (statusFilter !== 'ALL') {
          list = list.filter((r: any) => r.status === statusFilter);
        }
        setReports(list);
      }
    } catch (err) {
      console.error('Failed to load reports from database:', err);
      setReports([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [isManager, statusFilter]);

  const getStatusBadge = (st: string) => {
    switch (st) {
      case 'APPROVED':
        return 'bg-[#dcfce7] text-[#166534] border-[#166534]';
      case 'SUBMITTED':
        return 'bg-[#dbeafe] text-[#1e40af] border-[#1e40af]';
      case 'NEEDS_CORRECTION':
        return 'bg-accent-tint text-accent-hover border-accent';
      default:
        return 'bg-[#f3f2f2] text-ink border-ink/40';
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Page Title & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-ink/40 pb-4">
        <div>
          <span className="text-xs font-bold tracking-widest uppercase text-slateText-muted font-mono">
            {isManager ? 'Team Oversight' : 'Personal Archives'}
          </span>
          <h1 className="text-2xl font-black text-ink tracking-tight mt-1">
            {isManager ? 'Team Weekly Reports' : 'My Report History'}
          </h1>
          <p className="text-xs text-slateText-secondary">
            {isManager
              ? 'Filter and review reports across all engineering team members.'
              : 'Complete archive of your weekly submissions, manager feedback, and version snapshots.'}
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 border border-ink/40 bg-white p-1">
          {['ALL', 'SUBMITTED', 'NEEDS_CORRECTION', 'APPROVED', 'DRAFT'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-bold transition-colors ${
                statusFilter === st
                  ? 'bg-ink text-white'
                  : 'text-slateText-secondary hover:text-ink hover:bg-[#eae9e9]'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Reports Table / List */}
      <div className="border-2 border-ink/40 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#eae9e9] border-b-2 border-ink/40 text-[11px] font-black uppercase tracking-wider text-ink whitespace-nowrap">
                <th className="px-2.5 py-3">Week</th>
                {isManager && <th className="px-2.5 py-3">Member</th>}
                <th className="px-2.5 py-3">Project</th>
                <th className="px-2 py-3">Status</th>
                <th className="px-2 py-3">Ver</th>
                <th className="px-2 py-3">Comp</th>
                <th className="px-2 py-3">Hours</th>
                <th className="px-2.5 py-3 max-w-[120px] lg:max-w-[160px]">Feedback</th>
                <th className="px-2.5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/20">
              {reports.length === 0 ? (
                <tr>
                  <td colSpan={isManager ? 9 : 8} className="p-8 text-center text-slateText-muted font-mono">
                    No reports match the selected status filter.
                  </td>
                </tr>
              ) : (
                reports.map((r) => {
                  const range = formatDateRange(r.weekStartDate, r.weekEndDate);
                  const isSubmitted = r.status === 'SUBMITTED';
                  const isNeedsCorrection = r.status === 'NEEDS_CORRECTION';
                  const isDraft = r.status === 'DRAFT';

                  return (
                    <tr
                      key={r.id}
                      onClick={(e) => {
                        const target = e.target as HTMLElement;
                        if (target.closest('a') || target.closest('button')) return;
                        router.push(`/reports/${r.id}`);
                      }}
                      className="hover:bg-[#eae9e9] transition-colors cursor-pointer"
                      title="Click to view report details"
                    >
                      <td className="px-2.5 py-3 font-bold font-mono text-ink whitespace-nowrap">
                        {range}
                      </td>

                      {isManager && (
                        <td className="px-2.5 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span
                              className="w-5 h-5 text-white text-[10px] font-black grid place-items-center shrink-0"
                              style={{ backgroundColor: r.user?.avatarColor || '#2563eb' }}
                            >
                              {r.user?.fullName?.[0] || 'U'}
                            </span>
                            <span className="font-bold text-ink whitespace-nowrap">
                              {r.user?.fullName}
                            </span>
                          </div>
                        </td>
                      )}

                      <td className="px-2.5 py-3 whitespace-nowrap max-w-[110px]">
                        <span
                          className="inline-block px-1.5 py-0.5 bg-[#f3f2f2] border border-ink/30 font-mono text-[10.5px] font-semibold text-ink truncate max-w-[110px]"
                          title={r.project?.name || 'Project'}
                        >
                          {r.project?.name || 'Project'}
                        </span>
                      </td>

                      <td className="px-2 py-3 whitespace-nowrap">
                        <span
                          className={`inline-block px-1.5 py-0.5 text-[9.5px] font-black uppercase border whitespace-nowrap ${getStatusBadge(
                            r.status,
                          )}`}
                        >
                          {r.status.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="px-2 py-3 font-mono text-slateText-secondary whitespace-nowrap">
                        v{r.currentVersionNumber || 1}
                      </td>

                      <td className="px-2 py-3 font-mono font-bold text-ink whitespace-nowrap">
                        {r.completionRate ?? 100}%
                      </td>

                      <td className="px-2 py-3 font-mono font-bold text-accent whitespace-nowrap">
                        {r.totalHours || 0}h
                      </td>

                      <td className="px-2.5 py-3 max-w-[120px] lg:max-w-[160px] truncate text-slateText-secondary">
                        {r.latestComment ? (
                          <span
                            className="italic text-ink font-medium truncate block max-w-[120px] lg:max-w-[160px]"
                            title={r.latestComment.comment}
                          >
                            "{r.latestComment.comment}"
                          </span>
                        ) : (
                          <span className="text-slateText-muted">—</span>
                        )}
                      </td>

                      <td className="px-2.5 py-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Manager Review Action */}
                          {isManager && isSubmitted && (
                            <Link
                              href={`/manager/review/${r.id}`}
                              className="flex items-center gap-1 px-2.5 py-1 bg-accent text-white font-black text-xs hover:bg-accent-hover transition-colors shadow-sm"
                            >
                              <span>Review</span>
                              <ArrowUpRight size={13} />
                            </Link>
                          )}

                          {/* Member Edit Action */}
                          {!isManager && (isDraft || isNeedsCorrection) && (
                            <Link
                              href={`/reports/new?id=${r.id}`}
                              className="flex items-center gap-1 px-2.5 py-1 bg-ink text-white font-bold text-xs hover:bg-black transition-colors"
                            >
                              <FileEdit size={12} />
                              <span>Edit</span>
                            </Link>
                          )}

                          {/* Read-only View Action */}
                          <Link
                            href={`/reports/${r.id}`}
                            className="p-1 text-slateText-secondary hover:text-ink transition-colors"
                            title="View read-only report details and version timeline"
                          >
                            <Eye size={16} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
