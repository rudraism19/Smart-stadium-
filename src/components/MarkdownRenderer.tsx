/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Compass } from 'lucide-react';

interface MarkdownRendererProps {
  text: string;
}

export function MarkdownRenderer({ text }: MarkdownRendererProps) {
  if (!text) return null;
  
  // Unescape common sanitized HTML tokens for display
  const unescaped = text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
    .replace(/&amp;/g, '&');

  const lines = unescaped.split('\n');
  return (
    <div className="space-y-2 text-slate-200" id="markdown-container">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (trimmed.startsWith('###')) {
          return (
            <h4 key={i} className="text-sm font-semibold text-emerald-400 mt-3 flex items-center gap-1">
              <Compass className="w-4 h-4 text-emerald-400" />
              {trimmed.replace('###', '').trim()}
            </h4>
          );
        }
        if (trimmed.startsWith('Paso') || trimmed.startsWith('Step') || trimmed.startsWith('Étape') || /^\d+\./.test(trimmed)) {
          return (
            <div key={i} className="bg-slate-900 p-2.5 rounded border border-slate-800/80 my-1 text-xs">
              {trimmed}
            </div>
          );
        }
        if (trimmed.startsWith('*') || trimmed.startsWith('-')) {
          const formatted = trimmed.replace(/^[\*\-]\s*/, '');
          return (
            <div key={i} className="flex items-start gap-2 text-xs pl-2 text-slate-300">
              <span className="text-emerald-500">•</span>
              <span>{formatted}</span>
            </div>
          );
        }
        if (trimmed.length === 0) return <div key={i} className="h-1" />;
        return <p key={i} className="text-xs text-slate-300 leading-relaxed">{trimmed}</p>;
      })}
    </div>
  );
}
