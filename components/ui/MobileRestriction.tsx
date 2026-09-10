'use client';

import React, { useState, useEffect } from 'react';
import { Monitor, Smartphone, AlertTriangle, Laptop, ShieldAlert, ArrowUpRight } from 'lucide-react';

export function MobileRestriction() {
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  return (
    <aside
      role="alert"
      aria-label="Mobile View Disabled"
      className="lg:hidden fixed inset-0 z-[999999] bg-[#f3f2f2] flex flex-col justify-between p-6 sm:p-8 overflow-y-auto font-sans text-ink"
    >
      {/* Top Header Bar */}
      <div className="flex items-center justify-between border-b-2 border-ink pb-4">
        <div className="flex items-center gap-2.5">
          <span className="w-7 h-7 bg-accent text-white font-black text-xs grid place-items-center tracking-tighter">
            C
          </span>
          <div className="flex flex-col leading-none">
            <span className="font-black text-sm tracking-widest uppercase text-ink">
              CADENCE
            </span>
            <span className="text-[10px] font-mono text-slateText-muted uppercase tracking-wider">
              Enterprise Workstation
            </span>
          </div>
        </div>

        <span className="px-2.5 py-1 bg-accent/10 border-2 border-accent text-accent font-mono text-[10.5px] font-black uppercase tracking-wider flex items-center gap-1.5">
          <ShieldAlert size={12} />
          <span>Mobile View Disabled</span>
        </span>
      </div>

      {/* Main Advisory Box */}
      <div className="my-auto py-6 flex flex-col items-center text-center max-w-md mx-auto w-full">
        {/* Visual Device Indicator */}
        <div className="relative mb-6">
          <div className="w-20 h-20 bg-white border-2 border-ink shadow-[4px_4px_0px_0px_rgba(32,30,29,1)] grid place-items-center">
            <Laptop size={38} className="text-ink" />
          </div>
          <div className="absolute -bottom-2 -right-2 w-9 h-9 bg-accent border-2 border-ink text-white grid place-items-center shadow-[2px_2px_0px_0px_rgba(32,30,29,1)]">
            <Smartphone size={18} className="rotate-12" />
          </div>
        </div>

        {/* Badge & Title */}
        <span className="px-2 py-0.5 bg-ink text-white font-mono text-[10px] font-extrabold uppercase tracking-widest mb-2">
          Notice · Desktop Experience Required
        </span>

        <h1 className="text-2xl font-black uppercase tracking-tight text-ink mb-3 leading-tight">
          Please Switch to a Desktop Display
        </h1>

        <p className="text-xs text-slateText-secondary leading-relaxed mb-6 font-normal">
          Cadence is engineered for high-density engineering management. Complex multi-track workload grids, sprint velocity curves, side-by-side blocker triage, and report diff snapshots are disabled on mobile viewports.
        </p>

        {/* Specifications Matrix Card */}
        <div className="w-full bg-white border-2 border-ink shadow-[4px_4px_0px_0px_rgba(32,30,29,1)] p-4 text-left font-mono text-xs flex flex-col gap-2.5 mb-6">
          <div className="flex items-center justify-between pb-2 border-b border-ink/20">
            <span className="text-[11px] font-bold uppercase text-slateText-muted">Required Viewport</span>
            <span className="font-extrabold text-ink bg-[#eae9e9] px-2 py-0.5 border border-ink/30">
              ≥ 1024px width
            </span>
          </div>

          <div className="flex items-center justify-between pb-2 border-b border-ink/20">
            <span className="text-[11px] font-bold uppercase text-slateText-muted">Detected Viewport</span>
            <span className="font-extrabold text-accent bg-accent/10 px-2 py-0.5 border border-accent">
              {dimensions ? `${dimensions.width}px × ${dimensions.height}px` : 'Mobile screen'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase text-slateText-muted">Supported Platforms</span>
            <span className="font-extrabold text-green-700">Laptop · Desktop · Ultrawide</span>
          </div>
        </div>

        {/* Call to action guidance */}
        <div className="p-3 bg-[#eae9e9] border border-ink/40 w-full text-left flex items-start gap-2.5 text-[11px] text-slateText-secondary">
          <AlertTriangle size={15} className="text-accent shrink-0 mt-0.5" />
          <span>
            If you are currently on a laptop or desktop monitor, please <b>maximize your browser window</b> to resume your session.
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t-2 border-ink pt-3 flex items-center justify-between text-[10px] font-mono text-slateText-muted">
        <span>Cadence Engineering OS v1.0.0</span>
        <span>By Thisara Dasun</span>
      </div>
    </aside>
  );
}
