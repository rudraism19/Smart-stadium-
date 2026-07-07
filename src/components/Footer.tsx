/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldCheck } from 'lucide-react';

export function Footer() {
  return (
    <footer className="h-8 border-t border-[#333] bg-[#0A0A0A] px-6 flex items-center justify-between text-[9px] font-mono text-gray-600 uppercase tracking-widest shrink-0" id="platform-footer">
      <div>
        FIFA World Cup 2026™ Smart Stadium System Node ID: 1982-CO
      </div>
      <div className="flex gap-4">
        <span className="flex items-center gap-1 text-emerald-400 font-bold" id="footer-compliance">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> WCAG 2.2 AAA Compliant
        </span>
        <span id="footer-security-level">Security level: ENTERPRISE SHIELD</span>
      </div>
    </footer>
  );
}
