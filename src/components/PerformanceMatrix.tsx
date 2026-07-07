/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Activity, ShieldCheck } from 'lucide-react';

export function PerformanceMatrix() {
  return (
    <section className="bg-[#141414] border border-[#333] rounded-lg p-5 shadow-xl space-y-4 glowing-panel" id="performance-matrix">
      <div className="flex items-center gap-2 border-b border-[#333] pb-3">
        <Activity className="w-4 h-4 text-orange-500" />
        <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-gray-300">Command Performance Matrix</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-1 gap-4">
        
        {/* Stat 1: Total Occupancy */}
        <div className="bg-black/40 border border-white/5 rounded p-3.5 flex flex-col justify-between" id="stat-occupancy">
          <div className="text-gray-500 font-mono text-[9px] uppercase tracking-wider mb-2">Total Stadium Occupancy</div>
          <div className="flex items-baseline gap-2">
            <div className="text-4xl font-light text-white tracking-tight">82,419</div>
            <span className="text-[10px] text-emerald-400 font-mono">LIVE INFLOW</span>
          </div>
          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden my-2.5">
            <div className="w-[82%] h-full bg-orange-600 rounded-full animate-pulse"></div>
          </div>
          <div className="flex justify-between text-[9px] font-mono text-gray-500 uppercase">
            <span>93% Capacity Limit</span>
            <span>+1.2% / min rate</span>
          </div>
        </div>

        {/* Stat 2: GenAI Guardrails */}
        <div className="bg-black/40 border border-white/5 rounded p-3.5" id="stat-guardrails">
          <div className="text-gray-500 font-mono text-[9px] uppercase tracking-wider mb-3 pb-1 border-b border-white/5">GenAI Guardrails Performance</div>
          <div className="space-y-2 font-mono text-[10px]">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Hallucination Boundary</span>
              <span className="text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-900/30 font-bold">PASSED (0.002%)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">PII Redaction Rate</span>
              <span className="text-blue-400 bg-blue-950/40 px-1.5 py-0.5 rounded border border-blue-900/30 font-bold">100% SECURE</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Context Safety</span>
              <span className="text-white">0.998 // OPTIMAL</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Latency (Orchestrator)</span>
              <span className="text-white font-bold">42ms</span>
            </div>
          </div>
        </div>

        {/* Stat 3: Fan Experience Health */}
        <div className="bg-black/40 border border-white/5 rounded p-3.5" id="stat-experience">
          <div className="text-gray-500 font-mono text-[9px] uppercase tracking-wider mb-3 pb-1 border-b border-white/5">Fan Experience Health</div>
          <div className="grid grid-cols-2 gap-3 mb-2.5">
            <div className="h-12 bg-white/5 rounded flex flex-col items-center justify-center border border-white/5">
              <span className="text-lg font-bold text-white tracking-tight">4.8</span>
              <span className="text-[7px] text-gray-500 uppercase font-mono">Avg CSAT Rating</span>
            </div>
            <div className="h-12 bg-white/5 rounded flex flex-col items-center justify-center border border-white/5">
              <span className="text-lg font-bold text-emerald-400 tracking-tight">122</span>
              <span className="text-[7px] text-gray-500 uppercase font-mono font-bold">Assist Requests</span>
            </div>
          </div>
          <div className="text-[9px] text-gray-500 font-mono italic text-center uppercase">
            "Accessible route chosen by 14% of users."
          </div>
        </div>

      </div>
    </section>
  );
}
