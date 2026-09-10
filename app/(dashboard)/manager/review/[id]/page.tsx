'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { mutate } from 'swr';
import { ApiClient } from '@/lib/api';
import { formatDateRange } from '@/lib/utils';
import {
  parseReviewComment,
  TaskRevisionFeedback,
  BlockerRevisionFeedback,
  HighlightRevisionFeedback,
} from '@/lib/review-feedback';
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Clock,
  History,
  Send,
  X,
  ExternalLink,
  FileCheck,
  Tag,
  MessageSquare,
  Layers,
  Sparkles,
  Check,
} from 'lucide-react';
import { ReportDetailSkeleton } from '@/components/ui/Skeleton';

const QUICK_TASK_TAGS = [
  'Missing PR Link',
  'Recheck Spent Hours',
  'Status Unclear',
  'Needs Test Artifact',
  'Deliverable Incomplete',
  'Clarify Progress %',
];

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

  // Dynamic feedback state
  const [activeFeedbackTab, setActiveFeedbackTab] = useState<'tasks' | 'blockers' | 'highlights' | 'summary'>('tasks');
  const [flaggedTasks, setFlaggedTasks] = useState<TaskRevisionFeedback[]>([]);
  const [blockerFeedback, setBlockerFeedback] = useState<BlockerRevisionFeedback[]>([]);
  const [highlightFeedback, setHighlightFeedback] = useState<HighlightRevisionFeedback[]>([]);

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

  const openRequestChangesModal = () => {
    setModalType('REQUEST_CHANGES');
    setFeedbackComment('');
    setFlaggedTasks([]);
    setBlockerFeedback(
      (selectedVer?.blockers || []).map((b: string) => ({ blocker: b, note: '' }))
    );
    setHighlightFeedback(
      (selectedVer?.achievements || []).map((a: string) => ({ highlight: a, note: '' }))
    );
    setActiveFeedbackTab('tasks');
    setError('');
  };

  const toggleTaskFlag = (taskName: string) => {
    const existing = flaggedTasks.find((f) => f.taskName === taskName);
    if (existing) {
      setFlaggedTasks(flaggedTasks.filter((f) => f.taskName !== taskName));
    } else {
      setFlaggedTasks([
        ...flaggedTasks,
        {
          taskName,
          note: '',
          tags: ['Missing PR Link'],
        },
      ]);
    }
  };

  const updateTaskNote = (taskName: string, note: string) => {
    setFlaggedTasks((prev) =>
      prev.map((f) => (f.taskName === taskName ? { ...f, note } : f))
    );
  };

  const toggleTaskTag = (taskName: string, tag: string) => {
    setFlaggedTasks((prev) =>
      prev.map((f) => {
        if (f.taskName !== taskName) return f;
        const current = f.tags || [];
        const nextTags = current.includes(tag)
          ? current.filter((t) => t !== tag)
          : [...current, tag];
        return { ...f, tags: nextTags };
      })
    );
  };

  const updateBlockerNote = (index: number, note: string) => {
    const updated = [...blockerFeedback];
    if (updated[index]) {
      updated[index] = { ...updated[index], note };
      setBlockerFeedback(updated);
    }
  };

  const updateHighlightNote = (index: number, note: string) => {
    const updated = [...highlightFeedback];
    if (updated[index]) {
      updated[index] = { ...updated[index], note };
      setHighlightFeedback(updated);
    }
  };

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
    if (report?.status === 'DRAFT') {
      setError('Draft reports cannot be reviewed or approved. Drafts are private work-in-progress for team members.');
      return;
    }

    if (report?.status !== 'SUBMITTED') {
      setError(`Cannot review report in ${report?.status} status. Only SUBMITTED reports can be reviewed.`);
      return;
    }

    if (action === 'REQUEST_CHANGES') {
      const activeBlockers = blockerFeedback.filter((b) => b.note && b.note.trim().length > 0);
      const activeHighlights = highlightFeedback.filter((h) => h.note && h.note.trim().length > 0);

      if (feedbackComment.trim().length < 5 && flaggedTasks.length === 0) {
        setError('Please provide an overall revision summary comment (at least 5 characters) or flag at least one task requiring revision.');
        return;
      }

      setIsSubmitting(true);
      setError('');

      const summaryText =
        feedbackComment.trim() ||
        `Please address the ${flaggedTasks.length} flagged task(s) and feedback notes detailed below.`;

      try {
        await ApiClient.reviewReport(id, 'REQUEST_CHANGES', summaryText, {
          taskFeedback: flaggedTasks,
          blockerFeedback: activeBlockers,
          highlightFeedback: activeHighlights,
        });
        await mutate((key) => true, undefined, { revalidate: true });
        router.push('/reports/history');
      } catch (err: any) {
        setError(err.message || 'Failed to submit review decision.');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // APPROVE
    setIsSubmitting(true);
    setError('');

    try {
      await ApiClient.reviewReport(
        id,
        'APPROVE',
        feedbackComment.trim() || 'Report approved with zero revisions needed.'
      );
      await mutate((key) => true, undefined, { revalidate: true });
      router.push('/reports/history');
    } catch (err: any) {
      setError(err.message || 'Failed to submit review decision.');
    } finally {
      setIsSubmitting(false);
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

  const isSubmitted = report.status === 'SUBMITTED';
  const isDraft = report.status === 'DRAFT';
  const isApproved = report.status === 'APPROVED';

  const activeBlockersCount = blockerFeedback.filter((b) => b.note.trim().length > 0).length;
  const activeHighlightsCount = highlightFeedback.filter((h) => h.note.trim().length > 0).length;

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
          {isDraft && (
            <div className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 border-2 border-amber-400 text-amber-900 text-xs font-bold font-mono">
              <AlertCircle size={14} className="text-amber-700 shrink-0" />
              <span>DRAFT — Private WIP (Cannot be reviewed or approved)</span>
            </div>
          )}

          {isApproved && (
            <div className="flex items-center gap-1.5 px-3 py-2 bg-[#dcfce7] border-2 border-[#166534] text-[#166534] text-xs font-bold font-mono">
              <CheckCircle2 size={14} className="shrink-0" />
              <span>APPROVED — Review cycle completed</span>
            </div>
          )}

          {isSubmitted && (
            <>
              <button
                onClick={openRequestChangesModal}
                className="h-10 px-4 bg-white border-2 border-accent text-accent-hover text-xs font-black hover:bg-accent-tint transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <AlertCircle size={15} />
                <span>Request Changes (Dynamic Form)</span>
              </button>

              <button
                onClick={() => {
                  setModalType('APPROVE');
                  setFeedbackComment('Report approved with zero revisions needed.');
                  setError('');
                }}
                className="h-10 px-5 bg-[#166534] text-white text-xs font-black hover:bg-[#15803d] transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <CheckCircle2 size={15} />
                <span>Approve Report</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Draft Warning Banner if user is viewing a draft */}
      {isDraft && (
        <div className="p-4 bg-amber-50 border-2 border-amber-400 text-amber-900 text-xs flex items-start gap-3">
          <AlertCircle size={18} className="text-amber-700 shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1">
            <span className="font-black uppercase tracking-wider text-amber-950">
              Team Member Work-In-Progress Draft
            </span>
            <p className="leading-relaxed">
              This report is currently in <b>DRAFT</b> status. Drafts exist to help team members prepare their deliverables and consult the AI Assistant. Drafts cannot be submitted for manager evaluation, and managers cannot approve or request changes on a draft. Once the team member submits the report, it will enter the review queue.
            </p>
          </div>
        </div>
      )}

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
              <span
                className={`px-2 py-0.5 text-[10px] font-black uppercase border ${
                  isDraft
                    ? 'bg-amber-100 text-amber-800 border-amber-400'
                    : isApproved
                    ? 'bg-[#dcfce7] text-[#166534] border-[#166534]'
                    : isSubmitted
                    ? 'bg-[#dbeafe] text-[#1e40af] border-[#1e40af]'
                    : 'bg-[#f3f2f2] text-ink border-ink/40'
                }`}
              >
                {isDraft
                  ? 'Private Draft'
                  : isApproved
                  ? 'Approved'
                  : isSubmitted
                  ? 'Awaiting Manager Review'
                  : report.status.replace('_', ' ')}
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
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-wider text-ink">
            Tasks & Deliverables Produced
          </h3>
          {isSubmitted && (
            <span className="text-[11px] text-accent font-bold">
              💡 Tip: Click "Request Changes" above to flag specific tasks with issue tags and revision notes.
            </span>
          )}
        </div>

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
            {(!selectedVer?.blockers || selectedVer.blockers.length === 0) && (
              <span className="text-xs text-slateText-muted italic p-2">No blockers reported this week.</span>
            )}
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
            {(!selectedVer?.achievements || selectedVer.achievements.length === 0) && (
              <span className="text-xs text-slateText-muted italic p-2">No achievements reported this week.</span>
            )}
          </div>
        </div>
      </div>

      {/* Review Decision Audit Trail & Comments */}
      {report.reviewComments && report.reviewComments.length > 0 && (
        <div className="p-5 bg-white border-2 border-ink/40 flex flex-col gap-3 mt-2">
          <div className="flex items-center gap-2">
            <History size={16} className="text-accent" />
            <h3 className="text-xs font-black uppercase tracking-wider text-ink">
              Review Cycle Audit History ({report.reviewComments.length})
            </h3>
          </div>

          <div className="flex flex-col gap-3">
            {report.reviewComments.map((rc: any) => {
              const structured = parseReviewComment(rc.comment);
              const isChangeReq = rc.action === 'REQUESTED_CHANGES';

              return (
                <div
                  key={rc.id}
                  className={`p-4 border-2 flex flex-col gap-3 ${
                    isChangeReq ? 'bg-accent-tint/40 border-accent' : 'bg-[#dcfce7]/50 border-[#166534]'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-ink/20 pb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 text-[11px] font-black text-white grid place-items-center"
                        style={{ backgroundColor: rc.reviewer?.avatarColor || '#000000' }}
                      >
                        {rc.reviewer?.fullName?.[0] || 'M'}
                      </div>
                      <span className="text-xs font-black text-ink">
                        {rc.reviewer?.fullName || 'Manager'} ({rc.reviewer?.title || 'Reviewer'})
                      </span>
                      <span
                        className={`text-[9.5px] font-mono font-black uppercase px-2 py-0.5 border ${
                          isChangeReq
                            ? 'bg-accent text-white border-accent'
                            : 'bg-[#166534] text-white border-[#166534]'
                        }`}
                      >
                        {isChangeReq ? 'Changes Requested' : 'Approved'}
                      </span>
                    </div>

                    <span className="text-[10.5px] font-mono text-slateText-secondary">
                      {new Date(rc.createdAt).toLocaleString()}
                    </span>
                  </div>

                  {/* Overall Summary */}
                  {structured.summary && (
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slateText-muted">
                        Review Summary
                      </span>
                      <p className="text-xs font-semibold text-ink bg-white p-2.5 border border-ink/20">
                        {structured.summary}
                      </p>
                    </div>
                  )}

                  {/* Flagged Tasks in this cycle */}
                  {structured.taskFeedback && structured.taskFeedback.length > 0 && (
                    <div className="flex flex-col gap-1.5 pt-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-accent flex items-center gap-1">
                        <Tag size={12} />
                        <span>Tasks Flagged for Revision ({structured.taskFeedback.length}):</span>
                      </span>
                      <div className="grid grid-cols-1 gap-2">
                        {structured.taskFeedback.map((tf, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 bg-white border border-accent/60 flex flex-col gap-1 text-xs"
                          >
                            <div className="flex items-center justify-between font-bold text-ink">
                              <span>• {tf.taskName}</span>
                              <div className="flex flex-wrap gap-1">
                                {tf.tags?.map((tag, tIdx) => (
                                  <span
                                    key={tIdx}
                                    className="px-1.5 py-0.5 bg-accent-tint text-accent-hover text-[9.5px] font-bold border border-accent/40"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                            {tf.note && (
                              <p className="text-[11px] text-ink/90 italic pl-3 border-l-2 border-accent">
                                Directive: {tf.note}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Blocker Directives */}
                  {structured.blockerFeedback && structured.blockerFeedback.length > 0 && (
                    <div className="flex flex-col gap-1.5 pt-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-ink flex items-center gap-1">
                        <AlertCircle size={12} className="text-accent" />
                        <span>Blocker Directives ({structured.blockerFeedback.length}):</span>
                      </span>
                      <div className="flex flex-col gap-1.5">
                        {structured.blockerFeedback.map((bf, idx) => (
                          <div key={idx} className="p-2 bg-white border border-ink/20 text-xs">
                            <span className="font-semibold text-slateText-secondary block">
                              Blocker: "{bf.blocker}"
                            </span>
                            <span className="font-bold text-ink block mt-0.5">
                              Directive: {bf.note}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Highlights Commendations */}
                  {structured.highlightFeedback && structured.highlightFeedback.length > 0 && (
                    <div className="flex flex-col gap-1.5 pt-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#166534] flex items-center gap-1">
                        <Sparkles size={12} />
                        <span>Highlight Commendations ({structured.highlightFeedback.length}):</span>
                      </span>
                      <div className="flex flex-col gap-1.5">
                        {structured.highlightFeedback.map((hf, idx) => (
                          <div key={idx} className="p-2 bg-white border border-[#166534]/40 text-xs">
                            <span className="font-semibold text-slateText-secondary block">
                              Highlight: "{hf.highlight}"
                            </span>
                            <span className="font-bold text-[#166534] block mt-0.5">
                              Commendation: {hf.note}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Review Action Modal */}
      {modalType && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[#f3f2f2] border-2 border-ink max-w-2xl w-full p-6 flex flex-col gap-4 shadow-2xl max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-ink/30 pb-3 shrink-0">
              <div className="flex items-center gap-2">
                {modalType === 'APPROVE' ? (
                  <>
                    <CheckCircle2 size={18} className="text-[#166534]" />
                    <h3 className="text-sm font-black uppercase tracking-wider text-ink">
                      Confirm Report Approval
                    </h3>
                  </>
                ) : (
                  <>
                    <AlertCircle size={18} className="text-accent" />
                    <h3 className="text-sm font-black uppercase tracking-wider text-ink">
                      Dynamic Change Request & Directives Form
                    </h3>
                  </>
                )}
              </div>
              <button
                onClick={() => setModalType(null)}
                className="p-1 text-slateText-secondary hover:text-ink cursor-pointer"
                title="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Subhead Banner */}
            {modalType === 'APPROVE' ? (
              <div className="p-3 bg-[#dcfce7] border-2 border-[#166534] text-[#166534] text-xs flex items-start gap-2.5 shrink-0">
                <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Are you sure you want to approve this weekly report?</p>
                  <p className="mt-0.5 text-[#14532d]">
                    This officially signs off on {report.user?.fullName}’s report for {range} and completes the review cycle.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-accent-tint border-2 border-accent text-accent-hover text-xs flex items-start gap-2.5 shrink-0">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Dynamic Revision Directives</p>
                  <p className="mt-0.5 text-ink">
                    Mention specific tasks needing revision, guide blockers, and commend achievements. {report.user?.fullName} will see structured directives upon opening their report.
                  </p>
                </div>
              </div>
            )}

            {/* Multi-Tab Navigation for Request Changes */}
            {modalType === 'REQUEST_CHANGES' && (
              <div className="flex items-center border-b-2 border-ink/40 gap-1 shrink-0 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setActiveFeedbackTab('tasks')}
                  className={`px-3 py-2 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 border-b-2 -mb-[2px] transition-colors cursor-pointer ${
                    activeFeedbackTab === 'tasks'
                      ? 'border-accent text-accent-hover bg-white'
                      : 'border-transparent text-slateText-muted hover:text-ink'
                  }`}
                >
                  <Tag size={13} />
                  <span>Tasks ({flaggedTasks.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveFeedbackTab('blockers')}
                  className={`px-3 py-2 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 border-b-2 -mb-[2px] transition-colors cursor-pointer ${
                    activeFeedbackTab === 'blockers'
                      ? 'border-accent text-accent-hover bg-white'
                      : 'border-transparent text-slateText-muted hover:text-ink'
                  }`}
                >
                  <AlertCircle size={13} />
                  <span>Blockers ({activeBlockersCount})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveFeedbackTab('highlights')}
                  className={`px-3 py-2 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 border-b-2 -mb-[2px] transition-colors cursor-pointer ${
                    activeFeedbackTab === 'highlights'
                      ? 'border-accent text-accent-hover bg-white'
                      : 'border-transparent text-slateText-muted hover:text-ink'
                  }`}
                >
                  <FileCheck size={13} />
                  <span>Highlights ({activeHighlightsCount})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveFeedbackTab('summary')}
                  className={`px-3 py-2 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 border-b-2 -mb-[2px] transition-colors cursor-pointer ${
                    activeFeedbackTab === 'summary'
                      ? 'border-accent text-accent-hover bg-white'
                      : 'border-transparent text-slateText-muted hover:text-ink'
                  }`}
                >
                  <MessageSquare size={13} />
                  <span>Summary Note *</span>
                </button>
              </div>
            )}

            {/* Scrollable Tab Content for Request Changes */}
            {modalType === 'REQUEST_CHANGES' ? (
              <div className="overflow-y-auto flex-1 pr-1 flex flex-col gap-3 min-h-[220px]">
                {/* 1. TASKS TAB */}
                {activeFeedbackTab === 'tasks' && (
                  <div className="flex flex-col gap-3">
                    <span className="text-[11px] text-slateText-secondary font-medium">
                      Select tasks that require revision, attach specific issue notes, and click quick tags:
                    </span>

                    {selectedVer?.tasks?.map((t: any, i: number) => {
                      const flagged = flaggedTasks.find((f) => f.taskName === t.taskName);

                      return (
                        <div
                          key={i}
                          className={`p-3 border-2 transition-all flex flex-col gap-2 ${
                            flagged
                              ? 'bg-white border-accent shadow-sm'
                              : 'bg-[#faf9f9] border-ink/20 hover:border-ink/50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2.5 cursor-pointer font-bold text-xs text-ink">
                              <input
                                type="checkbox"
                                checked={!!flagged}
                                onChange={() => toggleTaskFlag(t.taskName)}
                                className="w-4 h-4 accent-accent cursor-pointer"
                              />
                              <span className={flagged ? 'text-accent font-black' : ''}>
                                {t.taskName}
                              </span>
                            </label>
                            <span className="text-[10px] font-mono text-slateText-secondary font-bold">
                              {t.status} · {t.spentHours}h · {t.actualPercentage}%
                            </span>
                          </div>

                          {/* Flagged Task Form Controls */}
                          {flagged && (
                            <div className="flex flex-col gap-2 pl-6 pt-1 border-t border-accent/20">
                              <input
                                type="text"
                                value={flagged.note}
                                onChange={(e) => updateTaskNote(t.taskName, e.target.value)}
                                placeholder="Specific revision required (e.g. Missing PR link, please explain spent hours)..."
                                className="p-2 bg-white border border-accent text-xs font-medium focus:border-ink"
                              />

                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="text-[10px] font-bold text-slateText-muted uppercase mr-1">
                                  Quick Tags:
                                </span>
                                {QUICK_TASK_TAGS.map((tag) => {
                                  const hasTag = flagged.tags?.includes(tag);
                                  return (
                                    <button
                                      key={tag}
                                      type="button"
                                      onClick={() => toggleTaskTag(t.taskName, tag)}
                                      className={`px-2 py-0.5 text-[10px] font-bold border transition-colors cursor-pointer ${
                                        hasTag
                                          ? 'bg-accent text-white border-accent'
                                          : 'bg-white text-ink border-ink/30 hover:bg-[#eae9e9]'
                                      }`}
                                    >
                                      {hasTag ? `✓ ${tag}` : `+ ${tag}`}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {(!selectedVer?.tasks || selectedVer.tasks.length === 0) && (
                      <span className="text-xs text-slateText-muted italic">No tasks submitted in this report.</span>
                    )}
                  </div>
                )}

                {/* 2. BLOCKERS TAB */}
                {activeFeedbackTab === 'blockers' && (
                  <div className="flex flex-col gap-3">
                    <span className="text-[11px] text-slateText-secondary font-medium">
                      Provide action directives, unblocking assistance, or architectural guidance for reported blockers:
                    </span>

                    {selectedVer?.blockers?.map((b: string, i: number) => {
                      const bf = blockerFeedback[i] || { blocker: b, note: '' };

                      return (
                        <div key={i} className="p-3 bg-white border-2 border-ink/30 flex flex-col gap-2">
                          <div className="flex items-start gap-2 text-xs">
                            <span className="font-bold text-accent shrink-0">Blocker #{i + 1}:</span>
                            <span className="text-ink font-medium">{b}</span>
                          </div>
                          <input
                            type="text"
                            value={bf.note}
                            onChange={(e) => updateBlockerNote(i, e.target.value)}
                            placeholder="Manager directive (e.g. Reached out to DevOps; will unblock by Monday standup)..."
                            className="p-2 bg-[#f8f7f7] border border-ink/30 text-xs font-medium focus:border-accent"
                          />
                        </div>
                      );
                    })}

                    {(!selectedVer?.blockers || selectedVer.blockers.length === 0) && (
                      <div className="p-4 bg-white border border-ink/20 text-center text-xs text-slateText-muted italic">
                        No blockers reported by member this week.
                      </div>
                    )}
                  </div>
                )}

                {/* 3. HIGHLIGHTS TAB */}
                {activeFeedbackTab === 'highlights' && (
                  <div className="flex flex-col gap-3">
                    <span className="text-[11px] text-slateText-secondary font-medium">
                      Add commendations, encouragement, or feedback on milestones achieved:
                    </span>

                    {selectedVer?.achievements?.map((a: string, i: number) => {
                      const hf = highlightFeedback[i] || { highlight: a, note: '' };

                      return (
                        <div key={i} className="p-3 bg-white border-2 border-[#166534]/30 flex flex-col gap-2">
                          <div className="flex items-start gap-2 text-xs">
                            <span className="font-bold text-[#166534] shrink-0">Highlight #{i + 1}:</span>
                            <span className="text-ink font-medium">{a}</span>
                          </div>
                          <input
                            type="text"
                            value={hf.note}
                            onChange={(e) => updateHighlightNote(i, e.target.value)}
                            placeholder="Praise / Commendation (e.g. Great job shipping the caching layer ahead of time!)..."
                            className="p-2 bg-[#f8f7f7] border border-ink/30 text-xs font-medium focus:border-[#166534]"
                          />
                        </div>
                      );
                    })}

                    {(!selectedVer?.achievements || selectedVer.achievements.length === 0) && (
                      <div className="p-4 bg-white border border-ink/20 text-center text-xs text-slateText-muted italic">
                        No achievements listed by member this week.
                      </div>
                    )}
                  </div>
                )}

                {/* 4. SUMMARY TAB */}
                {activeFeedbackTab === 'summary' && (
                  <div className="flex flex-col gap-2">
                    <label htmlFor="modal-feedback-comment" className="text-xs font-bold uppercase tracking-wider text-ink">
                      Overall Revision Instructions *
                    </label>
                    <textarea
                      id="modal-feedback-comment"
                      rows={5}
                      value={feedbackComment}
                      onChange={(e) => setFeedbackComment(e.target.value)}
                      placeholder="Please provide an overall summary of what needs to be updated before this report can be approved..."
                      className="w-full p-3 bg-white border border-ink/40 text-xs font-medium focus:border-accent"
                    />
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      <span className="text-[10px] font-bold text-slateText-muted uppercase">
                        Quick Snippets:
                      </span>
                      {[
                        'Please verify deliverables & resubmit.',
                        'Spent hours do not match tasks completed.',
                        'Include PR links for completed deliverables.',
                      ].map((snippet) => (
                        <button
                          key={snippet}
                          type="button"
                          onClick={() =>
                            setFeedbackComment((prev) =>
                              prev ? `${prev} ${snippet}` : snippet
                            )
                          }
                          className="px-2 py-0.5 text-[10px] font-semibold bg-white border border-ink/30 hover:bg-[#eae9e9] cursor-pointer"
                        >
                          + {snippet}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // APPROVAL MODAL BODY
              <div className="flex flex-col gap-2">
                <label htmlFor="approval-note" className="text-xs font-bold uppercase tracking-wider text-ink cursor-pointer">
                  Approval Note (Optional)
                </label>
                <textarea
                  id="approval-note"
                  rows={4}
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  placeholder="Great work this week! Report approved with zero revisions needed."
                  className="w-full p-3 bg-white border border-ink/40 text-xs font-medium focus:border-[#166534] cursor-text"
                />
              </div>
            )}

            {error && <div className="text-xs font-bold text-accent shrink-0">{error}</div>}

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-ink/20 shrink-0">
              <div className="text-[11px] text-slateText-secondary font-mono">
                {modalType === 'REQUEST_CHANGES' && (
                  <span>
                    Flagged: <b>{flaggedTasks.length} tasks</b> · <b>{activeBlockersCount} blockers</b> · <b>{activeHighlightsCount} highlights</b>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 bg-white border border-ink/40 text-xs font-bold text-ink hover:bg-[#eae9e9] cursor-pointer"
                >
                  Cancel
                </button>
                {modalType === 'APPROVE' ? (
                  <button
                    type="button"
                    onClick={() => handleDecision('APPROVE')}
                    disabled={isSubmitting}
                    className="px-5 py-2 text-white text-xs font-black uppercase tracking-wider bg-[#166534] hover:bg-[#15803d] transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    <CheckCircle2 size={14} />
                    <span>{isSubmitting ? 'Approving…' : 'Yes, Approve Report'}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleDecision('REQUEST_CHANGES')}
                    disabled={isSubmitting}
                    className="px-5 py-2 text-white text-xs font-black uppercase tracking-wider bg-accent hover:bg-accent-hover transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    <Send size={14} />
                    <span>{isSubmitting ? 'Sending…' : 'Confirm & Request Changes'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
