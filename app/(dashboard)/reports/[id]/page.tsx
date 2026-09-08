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
} from 'lucide-react';

export default function ReportDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const { isManager } = useAuth();

  const [report, setReport] = useState<any>(null);
  const [selectedVersionNum, setSelectedVersionNum] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      ApiClient.getReport(id)
        .then((r) => {
          setReport(r);
          setSelectedVersionNum(r.currentVersionNumber || 1);
        })
        .catch(() => {
          // Fallback mock report
          setReport({
            id,
            weekStartDate: '2026-09-01',
            weekEndDate: '2026-09-05',
            status: 'NEEDS_CORRECTION',
            currentVersionNumber: 1,
            user: {
              fullName: 'Dana Lee',
              email: 'dana@company.com',
              avatarColor: '#059669',
              title: 'DevOps / Cloud Engineer',
            },
            project: {
              name: 'Cloud Migration',
              code: 'CLM-02',
              description: 'Multi-region AWS EKS Kubernetes migration and container optimization',
            },
            versions: [
              {
                versionNumber: 1,
                tasksPlannedNextWeek: 'Set up Terraform configurations for multi-region EKS cluster.',
                blockers: [
                  'Staging AWS quota limit reached for c6g.large instances',
                  'IAM role propagation delay during automated terraform run',
                ],
                keyBlockerIndex: 0,
                achievements: ['Completed Dockerfile optimization, reducing image size by 62%.'],
                keyAchievementIndex: 0,
                devHours: 20,
                testingHours: 10,
                meetingHours: 4,
                docHours: 3,
                notes: 'Quota limit ticket filed with AWS support (ref #9021).',
                submittedAt: '2026-09-05T17:30:00Z',
                tasks: [
                  {
                    taskName: 'Multi-stage Dockerfile overhaul',
                    priority: 'HIGH',
                    status: 'DONE',
                    plannedPercentage: 100,
                    actualPercentage: 100,
                    plannedHours: 12,
                    spentHours: 11,
                    deliverableOutput: '',
                  },
                  {
                    taskName: 'EKS cluster Helm charts setup',
                    priority: 'HIGH',
                    status: 'IN_PROGRESS',
                    plannedPercentage: 80,
                    actualPercentage: 50,
                    plannedHours: 14,
                    spentHours: 16,
                    deliverableOutput: 'Work in branch feat/helm-setup',
                  },
                ],
              },
            ],
            reviewComments: [
              {
                id: 'rc-1',
                action: 'REQUESTED_CHANGES',
                comment:
                  'Please provide the deliverable PR link for the Dockerfile overhaul and update the EKS Helm chart notes before resubmitting.',
                createdAt: '2026-09-06T10:15:00Z',
                reviewer: { fullName: 'Sarah Kim', title: 'Engineering Manager' },
              },
            ],
          });
        })
        .finally(() => setIsLoading(false));
    }
  }, [id]);

  if (isLoading || !report) {
    return (
      <div className="p-8 text-center text-xs font-mono text-slateText-muted">
        Loading report snapshot...
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
        <div className="p-4 bg-[#eae9e9] border border-ink/40 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History size={16} className="text-ink" />
              <span className="text-xs font-black uppercase tracking-wider text-ink">
                Version History Timeline
              </span>
            </div>
            <span className="text-[11px] text-slateText-secondary">
              Select a version snapshot to compare revisions and manager review notes.
            </span>
          </div>

          <div className="flex items-center gap-2 mt-1">
            {versions.map((v: any) => (
              <button
                key={v.versionNumber}
                onClick={() => setSelectedVersionNum(v.versionNumber)}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold border transition-colors ${
                  selectedVersionNum === v.versionNumber
                    ? 'bg-ink text-white border-ink'
                    : 'bg-white text-ink border-ink/30 hover:bg-[#f3f2f2]'
                }`}
              >
                <span>Version {v.versionNumber}</span>
                <span className="text-[10px] opacity-75 font-mono">
                  ({new Date(v.submittedAt).toLocaleDateString()})
                </span>
              </button>
            ))}
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
                    {t.deliverableOutput ? (
                      <span className="flex items-center gap-1 font-mono text-accent truncate">
                        <span>{t.deliverableOutput}</span>
                        {t.deliverableOutput.startsWith('http') && <ExternalLink size={12} />}
                      </span>
                    ) : (
                      <span className="text-slateText-muted italic">None provided</span>
                    )}
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
    </div>
  );
}
