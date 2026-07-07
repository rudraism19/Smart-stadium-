/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Radio, ShieldCheck, AlertTriangle } from 'lucide-react';
import { CrowdMetric } from '../types';

interface MarqueeTickerProps {
  metrics: CrowdMetric[];
}

export function MarqueeTicker({ metrics }: MarqueeTickerProps) {
  const isAnyBlocked = metrics.some(m => !m.isOpen);

  return (
    <div className="bg-black/90 border-b border-[#222] h-9 flex items-center overflow-hidden font-mono text-[10px] select-none text-gray-400 relative shrink-0" id="marquee-container">
      <div className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-[#0A0A0A] via-[#0A0A0A]/95 to-transparent z-10 pointer-events-none flex items-center pl-6 pr-8">
        <span className="text-[9px] bg-orange-600 text-white font-bold px-1.5 py-0.5 rounded tracking-widest text-center flex items-center gap-1 shrink-0 shadow-lg shadow-orange-900/20" id="live-telemetry-pill">
          <Radio className="w-2.5 h-2.5 animate-pulse text-white" /> LIVE TELEMETRY
        </span>
      </div>
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#0A0A0A] to-transparent z-10 pointer-events-none"></div>
      
      <div className="w-full flex items-center overflow-hidden">
        <div className="animate-marquee flex items-center gap-12 pl-36" id="marquee-content-track">
          {/* Iteration 1 */}
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            SYSTEM CORE CHECK: <span className="text-white">ONLINE</span>
          </span>
          <span className="text-gray-600">//</span>
          {metrics.map(m => (
            <React.Fragment key={`tick1-${m.gateId}`}>
              <span className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${m.isOpen ? 'bg-emerald-500' : 'bg-orange-600 animate-ping'}`}></span>
                {m.gateName}: <span className={m.crowdDensityPct > 80 ? 'text-orange-400 font-bold' : 'text-white'}>{m.crowdDensityPct}% LOAD</span>
                <span className="text-gray-500">({m.estimatedWaitMinutes}m wait)</span>
              </span>
              <span className="text-gray-600">//</span>
            </React.Fragment>
          ))}
          <span className="flex items-center gap-1.5 text-blue-400">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" /> OWASP SHIELD: COMPLIANT
          </span>
          <span className="text-gray-600">//</span>
          <span className="flex items-center gap-1.5 text-orange-400 font-bold">
            <AlertTriangle className="w-3.5 h-3.5 text-orange-500 animate-pulse" /> RISK INDEX: {isAnyBlocked ? '7.8 SEVERE' : '2.1 LOW'}
          </span>
          <span className="text-gray-600">//</span>
          <span className="flex items-center gap-1.5">
            WIFI TEMP: <span className="text-white">24°C</span>
          </span>
          <span className="text-gray-600">//</span>

          {/* Iteration 2 (Duplicates for seamless loop) */}
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            SYSTEM CORE CHECK: <span className="text-white">ONLINE</span>
          </span>
          <span className="text-gray-600">//</span>
          {metrics.map(m => (
            <React.Fragment key={`tick2-${m.gateId}`}>
              <span className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${m.isOpen ? 'bg-emerald-500' : 'bg-orange-600 animate-ping'}`}></span>
                {m.gateName}: <span className={m.crowdDensityPct > 80 ? 'text-orange-400 font-bold' : 'text-white'}>{m.crowdDensityPct}% LOAD</span>
                <span className="text-gray-500">({m.estimatedWaitMinutes}m wait)</span>
              </span>
              <span className="text-gray-600">//</span>
            </React.Fragment>
          ))}
          <span className="flex items-center gap-1.5 text-blue-400">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" /> OWASP SHIELD: COMPLIANT
          </span>
          <span className="text-gray-600">//</span>
          <span className="flex items-center gap-1.5 text-orange-400 font-bold">
            <AlertTriangle className="w-3.5 h-3.5 text-orange-500 animate-pulse" /> RISK INDEX: {isAnyBlocked ? '7.8 SEVERE' : '2.1 LOW'}
          </span>
          <span className="text-gray-600">//</span>
          <span className="flex items-center gap-1.5">
            WIFI TEMP: <span className="text-white">24°C</span>
          </span>
          <span className="text-gray-600">//</span>
        </div>
      </div>
    </div>
  );
}
