'use client';

import React, { useState, useRef, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { ApiClient } from '../../lib/api';
import { Sparkles, X, Send, Maximize2, Minimize2, Shield, Compass, CheckCircle2, ArrowUp } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  meta?: string;
  toolCall?: {
    tool: string;
    data: any;
  };
}

// Authentic Claude AI-style Starburst / Asterisk Icon
function ClaudeBurstIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="12" cy="12" r="2.2" />
      <rect x="10.8" y="2.2" width="2.4" height="6.2" rx="1.2" />
      <rect x="10.8" y="15.6" width="2.4" height="6.2" rx="1.2" />
      <rect x="2.2" y="10.8" width="6.2" height="2.4" rx="1.2" />
      <rect x="15.6" y="10.8" width="6.2" height="2.4" rx="1.2" />
      <rect x="4.8" y="4.8" width="2.4" height="6.2" rx="1.2" transform="rotate(-45 6 7.9)" />
      <rect x="14.4" y="14.4" width="2.4" height="6.2" rx="1.2" transform="rotate(-45 15.6 17.5)" />
      <rect x="14.4" y="4.8" width="2.4" height="6.2" rx="1.2" transform="rotate(45 15.6 7.9)" />
      <rect x="4.8" y="14.4" width="2.4" height="6.2" rx="1.2" transform="rotate(45 6 17.5)" />
    </svg>
  );
}

