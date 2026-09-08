'use client';

import React, { useState } from 'react';
import { ApiClient } from '../../lib/api';
import { Sparkles, X, Send, Bot, User, RefreshCw } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  modelUsed?: string;
  timestamp: string;
}

export function AiChatDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'ai',
      text: "👋 Hello! I am the Cadence Executive AI Assistant. Ask me about weekly blockers, team compliance rates, project workload distribution, or individual member deliverables.",
      modelUsed: 'Cadence Engine (Gemini 1.5 Protocol)',
      timestamp: 'Now',
    },
  ]);

  const quickPrompts = [
    'Summarize recurring blockers across projects',
    'Give me the weekly team summary',
    'Check submission compliance rate',
    'How did Alex Chen perform this week?',
  ];

  const handleSend = async (textToSend?: string) => {
    const prompt = (textToSend || query).trim();
    if (!prompt || isLoading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
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
        modelUsed: res.modelUsed,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: `Error connecting to AI service: ${err.message || 'Check server status'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 bg-ink text-[#f3f2f2] px-4 py-3 border-2 border-accent shadow-xl hover:bg-black transition-all group"
          title="Open AI Engineering Assistant"
        >
          <Sparkles size={18} className="text-accent animate-pulse" />
          <span className="text-xs font-black tracking-wider uppercase">
            AI Assistant
          </span>
        </button>
      )}

      {/* Slide-out Drawer */}
      {isOpen && (
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[460px] bg-[#f3f2f2] border-l-2 border-ink shadow-2xl flex flex-col animate-slide-in-right">
          {/* Drawer Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-ink text-[#f3f2f2] border-b border-ink">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 bg-accent text-white font-black text-[10px] grid place-items-center">
                AI
              </span>
              <div className="flex flex-col">
                <span className="font-extrabold text-xs tracking-wider uppercase">
                  Cadence Assistant
                </span>
                <span className="text-[10px] text-gray-400">
                  Powered by Google GenAI (Gemini 1.5)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  setMessages([
                    {
                      id: '1',
                      sender: 'ai',
                      text: 'Conversation reset. How can I assist you with this week’s engineering reports?',
                      timestamp: 'Now',
                    },
                  ])
                }
                className="p-1 hover:text-accent transition-colors"
                title="Reset conversation"
              >
                <RefreshCw size={14} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:text-accent transition-colors"
                title="Close drawer"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Quick Action Chips */}
          <div className="p-3 bg-[#eae9e9] border-b border-ink/20 flex flex-wrap gap-1.5">
            <span className="w-full text-[10px] font-bold uppercase tracking-wider text-slateText-subtle">
              Suggested queries:
            </span>
            {quickPrompts.map((p) => (
              <button
                key={p}
                onClick={() => handleSend(p)}
                disabled={isLoading}
                className="text-[11px] bg-white text-ink border border-ink/30 px-2 py-1 hover:border-accent hover:text-accent transition-all text-left truncate max-w-full"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col gap-1 max-w-[90%] ${
                  m.sender === 'user' ? 'self-end items-end' : 'self-start items-start'
                }`}
              >
                <div className="flex items-center gap-1.5 text-[10px] text-slateText-muted uppercase font-mono">
                  {m.sender === 'user' ? (
                    <>
                      <span>Manager</span>
                      <User size={10} />
                    </>
                  ) : (
                    <>
                      <Bot size={10} className="text-accent" />
                      <span>{m.modelUsed || 'Cadence AI'}</span>
                    </>
                  )}
                  <span>·</span>
                  <span>{m.timestamp}</span>
                </div>

                <div
                  className={`p-3 text-[13px] leading-relaxed border whitespace-pre-wrap ${
                    m.sender === 'user'
                      ? 'bg-ink text-[#f3f2f2] border-ink'
                      : 'bg-white text-ink border-ink/30 shadow-sm'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="self-start flex items-center gap-2 p-3 bg-white border border-ink/30 text-xs text-slateText-secondary font-mono">
                <Sparkles size={14} className="text-accent animate-spin" />
                <span>Analyzing reports and generating answer...</span>
              </div>
            )}
          </div>

          {/* Chat Input Bar */}
          <div className="p-3 bg-[#eae9e9] border-t-2 border-ink/40">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask about blockers, compliance, or team hours..."
                disabled={isLoading}
                className="flex-1 h-9 px-3 bg-white border border-ink/40 text-xs focus:border-accent text-ink"
              />
              <button
                type="submit"
                disabled={isLoading || !query.trim()}
                className="h-9 px-4 bg-accent text-white font-bold text-xs flex items-center gap-1.5 hover:bg-accent-hover disabled:opacity-50 transition-colors"
              >
                <Send size={13} />
                <span>Ask</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
