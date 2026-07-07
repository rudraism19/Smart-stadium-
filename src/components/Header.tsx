/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';

export function Header() {
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hh = String(now.getUTCHours()).padStart(2, '0');
      const mm = String(now.getUTCMinutes()).padStart(2, '0');
      const ss = String(now.getUTCSeconds()).padStart(2, '0');
      setTimeStr(`UTC ${hh}:${mm}:${ss}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 border-b border-[#333] bg-[#111] flex items-center justify-between px-6 shrink-0" id="platform-header">
      <div className="flex items-center">
        <div className="w-8 h-8 bg-orange-600 rounded flex items-center justify-center font-bold text-white text-xs tracking-wider" id="brand-logo">
          FWC
        </div>
        <div className="ml-4">
          <h1 className="text-sm font-bold tracking-widest text-white uppercase flex items-center gap-2" id="platform-title">
            Smart Stadium Command Platform
            <span className="text-[9px] bg-orange-600/20 text-orange-400 font-mono px-1.5 py-0.5 rounded border border-orange-600/30" id="stadium-node-id">
              STADIUM-AZTEC-04
            </span>
          </h1>
          <p className="text-[10px] text-gray-500 font-mono uppercase tracking-wider" id="platform-subtitle">
            FWC-2026-STADIUM-AZTEC-04 // REAL-TIME OPS ENGINE
          </p>
        </div>
      </div>
      
      <div className="hidden lg:flex items-center space-x-6 text-[10px] font-mono" id="system-status-pills">
        <div className="flex flex-col items-end">
          <span className="text-gray-500 uppercase">SYSTEM STATUS</span>
          <span className="text-emerald-400 font-bold flex items-center gap-1" id="status-indicator-orch">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            GENAI ORCHESTRATOR ONLINE
          </span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-gray-500 uppercase">PII PROTECTION</span>
          <span className="text-blue-400 font-bold" id="status-indicator-shield">SHIELD FILTER: ACTIVE</span>
        </div>
        <div className="bg-white/5 px-3 py-2 border border-white/10 rounded text-xs text-white" id="live-utc-clock">
          {timeStr || 'UTC --:--:--'}
        </div>
      </div>
    </header>
  );
}
