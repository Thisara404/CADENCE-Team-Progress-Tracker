'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ApiClient } from '../../lib/api';
import { Sparkles, X, Send, Maximize2, Minimize2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  meta?: string;
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
      {/* 8 rounded radiating petals forming the Claude starburst */}
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
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'ai',
      text: 'I can read every report in this workspace. Ask about open blockers, who is behind on submission, or a project-level summary.',
      meta: 'CADENCE AI ASSISTANT',
    },
  ]);

  const suggestionChips = [
    'What is blocking the team?',
    'Summarise W37',
    'Who is late?',
    'Where is time going?',
  ];

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
      meta: 'YOU',
    };

    setMessages((prev) => [...prev, userMsg]);
    setQuery('');
    setIsLoading(true);

    try {
      const res = await ApiClient.chatAi(prompt);
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: res.answer,
        meta: res.modelUsed || 'CADENCE AI ASSISTANT',
      };
      setMessages((prev) => [...prev, aiMsg]);
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
              : 'w-[calc(100vw-24px)] sm:w-[376px] max-w-[calc(100vw-24px)] sm:max-w-[calc(100vw-40px)] h-[500px] sm:h-[520px] max-h-[calc(100vh-100px)]'
          }`}
          style={{ animation: 'slideIn 0.2s ease' }}
        >
          {/* Header */}
          <div className="flex items-center gap-2.5 px-3.5 py-3 bg-[#201e1d] text-[#f3f2f2] select-none">
            {/* Sparkle Red Box */}
            <div className="w-6 h-6 bg-[#ec3013] flex items-center justify-center shrink-0">
              <Sparkles size={14} className="text-white fill-white" />
            </div>

            {/* Title & Grounding Subtitle */}
            <div className="flex flex-col min-w-0">
              <span className="text-[12.5px] font-extrabold tracking-[0.08em] uppercase leading-tight truncate">
                Cadence Assistant
              </span>
              <span className="text-[11px] text-[#bab6b6] leading-tight">
                Grounded in this week's reports
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
                  {/* Claude Breathing Starburst */}
                  <div className="text-[#ec3013] shrink-0 animate-[claude-breathe_2.6s_ease-in-out_infinite]">
                    <ClaudeBurstIcon className="w-5 h-5 text-[#ec3013]" />
                  </div>

                  <p className="text-[12.5px] leading-snug text-[#201e1d] font-medium">
                    Cadence is responding in the background. Once it's complete, you'll see it here.
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

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2 p-[11px_12px] border-t-2 border-[#201e1d]/30 bg-[#f3f2f2]"
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask about blockers, velocity, compliance…"
              disabled={isLoading}
              className="flex-1 min-w-0 h-[34px] px-2.5 bg-[#f8f4f4] border border-[#201e1d]/40 text-[12.5px] text-[#201e1d] placeholder:text-[#7d7979] focus:outline-none focus:border-[#201e1d]"
            />
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="w-[34px] h-[34px] bg-[#ec3013] text-[#f3f2f2] flex items-center justify-center shrink-0 hover:bg-[#d4270e] transition-colors disabled:opacity-50 cursor-pointer"
              title="Send message"
              aria-label="Send"
            >
              <Send size={15} />
            </button>
          </form>
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
