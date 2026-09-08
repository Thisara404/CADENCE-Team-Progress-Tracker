'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { ApiClient } from '@/lib/api';
import {
  MOCK_DASHBOARD_SUMMARY,
  MOCK_DASHBOARD_CHARTS,
  MOCK_PROJECTS,
  MOCK_USERS,
} from '@/lib/mock-data';
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  Users,
  Filter,
  ArrowUpRight,
  TrendingUp,
  PieChart as PieIcon,
  BarChart3,
  Calendar,
} from 'lucide-react';

export default function DashboardPage() {
  const { user, isManager } = useAuth();

  const [summary, setSummary] = useState(MOCK_DASHBOARD_SUMMARY);
  const [charts, setCharts] = useState(MOCK_DASHBOARD_CHARTS);
  const [projects, setProjects] = useState<any[]>(MOCK_PROJECTS);
  const [members, setMembers] = useState<any[]>(MOCK_USERS.filter((u) => u.role === 'TEAM_MEMBER'));
  const [recentReports, setRecentReports] = useState<any[]>([]);

  // Filter states
  const [selectedWeek, setSelectedWeek] = useState('ALL');
  const [selectedProject, setSelectedProject] = useState('ALL');
  const [selectedMember, setSelectedMember] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboard = async () => {
    setIsLoading(true);
    try {
      const [sumRes, chartsRes, projsRes, repsRes] = await Promise.all([
        ApiClient.getDashboardSummary(selectedWeek !== 'ALL' ? selectedWeek : undefined),
        ApiClient.getDashboardCharts(),
        ApiClient.getProjects(),
        ApiClient.getReports({
          week: selectedWeek !== 'ALL' ? selectedWeek : undefined,
          projectId: selectedProject !== 'ALL' ? selectedProject : undefined,
          memberId: selectedMember !== 'ALL' ? selectedMember : undefined,
        }),
      ]);

      if (sumRes) setSummary(sumRes);
      if (chartsRes) setCharts(chartsRes);
      if (projsRes && projsRes.length) setProjects(projsRes);
      if (repsRes?.reports) setRecentReports(repsRes.reports);
    } catch (err) {
      // Use rich mock data if offline
      setSummary(MOCK_DASHBOARD_SUMMARY);
      setCharts(MOCK_DASHBOARD_CHARTS);
      setRecentReports([
        {
          id: 'rep-w37',
          status: 'SUBMITTED',
          project: { name: 'Internal Tooling', code: 'INT-03' },
          user: { fullName: 'Marcus Vance', avatarColor: '#7c3aed' },
          totalHours: 39,
          completionRate: 85,
          weekStartDate: '2026-09-08',
        },
        {
          id: 'rep-w36',
          status: 'NEEDS_CORRECTION',
          project: { name: 'Cloud Migration', code: 'CLM-02' },
          user: { fullName: 'Dana Lee', avatarColor: '#059669' },
          totalHours: 37,
          completionRate: 75,
          weekStartDate: '2026-09-01',
          latestComment: { comment: 'Please attach PR link for Dockerfile overhaul.' },
        },
        {
          id: 'rep-w35',
          status: 'APPROVED',
          project: { name: 'Mobile App Redesign', code: 'MAR-01' },
          user: { fullName: 'Alex Chen', avatarColor: '#2563eb' },
          totalHours: 40,
          completionRate: 100,
          weekStartDate: '2026-08-25',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [selectedWeek, selectedProject, selectedMember]);

  const resetFilters = () => {
    setSelectedWeek('ALL');
    setSelectedProject('ALL');
    setSelectedMember('ALL');
  };

  // Stat Card definition matching prototype
  const statCards = [
    {
      label: 'Compliance Rate',
      value: `${summary.complianceRate}%`,
      delta: `${summary.totalSubmitted} of ${summary.totalMembers} in`,
      barColor: '#ec3013',
      barWidth: `${summary.complianceRate}%`,
      sub: 'Team submission adherence this week',
    },
    {
      label: 'Reports Submitted',
      value: summary.totalSubmitted,
      delta: `${summary.pendingReviews} awaiting review`,
      barColor: '#201e1d',
      barWidth: `${Math.min(100, (summary.totalSubmitted / (summary.totalMembers || 1)) * 100)}%`,
      sub: 'Current cycle active reports',
    },
    {
      label: 'Needs Correction',
      value: summary.needsCorrectionCount,
      delta: summary.needsCorrectionCount > 0 ? 'Pending member action' : 'All clear',
      barColor: '#d97706',
      barWidth: summary.needsCorrectionCount > 0 ? '60%' : '0%',
      sub: 'Returned reports with manager notes',
    },
    {
      label: 'Open Blockers',
      value: summary.openBlockers,
      delta: 'Across all project tracks',
      barColor: '#dc2626',
      barWidth: `${Math.min(100, summary.openBlockers * 25)}%`,
      sub: 'Dependencies & environment halts',
    },
  ];

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header & Filter Bar */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-ink/40 pb-4">
          <div>
            <span className="text-xs font-bold tracking-widest uppercase text-slateText-muted font-mono">
              Engineering Analytics
            </span>
            <h1 className="text-2xl font-black text-ink tracking-tight mt-1">
              Manager Intelligence Dashboard
            </h1>
            <p className="text-xs text-slateText-secondary">
              Consolidated team reporting compliance, velocity trends, project workload, and blocker triage.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/manager/blockers"
              className="px-3 py-2 bg-white border border-ink/40 text-xs font-bold text-ink hover:bg-[#eae9e9] flex items-center gap-1.5"
            >
              <AlertTriangle size={14} className="text-accent" />
              <span>Side-by-Side Blockers</span>
            </Link>

            <Link
              href="/reports/history"
              className="px-3 py-2 bg-ink text-white text-xs font-black hover:bg-black flex items-center gap-1.5 shadow-sm"
            >
              <span>Review Queue</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>

        {/* Interactive Filter Bar */}
        <div className="flex flex-wrap items-center gap-2 p-3 bg-[#eae9e9] border border-ink/40 text-xs">
          <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-slateText-muted pr-2">
            <Filter size={13} />
            <span>Filters:</span>
          </span>

          <select
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(e.target.value)}
            className="h-8 px-2 bg-white border border-ink/40 text-xs font-semibold focus:border-accent"
          >
            <option value="ALL">All Recorded Weeks</option>
            <option value="2026-09-08">Week 37 (Current)</option>
            <option value="2026-09-01">Week 36</option>
            <option value="2026-08-25">Week 35</option>
            <option value="2026-08-18">Week 34</option>
          </select>

          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="h-8 px-2 bg-white border border-ink/40 text-xs font-semibold focus:border-accent"
          >
            <option value="ALL">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.code})
              </option>
            ))}
          </select>

          <select
            value={selectedMember}
            onChange={(e) => setSelectedMember(e.target.value)}
            className="h-8 px-2 bg-white border border-ink/40 text-xs font-semibold focus:border-accent"
          >
            <option value="ALL">All Team Members</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.fullName}
              </option>
            ))}
          </select>

          <div className="flex-1" />

          <button
            onClick={resetFilters}
            className="h-8 px-3 bg-white border border-ink/40 font-bold hover:bg-[#d7d3d3] transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-t-2 border-l-2 border-ink/40 bg-white">
        {statCards.map((c, i) => (
          <div
            key={i}
            className="flex flex-col gap-2 p-4 border-r-2 border-b-2 border-ink/40"
          >
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-slateText-muted">
              {c.label}
            </span>
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-3xl font-black font-mono tracking-tight text-ink">
                {c.value}
              </span>
              <span className="text-[11px] font-semibold text-slateText-secondary">
                {c.delta}
              </span>
            </div>
            <div className="h-1.5 w-full bg-[#eae9e9] mt-1">
              <div
                className="h-full transition-all duration-500"
                style={{ width: c.barWidth, backgroundColor: c.barColor }}
              />
            </div>
            <span className="text-[10.5px] text-slateText-muted">{c.sub}</span>
          </div>
        ))}
      </div>

      {/* Visual Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Task Completion Velocity Trend */}
        <div className="p-5 bg-white border-2 border-ink/40 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-ink flex items-center gap-1.5">
                <TrendingUp size={15} className="text-accent" />
                <span>Task Completion Velocity</span>
              </h3>
              <span className="text-[11px] text-slateText-secondary">
                Tasks marked Done vs tasks planned over recent weeks
              </span>
            </div>

            <div className="flex items-center gap-3 text-[11px] font-mono">
              <span className="flex items-center gap-1 text-ink font-bold">
                <span className="w-3 h-3 bg-accent inline-block" /> Completed
              </span>
              <span className="flex items-center gap-1 text-slateText-secondary">
                <span className="w-3 h-3 bg-[#bab6b6] inline-block" /> Planned
              </span>
            </div>
          </div>

          {/* SVG Velocity Bar Chart */}
          <div className="h-52 w-full pt-4">
            <svg viewBox="0 0 500 180" className="w-full h-full overflow-visible">
              {charts.velocityTrend.map((v, i) => {
                const x = 50 + i * 110;
                const plannedH = Math.min(130, v.plannedTasks * 14);
                const actualH = Math.min(130, v.completedTasks * 14);

                return (
                  <g key={v.weekLabel}>
                    {/* Grid line */}
                    <line x1="30" y1="140" x2="470" y2="140" stroke="#d7d3d3" strokeWidth="1" />

                    {/* Planned Bar */}
                    <rect
                      x={x}
                      y={140 - plannedH}
                      width="28"
                      height={plannedH}
                      fill="#eae9e9"
                      stroke="#bab6b6"
                      strokeWidth="1"
                    />

                    {/* Completed Bar */}
                    <rect
                      x={x + 32}
                      y={140 - actualH}
                      width="28"
                      height={actualH}
                      fill="#ec3013"
                    />

                    {/* Value text */}
                    <text
                      x={x + 14}
                      y={135 - plannedH}
                      textAnchor="middle"
                      fontSize="10"
                      fill="#7d7979"
                      fontFamily="monospace"
                    >
                      {v.plannedTasks}
                    </text>
                    <text
                      x={x + 46}
                      y={135 - actualH}
                      textAnchor="middle"
                      fontSize="10"
                      fontWeight="bold"
                      fill="#201e1d"
                      fontFamily="monospace"
                    >
                      {v.completedTasks}
                    </text>

                    {/* X-axis label */}
                    <text
                      x={x + 30}
                      y="160"
                      textAnchor="middle"
                      fontSize="11"
                      fontWeight="bold"
                      fill="#201e1d"
                      fontFamily="monospace"
                    >
                      {v.weekLabel}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Chart 2: Submission Status by Member */}
        <div className="p-5 bg-white border-2 border-ink/40 flex flex-col gap-3">
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-ink flex items-center gap-1.5">
              <Users size={15} className="text-accent" />
              <span>Submission Status by Member</span>
            </h3>
            <span className="text-[11px] text-slateText-secondary">
              Report status breakdown and individual completion velocity
            </span>
          </div>

          <div className="flex flex-col gap-4 mt-2">
            {charts.statusByMember.map((m) => (
              <div key={m.id} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs">
                  <Link
                    href={`/manager/members/${m.id}`}
                    className="font-bold text-ink hover:text-accent flex items-center gap-2 group"
                  >
                    <span
                      className="w-4 h-4 text-white text-[9px] font-black grid place-items-center"
                      style={{ backgroundColor: m.avatarColor }}
                    >
                      {m.name[0]}
                    </span>
                    <span className="group-hover:underline">{m.name}</span>
                  </Link>

                  <span className="font-mono text-[11px] text-slateText-secondary">
                    Avg Completion: <b>{m.completionRate}%</b>
                  </span>
                </div>

                {/* Segmented status bar */}
                <div className="flex h-3 w-full bg-[#eae9e9] border border-ink/20 overflow-hidden">
                  <div
                    style={{ width: `${m.approvedPct}%` }}
                    className="bg-[#166534] h-full"
                    title={`Approved: ${m.approved}`}
                  />
                  <div
                    style={{ width: `${m.submittedPct}%` }}
                    className="bg-[#2563eb] h-full"
                    title={`Submitted: ${m.submitted}`}
                  />
                  <div
                    style={{ width: `${m.needsCorrectionPct}%` }}
                    className="bg-accent h-full"
                    title={`Needs Correction: ${m.needsCorrection}`}
                  />
                  <div
                    style={{ width: `${m.draftPct}%` }}
                    className="bg-[#9b9797] h-full"
                    title={`Draft: ${m.draft}`}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 pt-3 border-t border-ink/20 text-[11px]">
            <span className="flex items-center gap-1.5 text-slateText-secondary">
              <span className="w-2.5 h-2.5 bg-[#166534]" /> Approved
            </span>
            <span className="flex items-center gap-1.5 text-slateText-secondary">
              <span className="w-2.5 h-2.5 bg-[#2563eb]" /> Submitted
            </span>
            <span className="flex items-center gap-1.5 text-slateText-secondary">
              <span className="w-2.5 h-2.5 bg-accent" /> Needs Correction
            </span>
            <span className="flex items-center gap-1.5 text-slateText-secondary">
              <span className="w-2.5 h-2.5 bg-[#9b9797]" /> Draft
            </span>
          </div>
        </div>

        {/* Chart 3: Project Workload Distribution */}
        <div className="p-5 bg-white border-2 border-ink/40 flex flex-col gap-3">
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-ink flex items-center gap-1.5">
              <BarChart3 size={15} className="text-accent" />
              <span>Project Workload Distribution</span>
            </h3>
            <span className="text-[11px] text-slateText-secondary">
              Cumulative engineering hours logged across active tracks
            </span>
          </div>

          <div className="flex flex-col gap-3 mt-2">
            {charts.projectWorkload.map((p) => {
              const maxHours = Math.max(...charts.projectWorkload.map((x) => x.hours), 1);
              const widthPct = Math.round((p.hours / maxHours) * 100);

              return (
                <div key={p.id} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-ink">
                      {p.name} ({p.code})
                    </span>
                    <span className="font-mono text-accent font-black">
                      {p.hours}h ({p.reportCount} reports)
                    </span>
                  </div>
                  <div className="h-4 w-full bg-[#eae9e9] border border-ink/20">
                    <div
                      className="h-full bg-ink transition-all duration-500"
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 4: Time Spent by Category */}
        <div className="p-5 bg-white border-2 border-ink/40 flex flex-col gap-3">
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-ink flex items-center gap-1.5">
              <PieIcon size={15} className="text-accent" />
              <span>Hours by Task Category</span>
            </h3>
            <span className="text-[11px] text-slateText-secondary">
              Organization-wide engineering capacity distribution
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
            {charts.timeBreakdown.map((t) => (
              <div
                key={t.name}
                className="p-3 bg-[#f8f7f7] border border-ink/30 flex flex-col gap-1"
              >
                <span className="text-[10px] uppercase font-bold text-slateText-muted">
                  {t.name}
                </span>
                <span className="text-2xl font-black font-mono text-ink">
                  {t.percentage}%
                </span>
                <span className="text-[11px] font-mono text-slateText-secondary">
                  {t.hours} hours
                </span>
                <div className="h-1 w-full mt-1" style={{ backgroundColor: t.color }} />
              </div>
            ))}
          </div>

          <p className="text-[11px] text-slateText-secondary leading-relaxed pt-2">
            Development accounts for the largest share of capacity, with testing maintaining a healthy
            19% coverage proportion across the active sprint.
          </p>
        </div>
      </div>

      {/* Recent Activity & Reports Awaiting Action */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-ink">
              Recent Submissions & Review Queue
            </h3>
            <span className="text-[11px] text-slateText-secondary">
              Action items requiring manager review or team member updates
            </span>
          </div>

          <Link
            href="/reports/history"
            className="text-xs font-bold text-accent hover:underline flex items-center gap-1"
          >
            <span>View All Submissions</span>
            <ArrowUpRight size={13} />
          </Link>
        </div>

        <div className="border-2 border-ink/40 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#eae9e9] border-b-2 border-ink/40 text-[11px] font-black uppercase tracking-wider text-ink">
                  <th className="p-3">Team Member</th>
                  <th className="p-3">Project</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Logged Hours</th>
                  <th className="p-3">Completion</th>
                  <th className="p-3">Latest Note</th>
                  <th className="p-3 text-right">Review Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/20">
                {recentReports.slice(0, 5).map((r) => (
                  <tr key={r.id} className="hover:bg-[#f8f7f7]">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-5 h-5 text-white text-[10px] font-black grid place-items-center"
                          style={{ backgroundColor: r.user?.avatarColor || '#ec3013' }}
                        >
                          {r.user?.fullName?.[0] || 'U'}
                        </span>
                        <span className="font-bold text-ink">{r.user?.fullName}</span>
                      </div>
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

                    <td className="p-3 font-mono font-bold text-accent">{r.totalHours}h</td>
                    <td className="p-3 font-mono">{r.completionRate}%</td>

                    <td className="p-3 max-w-xs truncate text-slateText-secondary italic">
                      {r.latestComment ? `"${r.latestComment.comment}"` : '—'}
                    </td>

                    <td className="p-3 text-right">
                      {r.status === 'SUBMITTED' ? (
                        <Link
                          href={`/manager/review/${r.id}`}
                          className="px-3 py-1 bg-accent text-white font-black text-xs hover:bg-accent-hover shadow-sm inline-flex items-center gap-1"
                        >
                          <span>Review</span>
                          <ArrowUpRight size={12} />
                        </Link>
                      ) : (
                        <Link
                          href={`/reports/${r.id}`}
                          className="text-xs font-bold text-slateText-secondary hover:text-ink underline"
                        >
                          Details
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
