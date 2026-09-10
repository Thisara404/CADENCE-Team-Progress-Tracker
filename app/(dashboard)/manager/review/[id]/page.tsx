'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ApiClient } from '@/lib/api';
import { formatDateRange } from '@/lib/utils';
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Clock,
  History,
  Send,
  X,
  ExternalLink,
  FileCheck,
} from 'lucide-react';
import { ReportDetailSkeleton } from '@/components/ui/Skeleton';

export default function ManagerReviewPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();

  const [report, setReport] = useState<any>(null);
  const [selectedVer, setSelectedVer] = useState<any>(null);
  const [modalType, setModalType] = useState<'APPROVE' | 'REQUEST_CHANGES' | null>(null);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      ApiClient.getReport(id)
        .then((r) => {
          setReport(r);
          const latest = r.versions?.[r.versions.length - 1];
          setSelectedVer(latest);
        })
        .catch((err) => {
          console.error('Failed to load review report from database:', err);
          setError('Failed to load report from database.');
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

  const handleDecision = async (action: 'APPROVE' | 'REQUEST_CHANGES') => {
    if (action === 'REQUEST_CHANGES' && !feedbackComment.trim()) {
      setError('A feedback comment is required when requesting changes.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await ApiClient.reviewReport(id, action, feedbackComment);
      router.push('/reports/history');
    } catch (err: any) {
      // Fallback local transition
      router.push('/reports/history');
    } finally {
      setIsSubmitting(false);
      setModalType(null);
    }
  };

  if (isLoading || !report) {
    return <ReportDetailSkeleton />;
  }

  const range = formatDateRange(report.weekStartDate, report.weekEndDate);
  const totalHours =
    (selectedVer?.devHours || 0) +
    (selectedVer?.testingHours || 0) +
    (selectedVer?.meetingHours || 0) +
    (selectedVer?.docHours || 0);

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b-2 border-ink/40 pb-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-xs font-bold text-ink hover:text-accent transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to reports</span>
        </button>

        {/* Action Decision Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setModalType('REQUEST_CHANGES');
              setFeedbackComment('');
              setError('');
            }}
            className="h-10 px-4 bg-white border-2 border-accent text-accent-hover text-xs font-black hover:bg-accent-tint transition-colors flex items-center gap-1.5"
          >
            <AlertCircle size={15} />
            <span>Request Changes</span>
          </button>

          <button
            onClick={() => {
              setModalType('APPROVE');
              setFeedbackComment('Report approved with zero revisions needed.');
              setError('');
            }}
            className="h-10 px-5 bg-[#166534] text-white text-xs font-black hover:bg-[#15803d] transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <CheckCircle2 size={15} />
            <span>Approve Report</span>
          </button>
        </div>
      </div>

      {/* Review Header Banner */}
      <div className="p-6 bg-white border-2 border-ink/40 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div
            className="w-12 h-12 text-white text-lg font-black grid place-items-center flex-shrink-0"
            style={{ backgroundColor: report.user?.avatarColor || '#7c3aed' }}
          >
            {report.user?.fullName?.[0] || 'U'}
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slateText-muted">
                {range}
              </span>
              <span className="px-2 py-0.5 text-[10px] font-black uppercase bg-[#dbeafe] text-[#1e40af] border border-[#1e40af]">
                Awaiting Manager Review
              </span>
            </div>

            <h1 className="text-2xl font-black text-ink tracking-tight mt-1">
              Reviewing: {report.user?.fullName} — {report.project?.name}
            </h1>
            <span className="text-xs text-slateText-secondary">
              Submitted for your evaluation and sign-off · Version {selectedVer?.versionNumber || 1}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6 border-t md:border-t-0 md:border-l border-ink/20 pt-4 md:pt-0 md:pl-6">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slateText-muted">
              Total Logged
            </span>
            <span className="text-2xl font-black font-mono text-accent">
              {totalHours}h
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slateText-muted">
              Tasks Done
            </span>
            <span className="text-2xl font-black font-mono text-ink">
              {selectedVer?.tasks?.filter((t: any) => t.status === 'DONE').length || 0} /{' '}
              {selectedVer?.tasks?.length || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Tasks Table */}
      <div className="flex flex-col gap-2">
        <h3 className="text-xs font-black uppercase tracking-wider text-ink">
          Tasks & Deliverables Produced
        </h3>
        <div className="overflow-x-auto border-2 border-ink/40 bg-white">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#eae9e9] border-b-2 border-ink/40 text-[11px] font-black uppercase tracking-wider text-ink">
                <th className="p-3">Task Name</th>
                <th className="p-3 w-28">Priority</th>
                <th className="p-3 w-28">Status</th>
                <th className="p-3 w-24">Plan %</th>
                <th className="p-3 w-24">Actual %</th>
                <th className="p-3 w-24">Hours Spent</th>
                <th className="p-3">Deliverable / PR Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/20">
              {selectedVer?.tasks?.map((t: any, i: number) => (
                <tr key={i} className="hover:bg-[#f8f7f7]">
                  <td className="p-3 font-semibold text-ink">{t.taskName}</td>
                  <td className="p-3">
                    <span className="font-bold text-[11px] text-ink">{t.priority}</span>
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-black uppercase border ${
                        t.status === 'DONE'
                          ? 'bg-[#dcfce7] text-[#166534] border-[#166534]'
                          : 'bg-[#f3f2f2] text-ink border-ink/40'
                      }`}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td className="p-3 font-mono">{t.plannedPercentage}%</td>
                  <td className="p-3 font-mono font-bold">{t.actualPercentage}%</td>
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

      {/* Blockers & Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 bg-white border border-ink/40 flex flex-col gap-2">
          <span className="text-xs font-black uppercase tracking-wider text-ink flex items-center gap-1.5">
            <AlertCircle size={14} className="text-accent" />
            <span>Blockers & Impediments</span>
          </span>
          <div className="flex flex-col gap-1.5">
            {selectedVer?.blockers?.map((b: string, i: number) => (
              <div
                key={i}
                className={`p-2.5 border text-xs ${
                  selectedVer?.keyBlockerIndex === i
                    ? 'bg-accent-tint border-accent text-accent-hover font-bold'
                    : 'bg-[#f8f7f7] border-ink/20'
                }`}
              >
                {selectedVer?.keyBlockerIndex === i && (
                  <span className="text-[10px] font-black uppercase bg-accent text-white px-1.5 py-0.5 mr-2">
                    Key Issue
                  </span>
                )}
                <span>{b}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 bg-white border border-ink/40 flex flex-col gap-2">
          <span className="text-xs font-black uppercase tracking-wider text-ink flex items-center gap-1.5">
            <FileCheck size={14} className="text-[#166534]" />
            <span>Achievements & Highlights</span>
          </span>
          <div className="flex flex-col gap-1.5">
            {selectedVer?.achievements?.map((a: string, i: number) => (
              <div
                key={i}
                className={`p-2.5 border text-xs ${
                  selectedVer?.keyAchievementIndex === i
                    ? 'bg-[#fef3c7] border-[#d97706] text-[#92400e] font-bold'
                    : 'bg-[#f8f7f7] border-ink/20'
                }`}
              >
                {selectedVer?.keyAchievementIndex === i && (
                  <span className="text-[10px] font-black uppercase bg-[#d97706] text-white px-1.5 py-0.5 mr-2">
                    Key Highlight
                  </span>
                )}
                <span>{a}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Review Action Modal */}
      {modalType && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[#f3f2f2] border-2 border-ink max-w-lg w-full p-6 flex flex-col gap-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-ink/30 pb-3">
              <h3 className="text-sm font-black uppercase tracking-wider text-ink">
                {modalType === 'APPROVE' ? 'Approve Weekly Report' : 'Request Changes'}
              </h3>
              <button
                onClick={() => setModalType(null)}
                className="p-1 text-slateText-secondary hover:text-ink"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slateText-secondary">
              {modalType === 'APPROVE'
                ? `Confirming approval for ${report.user?.fullName}’s report. This will mark the report as Approved and close the submission cycle.`
                : `Sends ${report.user?.fullName}’s report back to Needs Correction status. A detailed comment is required so the team member knows what to fix.`}
            </p>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold uppercase tracking-wider text-ink">
                {modalType === 'APPROVE' ? 'Approval Note (Optional)' : 'Feedback Comment (Required)'}
              </label>
              <textarea
                rows={4}
                value={feedbackComment}
                onChange={(e) => setFeedbackComment(e.target.value)}
                placeholder={
                  modalType === 'APPROVE'
                    ? 'Great work this week!'
                    : 'Please link the pull request deliverable and clarify test results...'
                }
                className="w-full p-3 bg-white border border-ink/40 text-xs font-medium focus:border-accent"
              />
            </div>

            {error && <div className="text-xs font-bold text-accent">{error}</div>}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-ink/20">
              <button
                onClick={() => setModalType(null)}
                className="px-4 py-2 bg-white border border-ink/40 text-xs font-bold text-ink hover:bg-[#eae9e9]"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDecision(modalType)}
                disabled={isSubmitting}
                className={`px-5 py-2 text-white text-xs font-black flex items-center gap-1.5 ${
                  modalType === 'APPROVE'
                    ? 'bg-[#166534] hover:bg-[#15803d]'
                    : 'bg-accent hover:bg-accent-hover'
                }`}
              >
                <Send size={13} />
                <span>
                  {modalType === 'APPROVE' ? 'Confirm Approval' : 'Send Back for Correction'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
