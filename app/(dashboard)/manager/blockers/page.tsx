'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ApiClient } from '@/lib/api';
import {
  AlertTriangle,
  Trophy,
  Filter,
  ArrowLeft,
  Calendar,
  Layers,
} from 'lucide-react';

export default function SideBySideBlockersPage() {
  const [selectedWeek, setSelectedWeek] = useState('ALL');
  const [activeTab, setActiveTab] = useState<'blockers' | 'achievements' | 'both'>('both');
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const data = await ApiClient.getBlockersAndAchievements(
        selectedWeek !== 'ALL' ? selectedWeek : undefined,
      );
      setItems(data || []);
    } catch {
      // Fallback data
      setItems([
        {
          reportId: 'rep-w37-alex',
          user: { fullName: 'Alex Chen', avatarColor: '#2563eb' },
          project: { name: 'Mobile App Redesign', code: 'MAR-01' },
          status: 'DRAFT',
          blockers: [
            'Waiting on backend GraphQL schema update for offline report queueing',
          ],
          keyBlockerIndex: 0,
          achievements: [
            'Refactored theme tokens to support automated dark mode',
          ],
          keyAchievementIndex: 0,
        },
        {
          reportId: 'rep-w37-marcus',
          user: { fullName: 'Marcus Vance', avatarColor: '#7c3aed' },
          project: { name: 'Internal Tooling', code: 'INT-03' },
          status: 'SUBMITTED',
          blockers: [
            'Shared redis instance memory saturation during high concurrency test runs',
            'Flaky mock SMTP server in local test harness',
          ],
          keyBlockerIndex: 0,
          achievements: [
            'Implemented rate limiter middleware with zero latency penalty',
          ],
          keyAchievementIndex: 0,
        },
        {
          reportId: 'rep-w36-dana',
          user: { fullName: 'Dana Lee', avatarColor: '#059669' },
          project: { name: 'Cloud Migration', code: 'CLM-02' },
          status: 'NEEDS_CORRECTION',
          blockers: [
            'Staging AWS quota limit reached for c6g.large instances',
            'IAM role propagation delay during automated terraform run',
          ],
          keyBlockerIndex: 0,
          achievements: [
            'Completed Dockerfile optimization, reducing image size by 62%',
          ],
          keyAchievementIndex: 0,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [selectedWeek]);

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-ink/40 pb-4">
        <div>
          <span className="text-xs font-bold tracking-widest uppercase text-slateText-muted font-mono">
            Bonus Section · Cross-Team Aggregation
          </span>
          <h1 className="text-2xl font-black text-ink tracking-tight mt-1">
            Side-by-Side Blockers & Achievements
          </h1>
          <p className="text-xs text-slateText-secondary">
            Inspect all team challenges and key wins side by side for rapid triage without opening reports individually.
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1 border border-ink/40 bg-white p-1">
          <button
            onClick={() => setActiveTab('both')}
            className={`px-3 py-1 text-xs font-bold transition-colors ${
              activeTab === 'both' ? 'bg-ink text-white' : 'text-slateText-secondary hover:text-ink'
            }`}
          >
            All Sections
          </button>
          <button
            onClick={() => setActiveTab('blockers')}
            className={`px-3 py-1 text-xs font-bold transition-colors ${
              activeTab === 'blockers' ? 'bg-ink text-white' : 'text-slateText-secondary hover:text-ink'
            }`}
          >
            Blockers Only
          </button>
          <button
            onClick={() => setActiveTab('achievements')}
            className={`px-3 py-1 text-xs font-bold transition-colors ${
              activeTab === 'achievements' ? 'bg-ink text-white' : 'text-slateText-secondary hover:text-ink'
            }`}
          >
            Highlights Only
          </button>
        </div>
      </div>

      {/* Week Selector Bar */}
      <div className="flex items-center gap-3 p-3 bg-[#eae9e9] border border-ink/40 text-xs">
        <span className="font-bold uppercase tracking-wider text-slateText-muted flex items-center gap-1.5">
          <Calendar size={13} />
          <span>Select Sprint Period:</span>
        </span>
        <select
          value={selectedWeek}
          onChange={(e) => setSelectedWeek(e.target.value)}
          className="h-8 px-3 bg-white border border-ink/40 text-xs font-bold focus:border-accent"
        >
          <option value="ALL">All Active Sprints</option>
          <option value="2026-09-08">Week 37 (Current)</option>
          <option value="2026-09-01">Week 36</option>
          <option value="2026-08-25">Week 35</option>
        </select>
      </div>

      {/* Side-by-Side Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="bg-white border-2 border-ink/40 flex flex-col justify-between shadow-sm"
          >
            {/* Card Header */}
            <div className="p-4 border-b border-ink/20 flex items-center justify-between bg-[#f8f7f7]">
              <div className="flex items-center gap-2">
                <span
                  className="w-6 h-6 text-white text-[10px] font-black grid place-items-center"
                  style={{ backgroundColor: item.user?.avatarColor || '#2563eb' }}
                >
                  {item.user?.fullName?.[0] || 'U'}
                </span>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-ink">{item.user?.fullName}</span>
                  <span className="text-[10.5px] text-slateText-muted font-mono">{item.project?.name}</span>
                </div>
              </div>

              <span
                className={`px-2 py-0.5 text-[9.5px] font-black uppercase border ${
                  item.status === 'APPROVED'
                    ? 'bg-[#dcfce7] text-[#166534] border-[#166534]'
                    : item.status === 'SUBMITTED'
                    ? 'bg-[#dbeafe] text-[#1e40af] border-[#1e40af]'
                    : 'bg-accent-tint text-accent-hover border-accent'
                }`}
              >
                {item.status.replace('_', ' ')}
              </span>
            </div>

            {/* Content Sections */}
            <div className="p-4 flex flex-col gap-4 flex-1">
              {/* Blockers */}
              {(activeTab === 'both' || activeTab === 'blockers') && (
                <div className="flex flex-col gap-2">
                  <span className="text-[10.5px] font-black uppercase tracking-wider text-accent flex items-center gap-1">
                    <AlertTriangle size={13} />
                    <span>Blockers / Challenges</span>
                  </span>

                  {item.blockers?.length === 0 ? (
                    <span className="text-xs text-slateText-muted italic">No blockers logged.</span>
                  ) : (
                    <div className="flex flex-col gap-1.5">
                      {item.blockers.map((b: string, i: number) => {
                        const isKey = item.keyBlockerIndex === i;
                        return (
                          <div
                            key={i}
                            className={`p-2 text-xs border leading-relaxed ${
                              isKey
                                ? 'bg-accent-tint border-accent text-accent-hover font-bold'
                                : 'bg-[#f8f7f7] border-ink/20 text-ink'
                            }`}
                          >
                            {isKey && (
                              <span className="text-[9px] font-black uppercase bg-accent text-white px-1.5 py-0.5 mr-1.5">
                                Key Issue
                              </span>
                            )}
                            <span>{b}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Achievements */}
              {(activeTab === 'both' || activeTab === 'achievements') && (
                <div className="flex flex-col gap-2">
                  <span className="text-[10.5px] font-black uppercase tracking-wider text-[#d97706] flex items-center gap-1">
                    <Trophy size={13} />
                    <span>Achievements & Highlights</span>
                  </span>

                  {item.achievements?.length === 0 ? (
                    <span className="text-xs text-slateText-muted italic">No highlights entered.</span>
                  ) : (
                    <div className="flex flex-col gap-1.5">
                      {item.achievements.map((a: string, i: number) => {
                        const isKey = item.keyAchievementIndex === i;
                        return (
                          <div
                            key={i}
                            className={`p-2 text-xs border leading-relaxed ${
                              isKey
                                ? 'bg-[#fef3c7] border-[#d97706] text-[#92400e] font-bold'
                                : 'bg-[#f8f7f7] border-ink/20 text-ink'
                            }`}
                          >
                            {isKey && (
                              <span className="text-[9px] font-black uppercase bg-[#d97706] text-white px-1.5 py-0.5 mr-1.5">
                                Key
                              </span>
                            )}
                            <span>{a}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 bg-[#f8f7f7] border-t border-ink/20 flex justify-end">
              <Link
                href={`/reports/${item.reportId}`}
                className="text-xs font-bold text-ink hover:text-accent underline"
              >
                Inspect Full Report
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
