'use client';

import React from 'react';

/**
 * Base Brutalist Skeleton pulse element matching Cadence design system.
 */
export function Skeleton({
  className = '',
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`bg-[#e4e1df] animate-pulse ${className}`}
      {...props}
    />
  );
}

/**
 * Loading Skeleton for Dashboard Tab (/dashboard)
 */
export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6 pb-12 animate-in fade-in duration-200">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-ink/40 pb-4">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-3 w-40" />
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-3.5 w-80 max-w-full" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-28 border border-ink/20" />
          <Skeleton className="h-9 w-32 border border-ink/20" />
        </div>
      </div>

      {/* 6 Top KPI Cards Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="p-3.5 bg-white border-2 border-ink/30 flex flex-col justify-between gap-2 shadow-2xs min-h-[90px]"
          >
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-8 w-14 my-1" />
            <Skeleton className="h-2.5 w-24" />
          </div>
        ))}
      </div>

      {/* Filter Bar Skeleton */}
      <div className="p-3 bg-white border-2 border-ink/30 flex flex-wrap items-center gap-3">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-8 w-36 border border-ink/20" />
        <Skeleton className="h-8 w-40 border border-ink/20" />
        <Skeleton className="h-8 w-44 border border-ink/20" />
      </div>

      {/* 4 Charts Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="p-5 bg-white border-2 border-ink/40 flex flex-col gap-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-44" />
              <Skeleton className="h-3 w-20" />
            </div>
            <div className="h-52 bg-[#f8f7f7] border border-ink/15 p-4 flex flex-col justify-between">
              <div className="flex items-end justify-between h-full gap-3 pt-6">
                {[45, 75, 60, 90, 80, 65, 85].map((h, j) => (
                  <div key={j} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                    <Skeleton className="w-full" style={{ height: `${h}%` }} />
                    <Skeleton className="h-2.5 w-6" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Reports Table Skeleton */}
      <div className="bg-white border-2 border-ink/40 p-5 flex flex-col gap-3 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-ink/20">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-24" />
        </div>
        <div className="flex flex-col divide-y divide-ink/15">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <Skeleton className="w-8 h-8 shrink-0" />
                <div className="flex flex-col gap-1.5">
                  <Skeleton className="h-3.5 w-32" />
                  <Skeleton className="h-2.5 w-48" />
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <Skeleton className="h-6 w-20 border border-ink/20" />
                <Skeleton className="h-6 w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Loading Skeleton for Team Reports & My History (/reports/history)
 */
export function ReportHistorySkeleton() {
  return (
    <div className="flex flex-col gap-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-ink/40 pb-4">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-3.5 w-72" />
        </div>
        <Skeleton className="h-9 w-36 border border-ink/20" />
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-ink/20 pb-2">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-7 w-20 border border-ink/20" />
        ))}
      </div>

      {/* Report Cards Grid / List */}
      <div className="flex flex-col gap-3">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="p-4 bg-white border-2 border-ink/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs"
          >
            <div className="flex items-start gap-3.5">
              <Skeleton className="w-9 h-9 shrink-0" />
              <div className="flex flex-col gap-1.5 min-w-0">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-3 w-48" />
                <Skeleton className="h-2.5 w-64 max-w-full" />
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
              <Skeleton className="h-6 w-24 border border-ink/20" />
              <Skeleton className="h-8 w-24 bg-ink/10" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Loading Skeleton for Weekly Blockers & Achievements Tab (/manager/blockers)
 */
