'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { mutate } from 'swr';
import { useAuth } from '@/context/AuthContext';
import { ApiClient } from '@/lib/api';
import { TaskItem, TaskPriority, TaskStatus } from '@/lib/types';
import {
  Save,
  Send,
  Plus,
  Trash2,
  AlertTriangle,
  Flag,
  Trophy,
  CheckCircle,
  Clock,
  X,
  Tag,
  Sparkles,
} from 'lucide-react';
import { parseReviewComment } from '@/lib/review-feedback';
import { WeeklyReportFormSkeleton } from '@/components/ui/Skeleton';

function WeeklyReportFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('id');
  const { user, role, isManager, isAdmin, isLoading: authLoading } = useAuth();

  const [projects, setProjects] = useState<any[]>([]);
  const [projectId, setProjectId] = useState<string>('');
  const [reportId, setReportId] = useState<string | null>(editId || null);

  // Default current week dates (Mon - Fri)
  const [weekStartDate, setWeekStartDate] = useState('2026-09-08');
  const [weekEndDate, setWeekEndDate] = useState('2026-09-12');

  const [status, setStatus] = useState<string>('DRAFT');
  const [managerComment, setManagerComment] = useState<string | null>(null);
  const structuredFeedback = parseReviewComment(managerComment);

  // Tasks table
  const [tasks, setTasks] = useState<TaskItem[]>([
    {
      taskName: '',
      priority: 'HIGH',
      status: 'DONE',
      plannedPercentage: 100,
      actualPercentage: 100,
      plannedHours: 8,
      spentHours: 8,
      deliverableOutput: '',
    },
  ]);

  // Next week
  const [tasksPlannedNextWeek, setTasksPlannedNextWeek] = useState('');

  // Blockers
  const [blockers, setBlockers] = useState<string[]>([]);
  const [keyBlockerIndex, setKeyBlockerIndex] = useState<number | null>(null);

  // Achievements
  const [achievements, setAchievements] = useState<string[]>([]);
  const [keyAchievementIndex, setKeyAchievementIndex] = useState<number | null>(null);

  // Time breakdown
  const [devHours, setDevHours] = useState(0);
  const [testingHours, setTestingHours] = useState(0);
  const [meetingHours, setMeetingHours] = useState(0);
  const [docHours, setDocHours] = useState(0);

  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  useEffect(() => {
    // Load projects from API or fallback
    const p1 = ApiClient.getProjects()
      .then((data) => {
        if (data && data.length) {
          setProjects(data);
          setProjectId((prev) => {
            if (prev) {
              const matched = data.find((p) => p.id === prev || p.code === prev);
              return matched ? matched.id : prev;
            }
            return data[0].id;
          });
        }
      })
      .catch(() => {});

    // If editing existing report, fetch details
    const p2 = editId
      ? ApiClient.getReport(editId)
          .then((r) => {
            if (r) {
              setReportId(r.id);
              setProjectId(r.projectId);
              setWeekStartDate(new Date(r.weekStartDate).toISOString().split('T')[0]);
              setWeekEndDate(new Date(r.weekEndDate).toISOString().split('T')[0]);
              setStatus(r.status);

              const latestVer = r.versions?.[r.versions.length - 1];
              if (latestVer) {
                setTasks(latestVer.tasks || []);
                setTasksPlannedNextWeek(latestVer.tasksPlannedNextWeek || '');
                setBlockers(latestVer.blockers || []);
                setKeyBlockerIndex(latestVer.keyBlockerIndex ?? null);
                setAchievements(latestVer.achievements || []);
                setKeyAchievementIndex(latestVer.keyAchievementIndex ?? null);
                setDevHours(latestVer.devHours || 0);
                setTestingHours(latestVer.testingHours || 0);
                setMeetingHours(latestVer.meetingHours || 0);
                setDocHours(latestVer.docHours || 0);
                setNotes(latestVer.notes || '');
              }

              if (r.reviewComments && r.reviewComments.length > 0) {
                setManagerComment(r.reviewComments[0].comment);
              }
            }
          })
          .catch(() => {})
      : Promise.resolve();

    Promise.all([p1, p2]).finally(() => {
      setIsInitialLoading(false);
    });
  }, [editId]);

  // RBAC Guard: Admins and Managers cannot author or submit weekly reports
  useEffect(() => {
    if (!authLoading && (isAdmin || isManager || (role && role !== 'TEAM_MEMBER'))) {
      router.replace('/reports/history');
    }
  }, [authLoading, isAdmin, isManager, role, router]);

  // Listen for AI assistant internal tool autofill event & hydrate from sessionStorage
  useEffect(() => {
    const applyAutofill = (data: any) => {
      if (!data) return;
      if (data.projectId || data.projectCode) {
        setProjectId((current) => {
          const matched = projects.find(
            (p) =>
              (data.projectId && p.id === data.projectId) ||
              (data.projectCode && p.code?.toLowerCase() === data.projectCode?.toLowerCase()) ||
              (data.projectCode && p.name?.toLowerCase().includes(data.projectCode?.toLowerCase())) ||
              (data.projectName && p.name?.toLowerCase().includes(data.projectName?.toLowerCase()))
          );
          return matched ? matched.id : data.projectId || current;
        });
      }
      if (data.tasks && Array.isArray(data.tasks) && data.tasks.length > 0) {
        setTasks(
          data.tasks.map((t: any) => ({
            taskName: t.taskName || '',
            priority: t.priority || 'MEDIUM',
            status: t.status || 'IN_PROGRESS',
            plannedPercentage: t.plannedPercentage ?? 100,
            actualPercentage: t.actualPercentage ?? 0,
            plannedHours: t.plannedHours ?? 4,
            spentHours: t.spentHours ?? 0,
            deliverableOutput: t.deliverableOutput || '',
          }))
        );
      }
      if (data.blockers && Array.isArray(data.blockers)) {
        setBlockers(data.blockers);
      }
      if (data.keyBlockerIndex !== undefined && data.keyBlockerIndex !== null) {
        setKeyBlockerIndex(data.keyBlockerIndex);
      }
      if (data.achievements && Array.isArray(data.achievements)) {
        setAchievements(data.achievements);
      }
      if (data.keyAchievementIndex !== undefined && data.keyAchievementIndex !== null) {
        setKeyAchievementIndex(data.keyAchievementIndex);
      }
      if (data.devHours !== undefined) setDevHours(Number(data.devHours));
      if (data.testingHours !== undefined) setTestingHours(Number(data.testingHours));
      if (data.meetingHours !== undefined) setMeetingHours(Number(data.meetingHours));
      if (data.docHours !== undefined) setDocHours(Number(data.docHours));
      if (data.tasksPlannedNextWeek) setTasksPlannedNextWeek(data.tasksPlannedNextWeek);

      setFeedbackMsg({
        type: 'ok',
        text: `⚡ AI Assistant internal tool auto-filled ${data.tasks?.length || 0} tasks, blockers, achievements, and hours!`,
      });
    };

    const handleCustomEvent = (e: any) => {
      applyAutofill(e.detail);
    };

    window.addEventListener('cadence:ai-autofill', handleCustomEvent);

    try {
      const cached = sessionStorage.getItem('cadence_pending_autofill');
      if (cached) {
        sessionStorage.removeItem('cadence_pending_autofill');
        const parsed = JSON.parse(cached);
        applyAutofill(parsed);
      }
    } catch (err) {
      console.error('Failed to parse cached autofill data:', err);
    }

    return () => {
      window.removeEventListener('cadence:ai-autofill', handleCustomEvent);
    };
  }, []);

  // Add / remove task
  const addTask = () => {
    setTasks([
      ...tasks,
      {
        taskName: '',
        priority: 'MEDIUM',
        status: 'TODO',
        plannedPercentage: 100,
        actualPercentage: 0,
        plannedHours: 4,
        spentHours: 0,
        deliverableOutput: '',
      },
    ]);
  };

  const updateTask = (index: number, field: keyof TaskItem, val: any) => {
    const updated = [...tasks];
    updated[index] = { ...updated[index], [field]: val };
    setTasks(updated);
  };

  const removeTask = (index: number) => {
    const task = tasks[index];
    if (task && task.taskName.trim().length > 0) {
      if (!confirm(`Are you sure you want to remove the task "${task.taskName}"?`)) {
        return;
      }
    }
    setTasks(tasks.filter((_, i) => i !== index));
  };

  // Add / remove blocker
  const addBlocker = () => {
    setBlockers([...blockers, '']);
  };
  const updateBlocker = (index: number, val: string) => {
    const updated = [...blockers];
    updated[index] = val;
    setBlockers(updated);
  };
  const removeBlocker = (index: number) => {
    const val = blockers[index];
    if (val && val.trim().length > 0) {
      if (!confirm(`Are you sure you want to remove this blocker: "${val.trim()}"?`)) {
        return;
      }
    }
    setBlockers(blockers.filter((_, i) => i !== index));
    if (keyBlockerIndex === index) setKeyBlockerIndex(null);
  };

  // Add / remove achievement
  const addAchievement = () => {
    setAchievements([...achievements, '']);
  };
  const updateAchievement = (index: number, val: string) => {
    const updated = [...achievements];
    updated[index] = val;
    setAchievements(updated);
  };
  const removeAchievement = (index: number) => {
    const val = achievements[index];
    if (val && val.trim().length > 0) {
      if (!confirm(`Are you sure you want to remove this achievement: "${val.trim()}"?`)) {
        return;
      }
    }
    setAchievements(achievements.filter((_, i) => i !== index));
    if (keyAchievementIndex === index) setKeyAchievementIndex(null);
  };

  // Save Draft
  // Form validation helper
  const validateReport = (isDraft: boolean) => {
    if (!projectId) {
      setFeedbackMsg({ type: 'err', text: 'Please select a project category.' });
      return false;
    }
    if (!weekStartDate || !weekEndDate) {
      setFeedbackMsg({ type: 'err', text: 'Both week start date and end date are required.' });
      return false;
    }
    if (new Date(weekEndDate) < new Date(weekStartDate)) {
      setFeedbackMsg({ type: 'err', text: 'Week end date cannot be earlier than week start date.' });
      return false;
    }

    if (Number(devHours) < 0 || Number(testingHours) < 0 || Number(meetingHours) < 0 || Number(docHours) < 0) {
      setFeedbackMsg({ type: 'err', text: 'Hours worked by task type cannot be negative.' });
      return false;
    }

    // Strict validation for submission
    if (!isDraft) {
      if (tasks.length === 0) {
        setFeedbackMsg({ type: 'err', text: 'Please include at least one task in the report.' });
        return false;
      }
      for (let i = 0; i < tasks.length; i++) {
        const t = tasks[i];
        if (!t.taskName || !t.taskName.trim()) {
          setFeedbackMsg({ type: 'err', text: `Task #${i + 1} is missing a task name.` });
          return false;
        }
        if (Number(t.plannedHours) < 0 || Number(t.spentHours) < 0) {
          setFeedbackMsg({ type: 'err', text: `Hours cannot be negative for task #${i + 1}.` });
          return false;
        }
        if (
          Number(t.plannedPercentage) < 0 ||
          Number(t.plannedPercentage) > 100 ||
          Number(t.actualPercentage) < 0 ||
          Number(t.actualPercentage) > 100
        ) {
          setFeedbackMsg({ type: 'err', text: `Completion percentage must be between 0% and 100% for task #${i + 1}.` });
          return false;
        }
      }
    }

    return true;
  };

  // Helper to sanitize tasks (removes DB internal properties like id, reportVersionId)
  const getSanitizedTasks = () => {
    return tasks
      .filter((t) => t.taskName && t.taskName.trim().length > 0)
      .map((t) => ({
        taskName: t.taskName.trim(),
        priority: t.priority || 'MEDIUM',
        status: t.status || 'TODO',
        plannedPercentage: Math.min(100, Math.max(0, Number(t.plannedPercentage) || 0)),
        actualPercentage: Math.min(100, Math.max(0, Number(t.actualPercentage) || 0)),
        plannedHours: Math.max(0, Number(t.plannedHours) || 0),
        spentHours: Math.max(0, Number(t.spentHours) || 0),
        deliverableOutput: t.deliverableOutput?.trim() || undefined,
      }));
  };

  // Save Draft (Private WIP for team member)
  const handleSaveDraft = async () => {
    if (!validateReport(true)) return;

    setIsLoading(true);
    setFeedbackMsg(null);

    const payload = {
      reportId: reportId || undefined,
      projectId,
      weekStartDate,
      weekEndDate,
      tasksPlannedNextWeek,
      blockers: blockers.filter((b) => b.trim().length > 0),
      keyBlockerIndex,
      achievements: achievements.filter((a) => a.trim().length > 0),
      keyAchievementIndex,
      devHours: Math.max(0, Number(devHours) || 0),
      testingHours: Math.max(0, Number(testingHours) || 0),
      meetingHours: Math.max(0, Number(meetingHours) || 0),
      docHours: Math.max(0, Number(docHours) || 0),
      notes,
      tasks: getSanitizedTasks(),
    };

    try {
      const res = await ApiClient.saveDraft(payload);
      if (res && res.id) setReportId(res.id);
      setStatus('DRAFT');
      await mutate((key) => true, undefined, { revalidate: true });
      setFeedbackMsg({
        type: 'ok',
        text: 'Report saved as private draft. Managers cannot see or review drafts until you submit.',
      });
    } catch (err: any) {
      setFeedbackMsg({ type: 'err', text: err.message || 'Failed to save draft.' });
    } finally {
      setIsLoading(false);
    }
  };

  const [showSubmitConfirmModal, setShowSubmitConfirmModal] = useState(false);

  // Open confirmation modal after client validation
  const handleOpenSubmitConfirm = () => {
    if (!validateReport(false)) return;
    setShowSubmitConfirmModal(true);
  };

  // Formal submission executed after user confirms modal
  const executeSubmitReport = async () => {
    setShowSubmitConfirmModal(false);
    setIsLoading(true);
    setFeedbackMsg(null);

    const payload = {
      projectId,
      weekStartDate,
      weekEndDate,
      tasksPlannedNextWeek,
      blockers: blockers.filter((b) => b.trim().length > 0),
      keyBlockerIndex,
      achievements: achievements.filter((a) => a.trim().length > 0),
      keyAchievementIndex,
      devHours: Math.max(0, Number(devHours) || 0),
      testingHours: Math.max(0, Number(testingHours) || 0),
      meetingHours: Math.max(0, Number(meetingHours) || 0),
      docHours: Math.max(0, Number(docHours) || 0),
      notes,
      tasks: getSanitizedTasks(),
    };

    try {
      let activeId = reportId;
      if (!activeId) {
        const draftRes = await ApiClient.saveDraft(payload);
        activeId = draftRes.id;
      }
      await ApiClient.submitReport(activeId!, payload);
      setStatus('SUBMITTED');
      await mutate((key) => true, undefined, { revalidate: true });
      setFeedbackMsg({
        type: 'ok',
        text: 'Report submitted successfully! Your manager has been notified for review.',
      });
      setTimeout(() => {
        router.push('/reports/history');
      }, 1200);
    } catch (err: any) {
      setFeedbackMsg({
        type: 'err',
        text: err.message || 'Failed to submit report. Please check the form errors.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const totalLoggedHours =
    (Number(devHours) || 0) +
    (Number(testingHours) || 0) +
    (Number(meetingHours) || 0) +
    (Number(docHours) || 0);

  if (!authLoading && (isAdmin || isManager || (role && role !== 'TEAM_MEMBER'))) {
    return (
      <div className="p-8 bg-white border-2 border-ink text-center flex flex-col items-center justify-center gap-3 shadow-sm my-8">
        <AlertTriangle className="text-accent" size={32} />
        <h2 className="text-base font-black text-ink uppercase tracking-wide">
          Access Restricted: Team Members Only
        </h2>
        <p className="text-xs text-slateText-secondary max-w-md">
          Admins and Managers cannot author or submit weekly reports. Redirecting to Reports History...
        </p>
      </div>
    );
  }

  if (isInitialLoading) {
    return <WeeklyReportFormSkeleton />;
  }

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-ink/40 pb-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold tracking-widest uppercase text-slateText-muted font-mono">
              Individual Submission
            </span>
            <span
              className={`px-2 py-0.5 text-[10.5px] font-black uppercase ${
                status === 'APPROVED'
                  ? 'bg-[#dcfce7] text-[#166534] border border-[#166534]'
                  : status === 'NEEDS_CORRECTION'
                  ? 'bg-accent-tint text-accent-hover border border-accent'
                  : status === 'SUBMITTED'
                  ? 'bg-[#dbeafe] text-[#1e40af] border border-[#1e40af]'
                  : 'bg-[#f3f2f2] text-ink border border-ink/40'
              }`}
            >
              {status.replace('_', ' ')}
            </span>
          </div>
          <h1 className="text-2xl font-black text-ink tracking-tight mt-1">
            Weekly Work Report
          </h1>
          <p className="text-xs text-slateText-secondary">
            Fixed standardized report format. All fields are consistent across the entire engineering organization.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleSaveDraft}
            disabled={isLoading || status === 'SUBMITTED' || status === 'APPROVED'}
            className="flex items-center gap-1.5 h-10 px-4 bg-white border border-ink/40 text-xs font-bold text-ink hover:bg-[#eae9e9] disabled:opacity-50 transition-colors"
          >
            <Save size={14} />
            <span>Save as Draft</span>
          </button>

          <button
            onClick={handleOpenSubmitConfirm}
            disabled={isLoading || status === 'SUBMITTED' || status === 'APPROVED'}
            className="flex items-center gap-1.5 h-10 px-5 bg-accent text-white text-xs font-black hover:bg-accent-hover disabled:opacity-50 transition-colors shadow-sm cursor-pointer"
          >
            <Send size={14} />
            <span>
              {status === 'NEEDS_CORRECTION' ? 'Resubmit for Review' : 'Submit Report'}
            </span>
          </button>
        </div>
      </div>

      {/* Feedback Toast Banner */}
      {feedbackMsg && (
        <div
          className={`flex items-center gap-2 p-3 border text-xs font-semibold ${
            feedbackMsg.type === 'ok'
              ? 'bg-[#dcfce7] border-[#166534] text-[#166534]'
              : 'bg-accent-tint border-accent text-accent-hover'
          }`}
        >
          <CheckCircle size={15} />
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Needs Correction Structured Feedback Directives */}
      {status === 'NEEDS_CORRECTION' && managerComment && (() => {
        const structuredFeedback = parseReviewComment(managerComment);
        return (
          <div className="p-5 bg-accent-tint border-2 border-accent flex flex-col gap-3 shadow-sm">
            <div className="flex items-center justify-between border-b border-accent/30 pb-2">
              <div className="flex items-center gap-2 text-accent-hover text-xs font-black uppercase tracking-wider">
                <AlertTriangle size={18} />
                <span>Manager Revision Directives — Changes Requested</span>
              </div>
              <span className="text-[10px] font-mono font-black uppercase bg-accent text-white px-2 py-0.5">
                Action Required
              </span>
            </div>

            {/* Overall Summary */}
            {structuredFeedback.summary && (
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slateText-muted">
                  Revision Summary
                </span>
                <p className="text-xs font-semibold text-ink bg-white p-3 border border-accent/40 leading-relaxed italic">
                  "{structuredFeedback.summary}"
                </p>
              </div>
            )}

            {/* Specific Flagged Tasks */}
            {structuredFeedback.taskFeedback && structuredFeedback.taskFeedback.length > 0 && (
              <div className="flex flex-col gap-1.5 pt-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-accent flex items-center gap-1.5">
                  <Tag size={13} />
                  <span>Specific Tasks Flagged for Revision ({structuredFeedback.taskFeedback.length}):</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {structuredFeedback.taskFeedback.map((tf, i) => (
                    <div key={i} className="p-2.5 bg-white border border-accent flex flex-col gap-1 text-xs">
                      <div className="flex items-center justify-between font-bold text-ink">
                        <span>• {tf.taskName}</span>
                        <div className="flex flex-wrap gap-1">
                          {tf.tags?.map((tag, ti) => (
                            <span key={ti} className="px-1.5 py-0.2 bg-accent text-white text-[9px] font-bold">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      {tf.note && (
                        <p className="text-[11px] text-ink/90 italic pl-2 border-l-2 border-accent">
                          Directive: {tf.note}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Blocker Directives */}
            {structuredFeedback.blockerFeedback && structuredFeedback.blockerFeedback.length > 0 && (
              <div className="flex flex-col gap-1.5 pt-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-ink flex items-center gap-1.5">
                  <AlertTriangle size={13} className="text-accent" />
                  <span>Manager Blocker Directives ({structuredFeedback.blockerFeedback.length}):</span>
                </span>
                <div className="flex flex-col gap-1.5">
                  {structuredFeedback.blockerFeedback.map((bf, i) => (
                    <div key={i} className="p-2 bg-white border border-ink/20 text-xs">
                      <span className="font-semibold text-slateText-secondary block">Blocker: "{bf.blocker}"</span>
                      <span className="font-bold text-ink block mt-0.5">Manager Directive: {bf.note}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Highlight Commendations */}
            {structuredFeedback.highlightFeedback && structuredFeedback.highlightFeedback.length > 0 && (
              <div className="flex flex-col gap-1.5 pt-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#166534] flex items-center gap-1.5">
                  <Sparkles size={13} />
                  <span>Manager Commendations ({structuredFeedback.highlightFeedback.length}):</span>
                </span>
                <div className="flex flex-col gap-1.5">
                  {structuredFeedback.highlightFeedback.map((hf, i) => (
                    <div key={i} className="p-2 bg-white border border-[#166534]/40 text-xs">
                      <span className="font-semibold text-slateText-secondary block">Achievement: "{hf.highlight}"</span>
                      <span className="font-bold text-[#166534] block mt-0.5">Praise: {hf.note}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <span className="text-[11px] text-slateText-secondary pt-1 border-t border-accent/20">
              Please revise the highlighted deliverables or hours below, then click <b>Resubmit for Review</b>. A new version snapshot will be archived.
            </span>
          </div>
        );
      })()}

      {/* Approved Lock Alert */}
      {status === 'APPROVED' && (
        <div className="p-4 bg-[#dcfce7] border-2 border-[#166534] text-[#166534] text-xs font-bold flex items-center gap-2">
          <CheckCircle size={16} className="shrink-0" />
          <span>This weekly report has already been approved by your manager and is locked from modification.</span>
        </div>
      )}

      {/* Draft Mode Notice */}
      {status === 'DRAFT' && (
        <div className="p-3 bg-[#e0f2fe] border border-[#7dd3fc] text-[#0369a1] text-xs flex items-center gap-2">
          <Clock size={15} className="shrink-0 text-[#0284c7]" />
          <span>
            <b>Private Draft Mode:</b> This report is saved only for you. Your manager cannot view or review it until you click <b>Submit Report</b>.
          </span>
        </div>
      )}

      {/* Section 1: Week & Project Category */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-white border border-ink/40">
        <div className="flex flex-col gap-1">
          <label htmlFor="report-project" className="text-xs font-bold uppercase tracking-wider text-ink cursor-pointer">
            Project / Category *
          </label>
          <select
            id="report-project"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            disabled={status === 'APPROVED'}
            className="h-9 px-3 bg-[#f3f2f2] border border-ink/40 text-xs font-medium focus:border-ink cursor-pointer"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.code})
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="report-week-start" className="text-xs font-bold uppercase tracking-wider text-ink cursor-pointer">
            Week Start Date *
          </label>
          <input
            id="report-week-start"
            type="date"
            value={weekStartDate}
            onChange={(e) => setWeekStartDate(e.target.value)}
            disabled={status === 'APPROVED'}
            className="h-9 px-3 bg-[#f3f2f2] border border-ink/40 text-xs font-medium focus:border-ink cursor-text"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="report-week-end" className="text-xs font-bold uppercase tracking-wider text-ink cursor-pointer">
            Week End Date *
          </label>
          <input
            id="report-week-end"
            type="date"
            value={weekEndDate}
            onChange={(e) => setWeekEndDate(e.target.value)}
            disabled={status === 'APPROVED'}
            className="h-9 px-3 bg-[#f3f2f2] border border-ink/40 text-xs font-medium focus:border-ink cursor-text"
          />
        </div>
      </div>

      {/* Section 2: Tasks Completed Breakdown Table */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <h3 className="text-sm font-black uppercase tracking-wider text-ink">
              1. Tasks Completed & Progress Table
            </h3>
            <span className="text-[11px] text-slateText-secondary">
              Break down tasks worked on during this period, completion rate, hours, and PR/deliverable links.
            </span>
          </div>

          <button
            onClick={addTask}
            className="flex items-center gap-1 h-8 px-3 bg-ink text-white text-xs font-bold hover:bg-accent transition-colors"
          >
            <Plus size={14} />
            <span>Add Task Row</span>
          </button>
        </div>

        <div className="overflow-x-auto border-2 border-ink/40 bg-white">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#eae9e9] border-b-2 border-ink/40 text-[11px] font-black uppercase tracking-wider text-ink">
                <th className="p-3 w-1/3">Task Name</th>
                <th className="p-3 w-28">Priority</th>
                <th className="p-3 w-32">Status</th>
                <th className="p-3 w-28">Planned %</th>
                <th className="p-3 w-28">Actual %</th>
                <th className="p-3 w-24">Plan (h)</th>
                <th className="p-3 w-24">Spent (h)</th>
                <th className="p-3">Deliverable / PR Link</th>
                <th className="p-3 w-12 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/20">
              {tasks.map((task, idx) => {
                const flaggedDirective =
                  status === 'NEEDS_CORRECTION'
                    ? structuredFeedback.taskFeedback?.find(
                        (tf) =>
                          tf.taskName.trim().length > 0 &&
                          task.taskName.trim().length > 0 &&
                          tf.taskName.trim().toLowerCase() === task.taskName.trim().toLowerCase()
                      )
                    : null;

                return (
                  <tr
                    key={idx}
                    className={`transition-colors ${
                      flaggedDirective ? 'bg-accent-tint/30 hover:bg-accent-tint/40' : 'hover:bg-[#f8f7f7]'
                    }`}
                  >
                    <td className="p-2">
                      {flaggedDirective && (
                        <div className="mb-1 p-1 px-1.5 bg-accent text-white text-[9.5px] font-black flex flex-wrap items-center justify-between gap-1 shadow-xs">
                          <span className="flex items-center gap-1">
                            <AlertTriangle size={11} className="shrink-0" />
                            <span>Flagged by Manager: {flaggedDirective.note || 'Revision required'}</span>
                          </span>
                          {flaggedDirective.tags && flaggedDirective.tags.length > 0 && (
                            <div className="flex items-center gap-1">
                              {flaggedDirective.tags.map((tag, ti) => (
                                <span key={ti} className="bg-black/30 px-1 py-0.2 rounded text-[8.5px] uppercase font-mono">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                      <input
                        type="text"
                        value={task.taskName}
                        onChange={(e) => updateTask(idx, 'taskName', e.target.value)}
                        placeholder="e.g. Navigation drawer gesture handling"
                        className={`w-full h-8 px-2 bg-[#f3f2f2] border text-xs font-medium ${
                          flaggedDirective ? 'border-accent font-bold ring-1 ring-accent' : 'border-ink/30'
                        }`}
                      />
                    </td>
                  <td className="p-2">
                    <select
                      value={task.priority}
                      onChange={(e) => updateTask(idx, 'priority', e.target.value as TaskPriority)}
                      className="w-full h-8 px-2 bg-[#f3f2f2] border border-ink/30 text-xs font-semibold"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                    </select>
                  </td>
                  <td className="p-2">
                    <select
                      value={task.status}
                      onChange={(e) => updateTask(idx, 'status', e.target.value as TaskStatus)}
                      className="w-full h-8 px-2 bg-[#f3f2f2] border border-ink/30 text-xs font-bold"
                    >
                      <option value="TODO">To Do</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="BLOCKED">Blocked</option>
                      <option value="DONE">Done</option>
                    </select>
                  </td>
                  <td className="p-2">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={task.plannedPercentage}
                      onChange={(e) => updateTask(idx, 'plannedPercentage', Number(e.target.value))}
                      className="w-full h-8 px-2 bg-[#f3f2f2] border border-ink/30 text-xs font-mono"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={task.actualPercentage}
                      onChange={(e) => updateTask(idx, 'actualPercentage', Number(e.target.value))}
                      className="w-full h-8 px-2 bg-[#f3f2f2] border border-ink/30 text-xs font-mono font-bold"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="number"
                      min={0}
                      step={0.5}
                      value={task.plannedHours}
                      onChange={(e) => updateTask(idx, 'plannedHours', Number(e.target.value))}
                      className="w-full h-8 px-2 bg-[#f3f2f2] border border-ink/30 text-xs font-mono"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="number"
                      min={0}
                      step={0.5}
                      value={task.spentHours}
                      onChange={(e) => updateTask(idx, 'spentHours', Number(e.target.value))}
                      className="w-full h-8 px-2 bg-[#f3f2f2] border border-ink/30 text-xs font-mono font-bold text-accent"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      value={task.deliverableOutput || ''}
                      onChange={(e) => updateTask(idx, 'deliverableOutput', e.target.value)}
                      placeholder="PR #123 / Notion link"
                      className="w-full h-8 px-2 bg-[#f3f2f2] border border-ink/30 text-xs"
                    />
                  </td>
                  <td className="p-2 text-center">
                    <button
                      onClick={() => removeTask(idx)}
                      disabled={tasks.length <= 1}
                      className="p-1 text-slateText-muted hover:text-accent disabled:opacity-30"
                      title="Remove row"
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              );
            })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 3: Tasks Planned for Next Week */}
      <div className="flex flex-col gap-2">
        <label htmlFor="report-next-week" className="text-sm font-black uppercase tracking-wider text-ink cursor-pointer">
          2. Tasks Planned for Next Week
        </label>
        <textarea
          id="report-next-week"
          rows={3}
          value={tasksPlannedNextWeek}
          onChange={(e) => setTasksPlannedNextWeek(e.target.value)}
          disabled={status === 'APPROVED'}
          placeholder="Outline deliverables and milestones targeted for the upcoming sprint..."
          className="w-full p-3 bg-white border border-ink/40 text-xs font-medium focus:border-ink cursor-text"
        />
      </div>

      {/* Section 4 & 5: Blockers and Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Blockers */}
        <div className="flex flex-col gap-3 p-4 bg-white border border-ink/40">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs font-black uppercase tracking-wider text-ink flex items-center gap-1.5">
                <AlertTriangle size={14} className="text-accent" />
                <span>3. Blockers / Challenges</span>
              </span>
              <span className="text-[10.5px] text-slateText-secondary">
                Click the flag icon to designate the <b>Key Issue of the Week</b>.
              </span>
            </div>
            <button
              onClick={addBlocker}
              className="text-[11px] font-bold bg-[#eae9e9] hover:bg-ink hover:text-white px-2 py-1 border border-ink/30 transition-colors"
            >
              + Add Blocker
            </button>
          </div>

          <div className="flex flex-col gap-2">
            {blockers.map((blocker, idx) => {
              const isKey = keyBlockerIndex === idx;
              return (
                <div
                  key={idx}
                  className={`flex items-center gap-2 p-2 border ${
                    isKey ? 'bg-accent-tint border-accent' : 'bg-[#f8f7f7] border-ink/20'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setKeyBlockerIndex(isKey ? null : idx)}
                    className={`p-1 transition-colors ${
                      isKey ? 'text-accent' : 'text-slateText-muted hover:text-ink'
                    }`}
                    title={isKey ? 'Key issue flagged' : 'Flag as Key Issue of the Week'}
                  >
                    <Flag size={15} fill={isKey ? '#ec3013' : 'none'} />
                  </button>

                  <input
                    type="text"
                    value={blocker}
                    onChange={(e) => updateBlocker(idx, e.target.value)}
                    placeholder="Describe impediment or dependency..."
                    className="flex-1 bg-transparent text-xs font-medium focus:outline-none"
                  />

                  <button
                    onClick={() => removeBlocker(idx)}
                    className="p-1 text-slateText-muted hover:text-accent"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Achievements */}
        <div className="flex flex-col gap-3 p-4 bg-white border border-ink/40">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs font-black uppercase tracking-wider text-ink flex items-center gap-1.5">
                <Trophy size={14} className="text-[#d97706]" />
                <span>4. Achievements / Highlights</span>
              </span>
              <span className="text-[10.5px] text-slateText-secondary">
                Click trophy to flag the <b>Key Achievement of the Week</b>.
              </span>
            </div>
            <button
              onClick={addAchievement}
              className="text-[11px] font-bold bg-[#eae9e9] hover:bg-ink hover:text-white px-2 py-1 border border-ink/30 transition-colors"
            >
              + Add Highlight
            </button>
          </div>

          <div className="flex flex-col gap-2">
            {achievements.map((achievement, idx) => {
              const isKey = keyAchievementIndex === idx;
              return (
                <div
                  key={idx}
                  className={`flex items-center gap-2 p-2 border ${
                    isKey ? 'bg-[#fef3c7] border-[#d97706]' : 'bg-[#f8f7f7] border-ink/20'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setKeyAchievementIndex(isKey ? null : idx)}
                    className={`p-1 transition-colors ${
                      isKey ? 'text-[#d97706]' : 'text-slateText-muted hover:text-ink'
                    }`}
                    title={isKey ? 'Key achievement flagged' : 'Flag as Key Achievement'}
                  >
                    <Trophy size={15} fill={isKey ? '#d97706' : 'none'} />
                  </button>

                  <input
                    type="text"
                    value={achievement}
                    onChange={(e) => updateAchievement(idx, e.target.value)}
                    placeholder="Highlight a milestone or deliverable..."
                    className="flex-1 bg-transparent text-xs font-medium focus:outline-none"
                  />

                  <button
                    onClick={() => removeAchievement(idx)}
                    className="p-1 text-slateText-muted hover:text-accent"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Section 6: Hours Worked by Task Type */}
      <div className="flex flex-col gap-3 p-4 bg-white border border-ink/40">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <h3 className="text-sm font-black uppercase tracking-wider text-ink flex items-center gap-1.5">
              <Clock size={15} />
              <span>5. Hours Worked by Task Type</span>
            </h3>
            <span className="text-[11px] text-slateText-secondary">
              Total logged hours: <b>{totalLoggedHours}h</b> across development, testing, meetings, and documentation.
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="report-dev-hours" className="text-xs font-bold uppercase tracking-wider text-ink cursor-pointer">
              Development (h)
            </label>
            <input
              id="report-dev-hours"
              type="number"
              min={0}
              step={0.5}
              value={devHours}
              onChange={(e) => setDevHours(Number(e.target.value))}
              disabled={status === 'APPROVED'}
              className="h-9 px-3 bg-[#f3f2f2] border border-ink/40 text-xs font-mono font-bold focus:border-ink cursor-text"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="report-testing-hours" className="text-xs font-bold uppercase tracking-wider text-ink cursor-pointer">
              Testing (h)
            </label>
            <input
              id="report-testing-hours"
              type="number"
              min={0}
              step={0.5}
              value={testingHours}
              onChange={(e) => setTestingHours(Number(e.target.value))}
              disabled={status === 'APPROVED'}
              className="h-9 px-3 bg-[#f3f2f2] border border-ink/40 text-xs font-mono font-bold focus:border-ink cursor-text"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="report-meeting-hours" className="text-xs font-bold uppercase tracking-wider text-ink cursor-pointer">
              Meetings (h)
            </label>
            <input
              id="report-meeting-hours"
              type="number"
              min={0}
              step={0.5}
              value={meetingHours}
              onChange={(e) => setMeetingHours(Number(e.target.value))}
              disabled={status === 'APPROVED'}
              className="h-9 px-3 bg-[#f3f2f2] border border-ink/40 text-xs font-mono font-bold focus:border-ink cursor-text"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="report-doc-hours" className="text-xs font-bold uppercase tracking-wider text-ink cursor-pointer">
              Documentation (h)
            </label>
            <input
              id="report-doc-hours"
              type="number"
              min={0}
              step={0.5}
              value={docHours}
              onChange={(e) => setDocHours(Number(e.target.value))}
              disabled={status === 'APPROVED'}
              className="h-9 px-3 bg-[#f3f2f2] border border-ink/40 text-xs font-mono font-bold focus:border-ink cursor-text"
            />
          </div>
        </div>
      </div>

      {/* Section 7: Optional Notes */}
      <div className="flex flex-col gap-2">
        <label htmlFor="report-notes" className="text-sm font-black uppercase tracking-wider text-ink cursor-pointer">
          6. Optional Notes or Additional Links
        </label>
        <textarea
          id="report-notes"
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={status === 'APPROVED'}
          placeholder="Any additional context for your engineering manager..."
          className="w-full p-3 bg-white border border-ink/40 text-xs font-medium focus:border-ink cursor-text"
        />
      </div>

      {/* Bottom Save / Submit Bar */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t-2 border-ink/40">
        <button
          onClick={handleSaveDraft}
          disabled={isLoading || status === 'SUBMITTED' || status === 'APPROVED'}
          className="h-10 px-5 bg-white border border-ink/40 text-xs font-bold text-ink hover:bg-[#eae9e9] disabled:opacity-50"
        >
          Save as Draft
        </button>
        <button
          onClick={handleOpenSubmitConfirm}
          disabled={isLoading || status === 'SUBMITTED' || status === 'APPROVED'}
          className="h-10 px-6 bg-accent text-white text-xs font-black hover:bg-accent-hover disabled:opacity-50 transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
        >
          <Send size={14} />
          <span>{status === 'NEEDS_CORRECTION' ? 'Resubmit for Review' : 'Submit Report'}</span>
        </button>
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[#f3f2f2] border-2 border-ink max-w-md w-full p-6 flex flex-col gap-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-ink/30 pb-3">
              <h3 className="text-sm font-black uppercase tracking-wider text-ink flex items-center gap-2">
                <Send size={16} className="text-accent" />
                <span>Confirm Report Submission</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowSubmitConfirmModal(false)}
                className="p-1 text-slateText-secondary hover:text-ink cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-3 bg-amber-50 border-2 border-amber-400 text-amber-900 text-xs flex items-start gap-2">
              <AlertTriangle size={18} className="text-amber-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Are you sure you want to submit this weekly report?</p>
                <p className="mt-1 text-amber-800">
                  Once submitted, your engineering manager will be notified for review, and this report will be locked against direct edits.
                </p>
              </div>
            </div>

            {/* Quick Summary Box */}
            <div className="bg-white border border-ink/30 p-3 text-xs flex flex-col gap-2 font-mono">
              <div className="flex justify-between border-b border-ink/10 pb-1">
                <span className="text-slateText-muted">Category:</span>
                <span className="font-bold text-ink">{projects.find((p) => p.id === projectId)?.name || 'Selected Project'}</span>
              </div>
              <div className="flex justify-between border-b border-ink/10 pb-1">
                <span className="text-slateText-muted">Cycle:</span>
                <span className="font-bold text-ink">{weekStartDate} &rarr; {weekEndDate}</span>
              </div>
              <div className="flex justify-between border-b border-ink/10 pb-1">
                <span className="text-slateText-muted">Tasks Completed:</span>
                <span className="font-bold text-ink">{tasks.filter((t) => t.taskName.trim().length > 0).length} tasks</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slateText-muted">Total Hours Logged:</span>
                <span className="font-bold text-accent">{totalLoggedHours}h</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-ink/20">
              <button
                type="button"
                onClick={() => setShowSubmitConfirmModal(false)}
                className="px-4 py-2 bg-white border border-ink/40 text-xs font-bold text-ink hover:bg-[#eae9e9] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeSubmitReport}
                disabled={isLoading}
                className="px-5 py-2 bg-accent text-white text-xs font-black uppercase tracking-wider hover:bg-accent-hover transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Send size={13} />
                <span>{isLoading ? 'Submitting…' : 'Yes, Submit Report'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function WeeklyReportFormPage() {
  return (
    <Suspense fallback={<div className="p-8 text-xs font-mono text-slateText-muted">Loading report form...</div>}>
      <WeeklyReportFormContent />
    </Suspense>
  );
}