export function AiChatDrawer() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, role, isManager } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isInputExpanded, setIsInputExpanded] = useState(false);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize / expand text bar like Gemini
  useEffect(() => {
    if (!textareaRef.current) return;
    if (isInputExpanded) {
      textareaRef.current.style.height = isExpanded ? '220px' : '150px';
    } else {
      textareaRef.current.style.height = 'auto';
      const scrollH = textareaRef.current.scrollHeight;
      const targetH = Math.min(Math.max(scrollH, 24), 160);
      textareaRef.current.style.height = `${targetH}px`;
    }
  }, [query, isInputExpanded, isExpanded]);

  // Friendly tab naming
  const getTabInfo = (path: string, manager: boolean) => {
    if (path === '/dashboard') return { id: 'dashboard', name: 'Dashboard' };
    if (path === '/reports/new') return { id: 'weekly-report-new', name: 'Weekly Report Form' };
    if (path.startsWith('/reports/history')) return { id: 'reports-history', name: manager ? 'Team Reports' : 'My History' };
    if (path.startsWith('/reports/')) return { id: 'reports-detail', name: 'Report Details' };
    if (path.startsWith('/manager/blockers')) return { id: 'weekly-blockers', name: 'Weekly Blockers' };
    if (path.startsWith('/projects')) return { id: 'projects', name: 'Projects' };
    if (path.startsWith('/admin/users')) return { id: 'admin-users', name: 'Users & Roles' };
    if (path.startsWith('/settings')) return { id: 'settings', name: 'Profile & Settings' };
    return { id: 'workspace', name: 'Workspace Overview' };
  };

  const currentTabInfo = getTabInfo(pathname || '', isManager);
  const firstName = user?.fullName ? user.fullName.split(' ')[0] : 'there';
  const displayRole = role === 'ADMIN' ? 'ADMIN' : role === 'MANAGER' ? 'MANAGER' : 'MEMBER';

  // Initial welcome message tailored to role and current tab
  const getInitialMessage = (): ChatMessage => {
    if (role === 'TEAM_MEMBER') {
      return {
        id: 'init-member',
        sender: 'ai',
        text: `Hello **${firstName}**! I'm your **Cadence Engineering Copilot**.\n\nYou are currently on the **${currentTabInfo.name}** tab.\n\nI can help you:\n- Draft technical tasks and calculate spent hours\n- Articulate and format blockers clearly\n- Check your latest submission status\n- Auto-fill report fields using internal tools\n- Explain how to use this tab or any other tab in this workspace!`,
        meta: `CADENCE COPILOT · ${displayRole} VIEW`,
      };
    } else {
      return {
        id: 'init-manager',
        sender: 'ai',
        text: `Hello **${firstName}**! I'm your **Cadence Management Copilot**.\n\nYou are currently on the **${currentTabInfo.name}** tab.\n\nAsk about open blockers, submission compliance rates, sprint velocity, team member status, auto-generating sample reports, or full details on any workspace tab.`,
        meta: `CADENCE COPILOT · ${displayRole} VIEW`,
      };
    }
  };

  const [messages, setMessages] = useState<ChatMessage[]>([getInitialMessage()]);

  // Update initial message when user or tab changes if only 1 message exists
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length <= 1) {
        return [getInitialMessage()];
      }
      return prev;
    });
  }, [pathname, user?.id, role]);

  // Contextual suggestion chips based on active tab and role
  const getSuggestionChips = () => {
    if (role === 'TEAM_MEMBER') {
      if (pathname === '/reports/new') {
        return [
          '⚡ Auto-fill 5 tasks, blockers & highlights',
          'Help me draft my tasks',
          'How do I format blockers?',
          'Explain this tab',
        ];
      }
      if (pathname.startsWith('/reports/history')) {
        return [
          '⚡ Auto-fill 5 tasks, blockers & highlights',
          'Explain my report statuses',
          'What does Needs Correction mean?',
          'Show all tabs',
        ];
      }
      if (pathname.startsWith('/projects')) {
        return [
          '⚡ Auto-fill 5 tasks, blockers & highlights',
          'Which project codes exist?',
          'Explain this tab',
          'Show all tabs',
        ];
      }
      if (pathname.startsWith('/settings')) {
        return [
          'What can I customize here?',
          'Explain this tab',
          'Show all tabs',
        ];
      }
      return [
        '⚡ Auto-fill 5 tasks, blockers & highlights',
        'Help draft weekly report',
        'Format my blockers',
        'Explain this tab',
      ];
    } else {
      // Manager / Admin chips
      if (pathname === '/dashboard') {
        return [
          'Review pending submissions',
          'What is blocking the team?',
          'Summarise W37',
          'Who is late on submission?',
        ];
      }
      if (pathname.startsWith('/manager/blockers')) {
        return [
          'Analyze key blockers',
          'Show team achievements',
          'Explain this tab',
          'Identify systemic bottlenecks',
        ];
      }
      if (pathname.startsWith('/admin/users')) {
        return [
          'User role guidelines',
          'How to reset passwords?',
          'Explain this tab',
          'Show all tabs',
        ];
      }
      if (pathname.startsWith('/projects')) {
        return [
          'Active projects summary',
          'Creating a new project',
          'Explain this tab',
        ];
      }
      return [
        'Review pending submissions',
        'What is blocking the team?',
        'Summarise W37',
        'Who is late?',
      ];
    }
  };

  const suggestionChips = getSuggestionChips();

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const prompt = (textToSend || query).trim();
    if (!prompt || isLoading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: prompt,
      meta: user?.fullName ? user.fullName.toUpperCase() : 'YOU',
    };

    setMessages((prev) => [...prev, userMsg]);
    setQuery('');
    setIsInputExpanded(false);
    if (textareaRef.current) {
      textareaRef.current.style.height = '36px';
    }
    setIsLoading(true);

    try {
      const res = await ApiClient.chatAi(prompt, currentTabInfo.name, pathname);
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: res.answer,
        meta: res.modelUsed || 'CADENCE AI ASSISTANT',
        toolCall: res.toolCall,
      };
      setMessages((prev) => [...prev, aiMsg]);

      // If toolCall returned, trigger auto-fill (strictly for TEAM_MEMBER)
      if (res.toolCall && res.toolCall.tool === 'fill_report_form' && role === 'TEAM_MEMBER') {
        window.dispatchEvent(
          new CustomEvent('cadence:ai-autofill', { detail: res.toolCall.data })
        );
        try {
          sessionStorage.setItem(
            'cadence_pending_autofill',
            JSON.stringify(res.toolCall.data)
          );
        } catch (e) {
          console.error('Failed to store cadence_pending_autofill in sessionStorage:', e);
        }
      }
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: `Could not reach AI service: ${err.message || 'Please verify connection.'}`,
        meta: 'CADENCE AI ASSISTANT · ERROR',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed right-3 sm:right-5 bottom-3 sm:bottom-5 z-50 flex flex-col items-end gap-2.5">
      {/* Assistant Popup Window */}
      {isOpen && (
        <div
          className={`flex flex-col border-2 border-[#201e1d] bg-[#f3f2f2] shadow-[0_12px_32px_rgba(45,43,43,0.22)] overflow-hidden transition-all duration-200 ease-out ${
            isExpanded
              ? 'w-[calc(100vw-24px)] sm:w-[780px] max-w-[calc(100vw-24px)] sm:max-w-[calc(100vw-32px)] h-[80vh] sm:h-[82vh] max-h-[820px]'
              : 'w-[calc(100vw-24px)] sm:w-[396px] max-w-[calc(100vw-24px)] sm:max-w-[calc(100vw-40px)] h-[520px] sm:h-[540px] max-h-[calc(100vh-100px)]'
          }`}
          style={{ animation: 'slideIn 0.2s ease' }}
        >
          {/* Header */}
          <div className="flex flex-col bg-[#201e1d] text-[#f3f2f2] select-none border-b border-[#383534]">
            {/* Top Bar */}
            <div className="flex items-center gap-2.5 px-3.5 pt-3 pb-2">
              {/* Sparkle Red Box */}
              <div className="w-6 h-6 bg-[#ec3013] flex items-center justify-center shrink-0">
                <Sparkles size={14} className="text-white fill-white" />
              </div>

              {/* Title & Role Badge */}
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-[12.5px] font-extrabold tracking-[0.08em] uppercase leading-tight truncate">
                  Cadence Assistant
                </span>
                <span
                  className={`text-[9.5px] font-bold tracking-wider px-1.5 py-0.5 uppercase border ${
                    role === 'ADMIN'
                      ? 'bg-[#fee2e2] text-[#991b1b] border-[#f87171]'
                      : role === 'MANAGER'
                      ? 'bg-[#fef3c7] text-[#92400e] border-[#fcd34d]'
                      : 'bg-[#e0f2fe] text-[#075985] border-[#7dd3fc]'
                  }`}
                >
                  {displayRole}
                </span>
              </div>

              <div className="flex-1" />

              {/* Expand / Minimize Toggle */}
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-[26px] h-[26px] text-[#f3f2f2] hover:bg-[#444141] flex items-center justify-center transition-colors"
                title={isExpanded ? 'Collapse to compact view' : 'Full expand'}
                aria-label={isExpanded ? 'Collapse' : 'Full expand'}
              >
                {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              </button>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-[26px] h-[26px] text-[#f3f2f2] hover:bg-[#444141] flex items-center justify-center transition-colors"
                title="Close assistant"
                aria-label="Close assistant"
              >
                <X size={16} />
              </button>
            </div>

            {/* Context Sub-bar: Current Tab Indicator & Safety Badges */}
            <div className="flex items-center justify-between gap-2 px-3.5 pb-2.5 text-[11px] text-[#bab6b6]">
              <div className="flex items-center gap-1.5 min-w-0">
                <Compass size={12} className="text-[#ec3013] shrink-0" />
                <span className="truncate font-mono">
                  Tab: <strong className="text-white">{currentTabInfo.name}</strong>
                </span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-[#9b9797] shrink-0 font-mono">
                <Shield size={10} className="text-emerald-400" />
                <span>Read-Only</span>
              </div>
            </div>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-3.5 flex flex-col gap-3">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${
                  m.sender === 'user' ? 'items-end' : 'items-start'
                } gap-1`}
              >
                {m.sender === 'user' ? (
                  <div className="max-w-[92%] p-[9px_11px] text-[12.5px] leading-[1.6] whitespace-pre-wrap bg-[#201e1d] text-[#f3f2f2]">
                    {m.text}
                  </div>
                ) : (
                  <div className="max-w-[94%] p-[10px_13px] bg-[#f8f4f4] text-[#201e1d] border-l-2 border-[#ec3013] shadow-sm text-[12.5px]">
                    <ReactMarkdown
                      components={{
                        h1: ({ children }) => (
                          <h1 className="text-[14px] font-extrabold text-[#201e1d] mt-2 mb-1.5 border-b border-[#201e1d]/15 pb-1">
                            {children}
                          </h1>
                        ),
                        h2: ({ children }) => (
                          <h2 className="text-[13.5px] font-bold text-[#201e1d] mt-2 mb-1">
                            {children}
                          </h2>
                        ),
                        h3: ({ children }) => (
                          <h3 className="text-[13px] font-bold text-[#201e1d] mt-1.5 mb-1">
                            {children}
                          </h3>
                        ),
                        h4: ({ children }) => (
                          <h4 className="text-[12.5px] font-bold text-[#201e1d] mt-1 mb-0.5">
                            {children}
                          </h4>
                        ),
                        p: ({ children }) => (
                          <p className="my-1.5 first:mt-0 last:mb-0 leading-[1.6] text-[#201e1d]">
                            {children}
                          </p>
                        ),
                        ul: ({ children }) => (
                          <ul className="list-disc pl-4 my-1.5 space-y-1">
                            {children}
                          </ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="list-decimal pl-4 my-1.5 space-y-1">
                            {children}
                          </ol>
                        ),
                        li: ({ children }) => (
                          <li className="leading-[1.55] my-0.5 text-[#201e1d]">
                            {children}
                          </li>
                        ),
                        table: ({ children }) => (
                          <div className="overflow-x-auto my-2 border border-[#201e1d]/20 bg-white">
                            <table className="min-w-full text-[11.5px] divide-y divide-[#201e1d]/20">
                              {children}
                            </table>
                          </div>
                        ),
                        thead: ({ children }) => (
                          <thead className="bg-[#eae7e7] font-bold text-[#201e1d]">
                            {children}
                          </thead>
                        ),
                        th: ({ children }) => (
                          <th className="px-2 py-1 text-left border-r border-[#201e1d]/10 last:border-r-0">
                            {children}
                          </th>
                        ),
                        td: ({ children }) => (
                          <td className="px-2 py-1 border-r border-[#201e1d]/10 last:border-r-0 border-t border-[#201e1d]/10">
                            {children}
                          </td>
                        ),
                        strong: ({ children }) => (
                          <strong className="font-bold text-[#111010]">
                            {children}
                          </strong>
                        ),
                        code: ({ children }) => (
                          <code className="px-1 py-0.5 bg-[#eae7e7] text-[#201e1d] font-mono text-[11px] border border-[#201e1d]/15">
                            {children}
                          </code>
                        ),
                        pre: ({ children }) => (
                          <pre className="p-2 bg-[#201e1d] text-[#f3f2f2] font-mono text-[11px] overflow-x-auto my-1.5">
                            {children}
                          </pre>
                        ),
                        hr: () => (
                          <hr className="border-t border-[#201e1d]/15 my-2" />
                        ),
                      }}
                    >
                      {m.text}
                    </ReactMarkdown>
                  </div>
                )}

                {m.toolCall && (
                  <div className="mt-2 p-2.5 bg-[#201e1d] text-[#f3f2f2] border-2 border-accent flex flex-col gap-2 shadow-sm">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-black text-accent flex items-center gap-1.5">
                        <Sparkles size={13} />
                        <span>Tool Executed: {m.toolCall.tool}</span>
                      </span>
                      <span className="text-[10px] uppercase font-mono text-[#9b9797]">
                        {m.toolCall.data?.tasks?.length || 0} Tasks Generated{m.toolCall.data?.notes ? ' • Notes Included' : ''}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      {pathname === '/reports/new' ? (
                        <button
                          type="button"
                          onClick={() => {
                            window.dispatchEvent(
                              new CustomEvent('cadence:ai-autofill', {
                                detail: m.toolCall?.data,
                              })
                            );
                          }}
                          className="px-3 py-1.5 bg-[#166534] hover:bg-[#15803d] text-white text-[11px] font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                        >
                          <CheckCircle2 size={13} />
                          <span>Form Populated ✓ (Click to Re-apply)</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            try {
                              sessionStorage.setItem(
                                'cadence_pending_autofill',
                                JSON.stringify(m.toolCall?.data)
                              );
                            } catch (e) {}
                            router.push('/reports/new');
                          }}
                          className="px-3 py-1.5 bg-accent hover:bg-accent-hover text-white text-[11px] font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                        >
                          <span>Open Weekly Report Form & Apply →</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {m.meta && (
                  <span className="text-[10px] font-semibold tracking-[0.08em] uppercase text-[#9b9797]">
                    {m.meta}
                  </span>
                )}
              </div>
            ))}

            {/* Claude AI-Style Loading Animation */}
            {isLoading && (
              <div className="flex flex-col items-start gap-1">
                <div className="max-w-[94%] p-[10px_13px] bg-[#f8f4f4] border-l-2 border-[#ec3013] text-[#201e1d] shadow-sm flex items-center gap-3">
                  <div className="text-[#ec3013] shrink-0 animate-[claude-breathe_2.6s_ease-in-out_infinite]">
                    <ClaudeBurstIcon className="w-5 h-5 text-[#ec3013]" />
                  </div>

                  <p className="text-[12.5px] leading-snug text-[#201e1d] font-medium">
                    Cadence is analyzing your request against live workspace data…
                  </p>
                </div>

                <span className="text-[10px] font-semibold tracking-[0.08em] uppercase text-[#9b9797]">
                  CADENCE AI ASSISTANT
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Action Suggestion Chips */}
          <div className="flex flex-wrap gap-1.5 px-3.5 pb-2.5">
            {suggestionChips.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => handleSend(chip)}
                disabled={isLoading}
                className="h-7 px-2.5 border border-[#201e1d]/40 bg-white/70 text-[11px] font-medium text-[#444141] hover:bg-[#eae7e7] hover:text-[#201e1d] transition-colors disabled:opacity-50 whitespace-nowrap"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Gemini-Style Unified Input Capsule (Light Theme) */}
          <div className="p-3 bg-[#f3f2f2] border-t border-[#201e1d]/15">
            <div
              className={`relative flex flex-col bg-white text-[#201e1d] rounded-2xl p-3 sm:p-3.5 border border-[#201e1d]/30 shadow-xs transition-all duration-200 focus-within:border-[#201e1d] focus-within:shadow-md ${
                isInputExpanded ? 'min-h-[200px]' : ''
              }`}
            >
              {/* Top-Right Expand & Clear Controls */}
              <div className="absolute top-3 right-3 z-10 flex items-center gap-1">
                {query.trim().length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery('');
                      if (textareaRef.current) {
                        textareaRef.current.style.height = '24px';
                        textareaRef.current.focus();
                      }
                    }}
                    className="w-6 h-6 flex items-center justify-center text-[#7d7979] hover:text-[#201e1d] hover:bg-[#f3f2f2] rounded-md transition-colors cursor-pointer"
                    title="Clear text"
                  >
                    <X size={13} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsInputExpanded(!isInputExpanded)}
                  className="w-6 h-6 flex items-center justify-center text-[#7d7979] hover:text-[#201e1d] hover:bg-[#f3f2f2] rounded-md transition-colors cursor-pointer"
                  title={isInputExpanded ? 'Collapse text bar' : 'Expand text bar'}
                  aria-label={isInputExpanded ? 'Collapse text bar' : 'Expand text bar'}
                >
                  {isInputExpanded ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
                </button>
              </div>

              {/* Textarea: Full width, borderless, clean light background */}
              <textarea
                ref={textareaRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                rows={1}
                placeholder={
                  role === 'TEAM_MEMBER'
                    ? `Ask about ${currentTabInfo.name}, draft tasks, autofill…`
                    : `Ask about blockers, compliance, ${currentTabInfo.name}…`
                }
                disabled={isLoading}
                className={`w-full pr-14 bg-transparent border-0 outline-none ring-0 focus:outline-none focus:ring-0 text-[13px] leading-relaxed text-[#201e1d] placeholder:text-[#7d7979] resize-none overflow-y-auto font-sans scrollbar-thin transition-[height] duration-150 ${
                  isInputExpanded ? 'h-[160px]' : 'min-h-[24px] max-h-[160px]'
                }`}
              />

              {/* Bottom Toolbar inside the capsule */}
              <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-[#201e1d]/10">
                {/* Left side: Clean Keyboard shortcut hint */}
                <span className="text-[11px] text-[#7d7979] select-none font-medium truncate">
                  Shift+Enter for new line · Enter to send
                </span>

                {/* Right side: Character count & Circular ArrowUp Send Button */}
                <div className="flex items-center gap-2.5 shrink-0 ml-2">
                  {query.length > 0 && (
                    <span className="text-[10.5px] text-[#7d7979] font-mono select-none">
                      {query.length} chars{query.split('\n').length > 1 ? ` · ${query.split('\n').length}L` : ''}
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => handleSend()}
                    disabled={isLoading || !query.trim()}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                      query.trim() && !isLoading
                        ? 'bg-[#ec3013] text-white hover:bg-[#d4270e] shadow-sm hover:scale-105 active:scale-95'
                        : 'bg-[#e5e7eb] text-[#9ca3af] cursor-not-allowed opacity-60'
                    }`}
                    title="Send message (Enter)"
                    aria-label="Send"
                  >
                    <ArrowUp size={16} className="stroke-[2.5]" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 sm:gap-2.5 h-[40px] sm:h-[44px] px-3.5 sm:px-4 bg-[#201e1d] text-[#f3f2f2] text-xs sm:text-[13px] font-extrabold shadow-[0_3px_10px_rgba(45,43,43,0.16)] hover:bg-[#2e2a29] transition-colors cursor-pointer shrink-0"
      >
        <Sparkles size={16} className="text-[#ec3013]" />
        <span>{isOpen ? 'Close assistant' : 'Ask the assistant'}</span>
      </button>
    </div>
  );
}