export function BlockersSkeleton() {
  return (
    <div className="flex flex-col gap-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-ink/40 pb-4">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-3 w-44" />
          <Skeleton className="h-8 w-72" />
          <Skeleton className="h-3.5 w-96 max-w-full" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-32 border border-ink/20" />
          <Skeleton className="h-8 w-28 border border-ink/20" />
        </div>
      </div>

      {/* Side-by-Side 2 Column Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Blockers */}
        <div className="flex flex-col gap-3">
          <div className="p-3 bg-[#fee2e2]/60 border-2 border-[#991b1b]/30 flex items-center justify-between">
            <Skeleton className="h-4 w-32 bg-[#fecaca]" />
            <Skeleton className="h-5 w-8 bg-[#fecaca]" />
          </div>

          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="p-4 bg-white border-2 border-ink/30 border-l-4 border-l-[#ec3013] flex flex-col gap-2 shadow-2xs"
            >
              <div className="flex items-center justify-between">
                <Skeleton className="h-3.5 w-28" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-3 w-full mt-1" />
              <Skeleton className="h-3 w-3/4" />
              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-ink/10">
                <Skeleton className="w-5 h-5" />
                <Skeleton className="h-2.5 w-24" />
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: Achievements */}
        <div className="flex flex-col gap-3">
          <div className="p-3 bg-[#dcfce7]/60 border-2 border-[#166534]/30 flex items-center justify-between">
            <Skeleton className="h-4 w-36 bg-[#bbf7d0]" />
            <Skeleton className="h-5 w-8 bg-[#bbf7d0]" />
          </div>

          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="p-4 bg-white border-2 border-ink/30 border-l-4 border-l-[#166534] flex flex-col gap-2 shadow-2xs"
            >
              <div className="flex items-center justify-between">
                <Skeleton className="h-3.5 w-28" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-3 w-full mt-1" />
              <Skeleton className="h-3 w-4/5" />
              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-ink/10">
                <Skeleton className="w-5 h-5" />
                <Skeleton className="h-2.5 w-24" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Loading Skeleton for Projects Tab (/projects)
 */
export function ProjectsSkeleton() {
  return (
    <div className="flex flex-col gap-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-ink/40 pb-4">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-3 w-36" />
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-3.5 w-80 max-w-full" />
        </div>
        <Skeleton className="h-10 w-36 bg-ink/10 border border-ink/30" />
      </div>

      {/* Projects Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="p-4 bg-white border-2 border-ink/30 flex flex-col justify-between gap-4 shadow-2xs min-h-[160px]"
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-14 bg-accent/15 border border-accent/30" />
                <Skeleton className="h-5 w-16 border border-ink/20" />
              </div>
              <Skeleton className="h-5 w-44 mt-1" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>

            <div className="pt-3 border-t border-ink/15 flex items-center justify-between">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-6 w-14" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Loading Skeleton for Users & Roles Tab (/admin/users)
 */
export function UsersSkeleton() {
  return (
    <div className="flex flex-col gap-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-ink/40 pb-4">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-3 w-36" />
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-3.5 w-88 max-w-full" />
        </div>
        <Skeleton className="h-10 w-44 bg-ink/10 border border-ink/30" />
      </div>

      {/* Users Table Skeleton */}
      <div className="bg-white border-2 border-ink/40 shadow-sm overflow-hidden">
        <div className="p-3.5 bg-[#eae7e6] border-b-2 border-ink/30 flex items-center justify-between">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b-2 border-ink/30 bg-[#f8f7f7] text-[11px] font-bold text-ink">
                <th className="p-3.5">USER</th>
                <th className="p-3.5">EMAIL</th>
                <th className="p-3.5">DEPARTMENT</th>
                <th className="p-3.5">ROLE</th>
                <th className="p-3.5">REPORTS</th>
                <th className="p-3.5">STATUS</th>
                <th className="p-3.5 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/15">
              {[...Array(6)].map((_, i) => (
                <tr key={i} className="hover:bg-[#faf9f9]">
                  <td className="p-3.5">
                    <div className="flex items-center gap-2.5">
                      <Skeleton className="w-7 h-7 shrink-0" />
                      <div className="flex flex-col gap-1">
                        <Skeleton className="h-3.5 w-28" />
                        <Skeleton className="h-2.5 w-20" />
                      </div>
                    </div>
                  </td>
                  <td className="p-3.5">
                    <Skeleton className="h-3 w-36" />
                  </td>
                  <td className="p-3.5">
                    <Skeleton className="h-3 w-24" />
                  </td>
                  <td className="p-3.5">
                    <Skeleton className="h-7 w-28 border border-ink/20" />
                  </td>
                  <td className="p-3.5">
                    <Skeleton className="h-3 w-8" />
                  </td>
                  <td className="p-3.5">
                    <Skeleton className="h-5 w-16 border border-ink/20" />
                  </td>
                  <td className="p-3.5 text-right">
                    <div className="inline-flex items-center gap-1.5 justify-end">
                      <Skeleton className="h-7 w-16 border border-ink/20" />
                      <Skeleton className="h-7 w-16 border border-ink/20" />
                    </div>
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

/**
 * Loading Skeleton for Weekly Report Form (/reports/new)
 */
export function WeeklyReportFormSkeleton() {
  return (
    <div className="flex flex-col gap-6 pb-16 max-w-5xl mx-auto animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-ink/40 pb-4">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-3 w-36" />
          <Skeleton className="h-8 w-60" />
          <Skeleton className="h-3.5 w-80 max-w-full" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-24 border border-ink/20" />
          <Skeleton className="h-9 w-32 border border-ink/20" />
        </div>
      </div>

      {/* Meta Grid: Project & Week Dates */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-white border-2 border-ink/30 shadow-2xs">
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-10 w-full border border-ink/20" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-10 w-full border border-ink/20" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-10 w-full border border-ink/20" />
        </div>
      </div>

      {/* Tasks Breakdown Table Skeleton */}
      <div className="bg-white border-2 border-ink/40 p-5 flex flex-col gap-4 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-ink/20">
          <Skeleton className="h-4 w-44" />
          <Skeleton className="h-7 w-24 border border-ink/20" />
        </div>

        <div className="flex flex-col gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-3.5 bg-[#f8f7f7] border border-ink/20 flex flex-col gap-3">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-2 flex flex-col gap-1">
                  <Skeleton className="h-2.5 w-20" />
                  <Skeleton className="h-9 w-full border border-ink/20" />
                </div>
                <div className="flex flex-col gap-1">
                  <Skeleton className="h-2.5 w-16" />
                  <Skeleton className="h-9 w-full border border-ink/20" />
                </div>
                <div className="flex flex-col gap-1">
                  <Skeleton className="h-2.5 w-16" />
                  <Skeleton className="h-9 w-full border border-ink/20" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Skeleton className="h-8 w-full border border-ink/20" />
                <Skeleton className="h-8 w-full border border-ink/20" />
                <Skeleton className="h-8 w-full border border-ink/20" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Time Allocation Grid Skeleton */}
      <div className="bg-white border-2 border-ink/30 p-5 flex flex-col gap-3 shadow-2xs">
        <Skeleton className="h-4 w-36" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex flex-col gap-1">
              <Skeleton className="h-2.5 w-20" />
              <Skeleton className="h-9 w-full border border-ink/20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Loading Skeleton for Report Details / Review Page (/reports/[id])
 */
export function ReportDetailSkeleton() {
  return (
    <div className="flex flex-col gap-6 pb-16 max-w-5xl mx-auto animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-ink/40 pb-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-20 border border-ink/20" />
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-7 w-64" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-7 w-24 border border-ink/20" />
          <Skeleton className="h-7 w-20 border border-ink/20" />
        </div>
      </div>

      {/* Meta Profile Bar */}
      <div className="p-4 bg-white border-2 border-ink/30 flex items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 shrink-0" />
          <div className="flex flex-col gap-1">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-28" />
          </div>
        </div>
        <Skeleton className="h-8 w-44 border border-ink/20" />
      </div>

      {/* Tasks Table Skeleton */}
      <div className="bg-white border-2 border-ink/40 p-5 flex flex-col gap-3 shadow-sm">
        <Skeleton className="h-4 w-36 pb-2 border-b border-ink/15" />
        <div className="flex flex-col divide-y divide-ink/15">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="py-3 flex items-center justify-between gap-4">
              <div className="flex flex-col gap-1.5 min-w-0">
                <Skeleton className="h-3.5 w-48" />
                <Skeleton className="h-2.5 w-72 max-w-full" />
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-12" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Loading Skeleton for Member Performance Profile Page (/manager/members/[id])
 */
export function MemberProfileSkeleton() {
  return (
    <div className="flex flex-col gap-6 pb-16 max-w-5xl mx-auto animate-in fade-in duration-200">
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b-2 border-ink/40 pb-4">
        <Skeleton className="h-8 w-32 border border-ink/20" />
        <Skeleton className="h-8 w-24 border border-ink/20" />
      </div>

      {/* Profile Card */}
      <div className="p-6 bg-white border-2 border-ink/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-4">
          <Skeleton className="w-16 h-16 shrink-0" />
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-5 w-24" />
            </div>
            <Skeleton className="h-3.5 w-64" />
            <Skeleton className="h-3 w-40" />
          </div>
        </div>
        <Skeleton className="h-6 w-20 self-start sm:self-center" />
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-4 bg-white border-2 border-ink/30 flex flex-col gap-2 shadow-2xs">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-8 w-16 my-1" />
            <Skeleton className="h-2.5 w-20" />
          </div>
        ))}
      </div>

      {/* Historical Reports Table */}
      <div className="bg-white border-2 border-ink/40 p-5 flex flex-col gap-3 shadow-sm">
        <Skeleton className="h-4 w-40 pb-2 border-b border-ink/15" />
        <div className="flex flex-col divide-y divide-ink/15">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="py-3 flex items-center justify-between gap-4">
              <div className="flex flex-col gap-1.5">
                <Skeleton className="h-3.5 w-40" />
                <Skeleton className="h-2.5 w-56" />
              </div>
              <Skeleton className="h-6 w-20 border border-ink/20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
