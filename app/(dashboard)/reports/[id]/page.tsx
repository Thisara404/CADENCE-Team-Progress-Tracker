'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ApiClient } from '@/lib/api';
import { formatDateRange } from '@/lib/utils';
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  AlertTriangle,
  Trophy,
  History,
  MessageSquare,
  ArrowUpRight,
  ExternalLink,
  X,
} from 'lucide-react';
import { ReportDetailSkeleton } from '@/components/ui/Skeleton';

export default function ReportDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const { isManager } = useAuth();

  const [report, setReport] = useState<any>(null);
  const [selectedVersionNum, setSelectedVersionNum] = useState<number>(1);
  const [showVersionModal, setShowVersionModal] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      ApiClient.getReport(id)
        .then((r) => {
          setReport(r);
          setSelectedVersionNum(r.currentVersionNumber || 1);
        })
        .catch((err) => {
          console.error('Failed to load report from database:', err);
          setError('Report not found in database.');
        })
        .finally(() => setIsLoading(false));
    }
  }, [id]);

  const renderDeliverableLink = (val?: string) => {
    if (!val || !val.trim()) {
      return <span className="text-slateText-muted italic">None provided</span>;
    }
    const trimmed = val.trim();
    const isUrl = /^https?:\/\//i.test(trimmed) || /^(www\.|github\.com|gitlab\.com|bitbucket\.org)/i.test(trimmed);
    const href = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

    if (isUrl) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1 font-mono font-bold text-accent hover:text-accent-hover hover:underline transition-colors group cursor-pointer max-w-full"
          title={`Open ${href} in new tab`}
        >
          <span className="truncate">{trimmed}</span>
          <ExternalLink size={12} className="shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </a>
      );
    }

    return <span className="font-mono text-ink/85 break-all">{trimmed}</span>;
  };

  if (isLoading) {
    return <ReportDetailSkeleton />;
  }

  if (error || !report) {
    return (
      <div className="p-8 bg-white border-2 border-ink/40 flex flex-col items-center gap-3 text-center my-8 max-w-lg mx-auto">
        <AlertTriangle size={24} className="text-accent" />
        <h2 className="text-lg font-black text-ink">Report Not Found</h2>
        <p className="text-xs text-slateText-secondary">
          {error || 'Unable to find the requested report in the database.'}
        </p>
        <Link
          href="/reports/history"
          className="mt-2 px-4 py-2 bg-ink text-white text-xs font-bold hover:bg-black transition-colors"
        >
          Return to Report History
        </Link>
      </div>
    );
  }

  const versions = report.versions || [];
  const currentVer =
    versions.find((v: any) => v.versionNumber === selectedVersionNum) ||
    versions[versions.length - 1];

  const totalLogged =
    (currentVer?.devHours || 0) +
    (currentVer?.testingHours || 0) +
    (currentVer?.meetingHours || 0) +
    (currentVer?.docHours || 0);

  const range = formatDateRange(report.weekStartDate, report.weekEndDate);

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Back and Review Actions Bar */}
      <div className="flex items-center justify-between border-b-2 border-ink/40 pb-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-xs font-bold text-ink hover:text-accent transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-3">
          {isManager && report.status === 'SUBMITTED' && (
            <Link
              href={`/manager/review/${report.id}`}
              className="flex items-center gap-1.5 px-4 py-2 bg-accent text-white font-black text-xs hover:bg-accent-hover transition-colors shadow-sm"
            >
              <span>Take Review Action</span>
              <ArrowUpRight size={14} />
            </Link>
          )}

          {!isManager &&
            (report.status === 'DRAFT' || report.status === 'NEEDS_CORRECTION') && (
              <Link
                href={`/reports/new?id=${report.id}`}
                className="flex items-center gap-1.5 px-4 py-2 bg-ink text-white font-bold text-xs hover:bg-black transition-colors"
              >
                <span>Edit Report</span>
              </Link>
            )}
        </div>
      </div>

      {/* Report Header Card */}
      <div className="p-6 bg-white border-2 border-ink/40 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div
            className="w-12 h-12 text-white text-lg font-black grid place-items-center flex-shrink-0"
            style={{ backgroundColor: report.user?.avatarColor || '#2563eb' }}
          >
            {report.user?.fullName?.[0] || 'U'}
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slateText-muted font-mono">
                {range}
              </span>
              <span
                className={`px-2 py-0.5 text-[10px] font-black uppercase border ${
                  report.status === 'APPROVED'
                    ? 'bg-[#dcfce7] text-[#166534] border-[#166534]'
                    : report.status === 'NEEDS_CORRECTION'
                    ? 'bg-accent-tint text-accent-hover border-accent'
                    : report.status === 'SUBMITTED'
                    ? 'bg-[#dbeafe] text-[#1e40af] border-[#1e40af]'
                    : 'bg-[#f3f2f2] text-ink border-ink/40'
                }`}
              >
                {report.status.replace('_', ' ')}
              </span>
            </div>

            <h1 className="text-2xl font-black text-ink tracking-tight mt-1">
              {report.user?.fullName} — {report.project?.name}
            </h1>
            <span className="text-xs text-slateText-secondary">
              {report.user?.title || 'Software Engineer'} · {report.user?.email}
            </span>
          </div>
        </div>

        {/* Quick Summary Metrics */}
        <div className="flex items-center gap-6 border-t md:border-t-0 md:border-l border-ink/20 pt-4 md:pt-0 md:pl-6">
          <div className="flex flex-col">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-slateText-muted">
              Total Hours
            </span>
            <span className="text-2xl font-black font-mono text-accent">
              {totalLogged}h
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-slateText-muted">
              Tasks
            </span>
            <span className="text-2xl font-black font-mono text-ink">
              {currentVer?.tasks?.length || 0}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-slateText-muted">
              Snapshot
            </span>
            <span className="text-2xl font-black font-mono text-ink">
              v{currentVer?.versionNumber || 1}
            </span>
          </div>
        </div>
      </div>

      {/* Version Timeline Selector */}
      {versions.length > 0 && (
        <div className="p-4 bg-[#eae9e9] border border-ink/40 flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <History size={16} className="text-ink" />
              <span className="text-xs font-black uppercase tracking-wider text-ink">
                Version History Timeline
              </span>
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase bg-white border border-ink/30 text-ink">
                Viewing v{selectedVersionNum}
              </span>
            </div>
            <span className="text-[11px] text-slateText-secondary">
              {versions.length > 1
                ? 'Click any version snapshot button below to compare revisions and inspect audit trail.'
                : 'Viewing initial submission snapshot (v1). Click below to inspect full version audit.'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-1">
            {versions.map((v: any) => {
              const isSelected = Number(selectedVersionNum) === Number(v.versionNumber);
              const isLatest =
                Number(v.versionNumber) ===
                Number(report.currentVersionNumber || versions[versions.length - 1]?.versionNumber);

              return (
                <button
                  key={v.versionNumber}
                  type="button"
                  onClick={() => {
                    setSelectedVersionNum(Number(v.versionNumber));
                    setShowVersionModal(true);
                  }}
                  className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-ink text-white border-ink shadow-[2px_2px_0px_rgba(0,0,0,0.25)] ring-2 ring-accent/60'
                      : 'bg-white text-ink border-ink/30 hover:bg-[#f3f2f2]'
                  }`}
                  title={`Click to switch to Version ${v.versionNumber} and open snapshot audit`}
                >
                  <span className="flex items-center gap-1.5">
                    {isSelected ? (
                      <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-slateText-muted" />
                    )}
                    <span>Version {v.versionNumber}</span>
                  </span>
                  <span
                    className={`text-[10px] font-mono ${
                      isSelected ? 'text-white/80' : 'text-slateText-muted'
                    }`}
                  >
                    ({new Date(v.submittedAt).toLocaleDateString()})
                  </span>
                  {isLatest && (
                    <span
                      className={`text-[9px] font-mono uppercase px-1 py-0.2 ${
                        isSelected ? 'bg-white text-ink font-extrabold' : 'bg-ink/10 text-ink'
                      }`}
                    >
                      Latest
                    </span>
                  )}
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => setShowVersionModal(true)}
              className="ml-auto px-2.5 py-1.5 bg-white border border-ink/30 text-ink font-bold text-[11px] hover:bg-ink hover:text-white transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <ExternalLink size={12} />
              <span>Inspect v{selectedVersionNum} Audit</span>
            </button>
          </div>

          {/* Active Version Status Indicator Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 bg-white border-l-4 border-accent text-xs gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent" />
              <span className="font-bold text-ink">
                Loaded Version {selectedVersionNum} Snapshot
              </span>
              <span className="text-slateText-secondary font-mono text-[11px]">
                (Submitted {new Date(currentVer?.submittedAt).toLocaleString()})
              </span>
            </div>
            <span className="text-[11px] font-mono text-slateText-secondary">
              {currentVer?.tasks?.length || 0} Tasks · {totalLogged} Hours Logged
            </span>
          </div>
        </div>
      )}

      {/* Review Comments History */}
      {report.reviewComments && report.reviewComments.length > 0 && (
        <div className="p-4 bg-white border border-ink/40 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <MessageSquare size={16} className="text-accent" />
            <span className="text-xs font-black uppercase tracking-wider text-ink">
              Reviewer Feedback History
            </span>
          </div>

          <div className="flex flex-col gap-2">
            {report.reviewComments.map((rc: any) => (
              <div
                key={rc.id}
                className={`p-3 border flex flex-col gap-1 ${
                  rc.action === 'REQUESTED_CHANGES'
                    ? 'bg-accent-tint border-accent'
                    : 'bg-[#dcfce7] border-[#166534]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-ink">
                    {rc.reviewer?.fullName || 'Manager'} ({rc.reviewer?.title || 'Reviewer'})
                  </span>
                  <span className="text-[10.5px] font-mono text-slateText-secondary">
                    {new Date(rc.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-xs font-medium text-ink italic">
                  "{rc.comment}"
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Task Breakdown Table */}
      <div className="flex flex-col gap-2">
        <h3 className="text-xs font-black uppercase tracking-wider text-ink">
          Tasks Completed & Deliverables (v{selectedVersionNum})
        </h3>
        <div className="overflow-x-auto border-2 border-ink/40 bg-white">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#eae9e9] border-b-2 border-ink/40 text-[11px] font-black uppercase tracking-wider text-ink">
                <th className="p-3">Task Name</th>
                <th className="p-3 w-28">Priority</th>
                <th className="p-3 w-28">Status</th>
                <th className="p-3 w-24">Planned %</th>
                <th className="p-3 w-24">Actual %</th>
                <th className="p-3 w-24">Plan (h)</th>
                <th className="p-3 w-24">Spent (h)</th>
                <th className="p-3">Deliverable / PR Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/20">
              {currentVer?.tasks?.map((t: any, i: number) => (
                <tr key={i} className="hover:bg-[#f8f7f7]">
                  <td className="p-3 font-semibold text-ink">{t.taskName}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold uppercase ${
                        t.priority === 'HIGH'
                          ? 'text-accent font-black'
                          : t.priority === 'MEDIUM'
                          ? 'text-[#d97706]'
                          : 'text-slateText-secondary'
                      }`}
                    >
                      {t.priority}
                    </span>
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-black uppercase border ${
                        t.status === 'DONE'
                          ? 'bg-[#dcfce7] text-[#166534] border-[#166534]'
                          : t.status === 'IN_PROGRESS'
                          ? 'bg-[#dbeafe] text-[#1e40af] border-[#1e40af]'
                          : t.status === 'BLOCKED'
                          ? 'bg-accent-tint text-accent-hover border-accent'
                          : 'bg-[#f3f2f2] text-ink border-ink/40'
                      }`}
                    >
                      {t.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-3 font-mono">{t.plannedPercentage}%</td>
                  <td className="p-3 font-mono font-bold">{t.actualPercentage}%</td>
                  <td className="p-3 font-mono">{t.plannedHours}h</td>
                  <td className="p-3 font-mono font-bold text-accent">{t.spentHours}h</td>
                  <td className="p-3">
                    {renderDeliverableLink(t.deliverableOutput)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Next Week Plans */}
      <div className="p-4 bg-white border border-ink/40 flex flex-col gap-1">
        <span className="text-xs font-black uppercase tracking-wider text-ink">
          Tasks Planned for Next Week
        </span>
        <p className="text-xs text-ink whitespace-pre-wrap leading-relaxed">
          {currentVer?.tasksPlannedNextWeek || 'No items entered.'}
        </p>
      </div>

      {/* Blockers & Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 bg-white border border-ink/40 flex flex-col gap-2">
          <span className="text-xs font-black uppercase tracking-wider text-ink flex items-center gap-1.5">
            <AlertTriangle size={14} className="text-accent" />
            <span>Blockers / Challenges</span>
          </span>
          <div className="flex flex-col gap-1.5">
            {currentVer?.blockers?.length === 0 ? (
              <span className="text-xs text-slateText-muted italic">No blockers logged.</span>
            ) : (
              currentVer?.blockers?.map((b: string, i: number) => {
                const isKey = currentVer?.keyBlockerIndex === i;
                return (
                  <div
                    key={i}
                    className={`p-2.5 border text-xs flex items-center gap-2 ${
                      isKey ? 'bg-accent-tint border-accent text-accent-hover font-bold' : 'bg-[#f8f7f7] border-ink/20'
                    }`}
                  >
                    {isKey && <span className="text-[10px] font-black uppercase bg-accent text-white px-1.5 py-0.5">Key Issue</span>}
                    <span>{b}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="p-4 bg-white border border-ink/40 flex flex-col gap-2">
          <span className="text-xs font-black uppercase tracking-wider text-ink flex items-center gap-1.5">
            <Trophy size={14} className="text-[#d97706]" />
            <span>Achievements / Highlights</span>
          </span>
          <div className="flex flex-col gap-1.5">
            {currentVer?.achievements?.length === 0 ? (
              <span className="text-xs text-slateText-muted italic">No achievements logged.</span>
            ) : (
              currentVer?.achievements?.map((a: string, i: number) => {
                const isKey = currentVer?.keyAchievementIndex === i;
                return (
                  <div
                    key={i}
                    className={`p-2.5 border text-xs flex items-center gap-2 ${
                      isKey ? 'bg-[#fef3c7] border-[#d97706] text-[#92400e] font-bold' : 'bg-[#f8f7f7] border-ink/20'
                    }`}
                  >
                    {isKey && <span className="text-[10px] font-black uppercase bg-[#d97706] text-white px-1.5 py-0.5">Key Highlight</span>}
                    <span>{a}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Hours Breakdown */}
      <div className="p-4 bg-white border border-ink/40 flex flex-col gap-3">
        <span className="text-xs font-black uppercase tracking-wider text-ink flex items-center gap-1.5">
          <Clock size={14} />
          <span>Logged Time Breakdown</span>
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-3 bg-[#f3f2f2] border border-ink/20">
            <span className="text-[10.5px] uppercase font-bold text-slateText-muted">Development</span>
            <div className="text-xl font-black font-mono text-ink">{currentVer?.devHours || 0}h</div>
          </div>
          <div className="p-3 bg-[#f3f2f2] border border-ink/20">
            <span className="text-[10.5px] uppercase font-bold text-slateText-muted">Testing</span>
            <div className="text-xl font-black font-mono text-ink">{currentVer?.testingHours || 0}h</div>
          </div>
          <div className="p-3 bg-[#f3f2f2] border border-ink/20">
            <span className="text-[10.5px] uppercase font-bold text-slateText-muted">Meetings</span>
            <div className="text-xl font-black font-mono text-ink">{currentVer?.meetingHours || 0}h</div>
          </div>
          <div className="p-3 bg-[#f3f2f2] border border-ink/20">
            <span className="text-[10.5px] uppercase font-bold text-slateText-muted">Documentation</span>
            <div className="text-xl font-black font-mono text-ink">{currentVer?.docHours || 0}h</div>
          </div>
        </div>
      </div>

      {/* Version Snapshot Audit Modal */}
      {showVersionModal && currentVer && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[#f3f2f2] border-2 border-ink max-w-2xl w-full p-6 flex flex-col gap-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-ink/30 pb-3">
              <div className="flex items-center gap-2">
                <History size={18} className="text-accent" />
                <h3 className="text-sm font-black uppercase tracking-wider text-ink">
                  Version {currentVer.versionNumber} Snapshot Audit
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowVersionModal(false)}
                className="p-1 hover:bg-[#eae9e9] text-ink cursor-pointer"
                title="Close modal"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-2.5 bg-white border border-ink/20">
                <span className="text-[10px] uppercase font-bold text-slateText-muted">Snapshot</span>
                <div className="text-sm font-black font-mono text-ink">Version {currentVer.versionNumber}</div>
              </div>
              <div className="p-2.5 bg-white border border-ink/20">
                <span className="text-[10px] uppercase font-bold text-slateText-muted">Submitted</span>
                <div className="text-xs font-mono text-ink">{new Date(currentVer.submittedAt).toLocaleDateString()}</div>
              </div>
              <div className="p-2.5 bg-white border border-ink/20">
                <span className="text-[10px] uppercase font-bold text-slateText-muted">Logged Hours</span>
                <div className="text-sm font-black font-mono text-accent">{totalLogged}h</div>
              </div>
              <div className="p-2.5 bg-white border border-ink/20">
                <span className="text-[10px] uppercase font-bold text-slateText-muted">Tasks Logged</span>
                <div className="text-sm font-black font-mono text-ink">{currentVer.tasks?.length || 0}</div>
              </div>
            </div>

            {currentVer.notes && (
              <div className="p-3 bg-white border border-ink/20 text-xs">
                <span className="font-bold uppercase text-[10px] text-slateText-muted block mb-1">
                  Submission Notes
                </span>
                <p className="text-ink italic leading-relaxed">"{currentVer.notes}"</p>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-ink">
                Tasks in this Version
              </span>
              <div className="border border-ink/30 bg-white overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#eae9e9] border-b border-ink/30 text-[10.5px] font-black uppercase text-ink">
                      <th className="p-2">Task</th>
                      <th className="p-2">Status</th>
                      <th className="p-2">Plan</th>
                      <th className="p-2">Actual</th>
                      <th className="p-2">Deliverable</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink/20 font-mono text-[11px]">
                    {currentVer.tasks?.map((t: any, idx: number) => (
                      <tr key={idx} className="hover:bg-[#f8f7f7]">
                        <td className="p-2 font-sans font-semibold text-ink">{t.taskName}</td>
                        <td className="p-2">{t.status}</td>
                        <td className="p-2">{t.plannedHours}h ({t.plannedPercentage}%)</td>
                        <td className="p-2 text-accent font-bold">{t.spentHours}h ({t.actualPercentage}%)</td>
                        <td className="p-2 truncate max-w-[200px]">
                          {renderDeliverableLink(t.deliverableOutput)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-ink/20">
              <button
                type="button"
                onClick={() => setShowVersionModal(false)}
                className="h-9 px-5 bg-ink text-white text-xs font-black uppercase tracking-wider hover:bg-black cursor-pointer"
              >
                Close Audit View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
