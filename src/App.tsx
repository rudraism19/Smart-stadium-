/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Activity,
  ShieldCheck,
  AlertTriangle,
  Compass,
  Users,
  RefreshCw,
  Play,
  CheckCircle2,
  Globe,
  Accessibility,
  Terminal,
  Ticket,
  MapPin,
  Clock,
  Radio,
  FileText,
  AlertCircle
} from 'lucide-react';

// Domain models imported conceptually from our shared types
import { CrowdMetric, StadiumIncident, TransitUpdate, FanProfile, FanRoutingResponse, OperationsCommandSynthesis } from './types';

// Modular UI Components for higher-quality code architecture
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { MarqueeTicker } from './components/MarqueeTicker';
import { PerformanceMatrix } from './components/PerformanceMatrix';
import { MarkdownRenderer } from './components/MarkdownRenderer';

export default function App() {
  // Stadium stream states
  const [metrics, setMetrics] = useState<CrowdMetric[]>([]);
  const [incidents, setIncidents] = useState<StadiumIncident[]>([]);
  const [transit, setTransit] = useState<TransitUpdate[]>([]);
  const [selectedGateId, setSelectedGateId] = useState<string | null>('G4');
  
  // Command synthesis state
  const [synthesis, setSynthesis] = useState<OperationsCommandSynthesis | null>(null);
  const [synthesisLoading, setSynthesisLoading] = useState(false);

  // Fan experience simulator state
  const [fanProfile, setFanProfile] = useState<FanProfile>({
    id: 'FAN-2026',
    name: 'Maria Juarez (Masked)',
    email: 'm.juarez@fifafan.es',
    phone: '+34-600-112233',
    languagePreference: 'es',
    accessibilityNeeds: 'wheelchair',
    currentLocation: 'Outside Western Sector (Gate 4)',
    destination: 'Tribune Section 208'
  });

  const [fanQuery, setFanQuery] = useState('¿La puerta 4 está congestionada? ¿Cómo puedo llegar a mi asiento en silla de ruedas?');
  const [routingResult, setRoutingResult] = useState<FanRoutingResponse | null>(null);
  const [routingLoading, setRoutingLoading] = useState(false);

  // Screen reader announcer for live updates (WCAG accessibility compliance)
  const [srAnnouncement, setSrAnnouncement] = useState<string>('');

  // Handle manual selection and speak back status
  const handleSelectGate = (gateId: string) => {
    setSelectedGateId(gateId);
    const gate = metrics.find(m => m.gateId === gateId);
    if (gate) {
      setSrAnnouncement(`Selected ${gate.gateName}. Current density is ${gate.crowdDensityPct} percent. Estimated wait is ${gate.estimatedWaitMinutes} minutes. Gateway state is ${gate.isOpen ? 'open' : 'blocked'}.`);
    }
  };

  // Test Runner state
  const [testOutput, setTestOutput] = useState<string>('');
  const [testsLoading, setTestsLoading] = useState(false);
  const [testsPassed, setTestsPassed] = useState<boolean | null>(null);

  // Scrolling terminal & container refs for modern UI effects
  const terminalRef = useRef<HTMLDivElement | null>(null);
  const routeResultRef = useRef<HTMLDivElement | null>(null);

  // Advanced Memory Safety: Refs for async timeouts and stream simulation intervals
  const bannerTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const testIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-scroll terminal to bottom as log data streams in
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [testOutput]);

  // Smooth scroll route directions into view on calculation complete
  useEffect(() => {
    if (routingResult && routeResultRef.current) {
      routeResultRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [routingResult]);

  // Clean up timers on unmount to prevent memory leaks and warning logs
  useEffect(() => {
    return () => {
      if (bannerTimeoutRef.current) clearTimeout(bannerTimeoutRef.current);
      if (testIntervalRef.current) clearInterval(testIntervalRef.current);
    };
  }, []);

  // Notification Banner
  const [banner, setBanner] = useState<{ type: 'success' | 'warning' | 'info'; message: string } | null>({
    type: 'info',
    message: 'System seeded with default FIFA World Cup 2026 nominal stadium parameters.'
  });

  // Fetch metrics and update overall command synthesis on load
  useEffect(() => {
    fetchStadiumState();
  }, []);

  const fetchStadiumState = async () => {
    try {
      const res = await fetch('/api/stadium/metrics');
      const data = await res.json();
      const fetchedMetrics = data.crowdMetrics || [];
      setMetrics(fetchedMetrics);
      setIncidents(data.incidents || []);
      setTransit(data.transitUpdates || []);
      
      // Auto pre-select G4 if available, else first gate
      if (fetchedMetrics.length > 0) {
        const hasG4 = fetchedMetrics.some((m: CrowdMetric) => m.gateId === 'G4');
        if (hasG4) {
          setSelectedGateId('G4');
        } else {
          setSelectedGateId(fetchedMetrics[0].gateId);
        }
      }
    } catch (err) {
      showBanner('warning', 'Failed to fetch active stadium state from the server.');
    }
  };

  const showBanner = (type: 'success' | 'warning' | 'info', message: string) => {
    if (bannerTimeoutRef.current) {
      clearTimeout(bannerTimeoutRef.current);
    }
    setBanner({ type, message });
    bannerTimeoutRef.current = setTimeout(() => {
      setBanner(null);
      bannerTimeoutRef.current = null;
    }, 6000);
  };

  // Trigger Operations Command Synthesis
  const handleSynthesizeCommand = async () => {
    setSynthesisLoading(true);
    try {
      const res = await fetch('/api/stadium/command-synthesis', { method: 'POST' });
      const data = await res.json();
      setSynthesis(data);
      showBanner('success', 'GenAI Command synthesis refreshed successfully.');
      setSrAnnouncement(`Operations synthesis loaded. Stadium risk score is ${data.overallStadiumRiskScore} percent with risk level ${data.riskLevel.replace('_', ' ')}. Action plan items include: ${data.actionPlan.slice(0, 2).join(' and ')}.`);
    } catch (err) {
      showBanner('warning', 'Command synthesis API failed.');
    } finally {
      setSynthesisLoading(false);
    }
  };

  // Submit Waypoint Query
  const handlePlanRoute = async () => {
    setRoutingLoading(true);
    try {
      const res = await fetch('/api/stadium/plan-route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: fanProfile,
          userQuery: fanQuery
        })
      });
      const data = await res.json();
      setRoutingResult(data);
      showBanner('success', 'Custom accessible route waypoints calculated.');
      if (data.fallbackText) {
        setSrAnnouncement(`Route planned. Screen reader directions: ${data.fallbackText}`);
      } else {
        setSrAnnouncement(`Route planned successfully with accessibility options accommodated.`);
      }
    } catch (err) {
      showBanner('warning', 'Wayfinding pathfinder API call failed.');
    } finally {
      setRoutingLoading(false);
    }
  };

  // Trigger Severe Bottleneck Crisis
  const handleTriggerCrisis = async () => {
    try {
      const res = await fetch('/api/stadium/trigger-crisis', { method: 'POST' });
      const data = await res.json();
      showBanner('warning', '⚠️ EMERGENCY LOADED: Gate 4 complete bottleneck & offline blackout active.');
      await fetchStadiumState();
      // Auto trigger command synthesis to let operators analyze the threat
      await handleSynthesizeCommand();
    } catch (err) {
      showBanner('warning', 'Crisis injection failed.');
    }
  };

  // Reset to Nominal defaults
  const handleResetNominal = async () => {
    try {
      const res = await fetch('/api/stadium/reset', { method: 'POST' });
      const data = await res.json();
      showBanner('success', 'Stadium returned to nominal safe default conditions.');
      setRoutingResult(null);
      setSynthesis(null);
      await fetchStadiumState();
    } catch (err) {
      showBanner('warning', 'Reset failed.');
    }
  };

  // Run Backend Test Suite with dynamic log streaming simulation
  const handleRunTests = async () => {
    if (testIntervalRef.current) {
      clearInterval(testIntervalRef.current);
    }
    setTestsLoading(true);
    setTestOutput('Launching Smart Stadium DevSecOps Audit & Test runner...\n');
    setTestsPassed(null);
    try {
      const res = await fetch('/api/stadium/run-tests', { method: 'POST' });
      const data = await res.json();
      const rawOutput = data.stdout || data.stderr || 'No output log returned.';
      
      const lines = rawOutput.split('\n');
      let currentOutput = 'Initializing secure sandbox...\nStarting Aztec Node-04 check-in protocol...\n\n';
      let lineIndex = 0;
      
      testIntervalRef.current = setInterval(() => {
        if (lineIndex < lines.length) {
          currentOutput += lines[lineIndex] + '\n';
          setTestOutput(currentOutput);
          lineIndex++;
        } else {
          if (testIntervalRef.current) {
            clearInterval(testIntervalRef.current);
            testIntervalRef.current = null;
          }
          setTestsPassed(data.success);
          setTestsLoading(false);
          if (data.success) {
            showBanner('success', 'DevSecOps Audit Passed: 100% Compliance Verified Offline.');
          } else {
            showBanner('warning', 'Test suite reported failure checks.');
          }
        }
      }, 35); // Fast-paced 35ms dynamic streaming scroll
      
    } catch (err) {
      if (testIntervalRef.current) {
        clearInterval(testIntervalRef.current);
        testIntervalRef.current = null;
      }
      setTestOutput('Test Execution Interrupted: Server failed to execute tests.');
      setTestsPassed(false);
      setTestsLoading(false);
    }
  };

  // Custom simple React component to render sanitized markdown cleanly
  const renderMarkdown = (text: string) => {
    return <MarkdownRenderer text={text} />;
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] font-sans text-[#D1D5DB] flex flex-col selection:bg-orange-600 selection:text-white">
      
      {/* Screen reader dynamic announcer for accessible live logs */}
      <div className="sr-only" aria-live="polite" role="status" id="accessibility-live-announcer">
        {srAnnouncement}
      </div>
      
      {/* Technical Tournament Header */}
      <Header />

      {/* Global Alerts & Feedback Banner */}
      {banner && (
        <div className={`px-6 py-2 text-center text-xs font-mono transition-all duration-300 border-b flex items-center justify-center gap-2 ${
          banner.type === 'success' ? 'bg-emerald-950/40 text-emerald-300 border-emerald-900/60' :
          banner.type === 'warning' ? 'bg-orange-950/30 text-orange-400 border-orange-900/40' :
          'bg-[#111] text-gray-400 border-[#333]'
        }`}>
          <AlertCircle className="w-4 h-4 shrink-0 text-orange-500" />
          <span className="uppercase tracking-wide">{banner.message}</span>
        </div>
      )}

      {/* Dynamic Scrolling Telemetry Ticker */}
      <MarqueeTicker metrics={metrics} />

      {/* Primary Dashboard Bento Grid layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-x-hidden">
        
        {/* LEFT COLUMN: Operations Command & Stream Feeds (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* INTERACTIVE STADIUM VISUAL MESH CARD */}
          <section className="bg-[#141414] border border-[#333] rounded-lg p-5 shadow-xl relative overflow-hidden glowing-panel" id="stadium-mesh">
            <div className="flex items-center justify-between mb-4 border-b border-[#333] pb-3">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-orange-500" />
                <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-gray-300">Aztec Stadium Visual Mesh</h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-[9px] text-gray-400 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  SENSOR FUSION ACTIVE
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              
              {/* Stadium Visual Diagram (Col span 7) */}
              <div className="lg:col-span-7 bg-black/60 rounded border border-white/5 relative p-4 flex flex-col items-center justify-center min-h-[280px]">
                {/* Visual grid background */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#222_1px,_transparent_1px)] bg-[size:16px_16px] opacity-60 pointer-events-none rounded"></div>
                
                {/* Stadium Outline Outer */}
                <div className="w-[320px] h-[190px] border-2 border-white/10 rounded-[60px] relative flex items-center justify-center bg-black/40">
                  {/* Outer security perimeter path */}
                  <div className="absolute inset-2 border border-dashed border-white/5 rounded-[50px]"></div>
                  
                  {/* Seating Bowl Rings */}
                  <div className="absolute inset-6 border border-white/10 rounded-[40px] bg-black/30 flex items-center justify-center">
                    <div className="absolute inset-4 border border-white/5 rounded-[30px]"></div>
                  </div>
                  
                  {/* Center Football Pitch */}
                  <div className="w-[100px] h-[60px] border border-white/15 bg-emerald-950/20 rounded relative flex items-center justify-center">
                    {/* Midfield line and circle */}
                    <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-white/10"></div>
                    <div className="w-8 h-8 border border-white/10 rounded-full"></div>
                    {/* Goal posts */}
                    <div className="absolute left-0 top-1/3 bottom-1/3 w-1 border-y border-r border-white/20"></div>
                    <div className="absolute right-0 top-1/3 bottom-1/3 w-1 border-y border-l border-white/20"></div>
                  </div>

                  {/* Dynamic heatmaps of densities based on metrics */}
                  {metrics.map(m => {
                    const isG4 = m.gateId === 'G4' || m.gateName.toLowerCase().includes('gate 4') || m.gateId === 'gate_4';
                    const isG1 = m.gateId === 'G1' || m.gateName.toLowerCase().includes('gate 1') || m.gateId === 'gate_1';
                    const isG2 = m.gateId === 'G2' || m.gateName.toLowerCase().includes('gate 2') || m.gateId === 'gate_2';
                    const isG3 = m.gateId === 'G3' || m.gateName.toLowerCase().includes('gate 3') || m.gateId === 'gate_3';
                    
                    let posClass = "";
                    let label = "";
                    if (isG1) { posClass = "top-2 left-[135px]"; label = "G1 (N)"; }
                    else if (isG2) { posClass = "right-2 top-[80px]"; label = "G2 (E)"; }
                    else if (isG3) { posClass = "bottom-2 left-[135px]"; label = "G3 (S)"; }
                    else if (isG4) { posClass = "left-2 top-[80px]"; label = "G4 (W)"; }
                    else return null;

                    const isSelected = selectedGateId === m.gateId;
                    
                    return (
                      <button
                        key={m.gateId}
                        onClick={() => handleSelectGate(m.gateId)}
                        className="absolute cursor-pointer transition-all z-25 outline-none flex flex-col items-center justify-center focus-visible:ring-2 focus-visible:ring-orange-500 rounded p-1"
                        style={{
                          top: isG1 ? '8px' : isG3 ? 'auto' : '80px',
                          bottom: isG3 ? '8px' : 'auto',
                          left: isG1 || isG3 ? '135px' : isG4 ? '8px' : 'auto',
                          right: isG2 ? '8px' : 'auto'
                        }}
                        aria-label={`Select and monitor ${m.gateName}. Current load: ${m.crowdDensityPct}%, State: ${m.isOpen ? 'online' : 'blocked'}.`}
                      >
                        {/* Dynamic glow effect */}
                        {m.isOpen ? (
                          <span className="relative flex h-3.5 w-3.5">
                            {m.crowdDensityPct > 70 && (
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                            )}
                            <span className={`relative inline-flex rounded-full h-3.5 w-3.5 border ${
                              isSelected ? 'bg-emerald-400 border-white ring-2 ring-emerald-500/50' : 'bg-emerald-500 border-emerald-300'
                            }`}></span>
                          </span>
                        ) : (
                          <span className="relative flex h-4 w-4">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-600 opacity-75"></span>
                            <span className={`relative inline-flex rounded-full h-4 w-4 border items-center justify-center text-[7px] font-bold ${
                              isSelected ? 'bg-orange-600 border-white ring-2 ring-orange-500/50' : 'bg-orange-500 border-orange-300 text-white'
                            }`}>!</span>
                          </span>
                        )}

                        {/* Label Badge */}
                        <span className={`mt-1 font-mono text-[8px] px-1 py-0.5 rounded border tracking-tighter ${
                          isSelected 
                            ? 'bg-orange-600 border-orange-400 text-white font-bold' 
                            : 'bg-black/80 border-white/10 text-gray-400 hover:text-white'
                        }`}>
                          {label}
                        </span>
                      </button>
                    );
                  })}

                  {/* Pulsing hazard overlay near Gate 4 */}
                  {metrics.some(m => (m.gateId === 'G4' || m.gateId === 'gate_4') && !m.isOpen) && (
                    <div className="absolute left-6 top-[72px] w-16 h-10 border border-orange-600/30 bg-orange-950/10 rounded flex flex-col items-center justify-center animate-pulse z-10">
                      <span className="text-[7px] font-mono text-orange-400 font-bold tracking-widest">BOTTLENECK</span>
                      <span className="text-[6px] font-mono text-orange-500">GATE 4 BLOCKED</span>
                    </div>
                  )}
                </div>

                {/* Legend */}
                <div className="mt-4 flex gap-4 text-[9px] font-mono text-gray-500">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>ONLINE / FLOW NOMINAL</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                    <span>MODERATE LOAD</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-orange-600 animate-ping"></span>
                    <span>BLOCKED / CRITICAL</span>
                  </div>
                </div>
              </div>

              {/* Live Selected Gate HUD Panel (Col span 5) */}
              <div className="lg:col-span-5 flex flex-col justify-between">
                {(() => {
                  const selectedGate = metrics.find(m => m.gateId === selectedGateId) || metrics[0];
                  if (!selectedGate) {
                    return (
                      <div className="h-full bg-black/40 border border-white/5 rounded p-4 flex flex-col items-center justify-center text-center text-gray-500 text-[10px] font-mono">
                        <span>SELECT GATE ON MAP TO MONITOR TELEMETRY FEED</span>
                      </div>
                    );
                  }

                  return (
                    <div className="bg-black/40 border border-white/5 rounded p-4 flex-1 flex flex-col justify-between font-mono">
                      <div>
                        {/* Monitor header */}
                        <div className="text-[8px] text-gray-500 uppercase tracking-widest font-bold mb-1 border-b border-[#333] pb-1 flex items-center justify-between">
                          <span>SENSOR FEED // HUD</span>
                          <span className="text-orange-500 animate-pulse">● LIVE</span>
                        </div>
                        <h3 className="text-xs font-bold text-white uppercase truncate mb-3">
                          {selectedGate.gateName}
                        </h3>

                        {/* Numeric stats */}
                        <div className="grid grid-cols-2 gap-2.5 mb-3">
                          <div className="bg-[#111] p-2 rounded border border-[#333]">
                            <span className="text-[7px] text-gray-500 uppercase">CROWD DENSITY</span>
                            <div className={`text-sm font-bold mt-0.5 ${
                              selectedGate.crowdDensityPct > 80 ? 'text-orange-500' : 'text-emerald-400'
                            }`}>
                              {selectedGate.crowdDensityPct}%
                            </div>
                          </div>
                          <div className="bg-[#111] p-2 rounded border border-[#333]">
                            <span className="text-[7px] text-gray-500 uppercase">WAIT TIMELINE</span>
                            <div className="text-sm font-bold text-gray-300 mt-0.5">
                              {selectedGate.estimatedWaitMinutes} min
                            </div>
                          </div>
                          <div className="bg-[#111] p-2 rounded border border-[#333]">
                            <span className="text-[7px] text-gray-500 uppercase">FLOW INFLOW/MIN</span>
                            <div className="text-sm font-bold text-gray-300 mt-0.5">
                              {selectedGate.throughputPerMinute} fans
                            </div>
                          </div>
                          <div className="bg-[#111] p-2 rounded border border-[#333]">
                            <span className="text-[7px] text-gray-500 uppercase">GATEWAY STATE</span>
                            <div className={`text-xs font-bold mt-1 uppercase ${
                              selectedGate.isOpen ? 'text-emerald-400' : 'text-orange-500'
                            }`}>
                              {selectedGate.isOpen ? 'OPEN' : 'BLOCKED'}
                            </div>
                          </div>
                        </div>

                        {/* Accessibility lists */}
                        <div className="mb-4">
                          <span className="text-[7px] text-gray-500 uppercase block mb-1">ACCESSIBILITY PROTOCOLS</span>
                          <div className="flex flex-wrap gap-1">
                            {selectedGate.accessibilityFeatures.map(feat => (
                              <span key={feat} className="bg-white/5 border border-white/5 text-[7px] px-1.5 py-0.5 rounded text-gray-300 uppercase">
                                {feat.replace('_', ' ')}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Simulation Controller Action triggers inside map HUD */}
                      <div className="pt-3 border-t border-[#333] space-y-2">
                        <span className="text-[7px] text-gray-500 uppercase block mb-1">STADIUM COMMAND OVERRIDES</span>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={handleTriggerCrisis}
                            className="bg-orange-950/20 hover:bg-orange-950/40 text-orange-400 border border-orange-900/40 hover:border-orange-500 text-[9px] font-bold py-1.5 px-2 rounded cursor-pointer transition-all uppercase tracking-tighter"
                          >
                            ⚡ Inject Crisis
                          </button>
                          <button
                            onClick={handleResetNominal}
                            className="bg-black hover:bg-white/5 text-emerald-400 border border-[#333] hover:border-emerald-900 text-[9px] font-bold py-1.5 px-2 rounded cursor-pointer transition-all uppercase tracking-tighter"
                          >
                            ✓ Reset Deck
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })()}
              </div>

            </div>

            {/* Mesh stats bar */}
            <div className="mt-4 pt-3 border-t border-[#333] flex items-center justify-between font-mono text-[9px] text-gray-500">
              <div className="flex gap-4">
                <span>STADIUM SYSTEM TEMP: <span className="text-white">24°C</span></span>
                <span>HUMIDITY: <span className="text-white">58%</span></span>
                <span>WIFI SATURATION: <span className="text-white">89%</span></span>
              </div>
              <div className={`font-bold uppercase tracking-wider ${
                metrics.some(m => !m.isOpen) ? 'text-orange-500' : 'text-emerald-400'
              }`}>
                RISK LEVEL: {metrics.some(m => !m.isOpen) ? '7.8 // SEVERE BOTTLE-NECK WARNING' : '2.1 // LOW SECTOR PRESSURE'}
              </div>
            </div>
          </section>

          {/* Active IoT Metric Streams Card */}
          <section className="bg-[#141414] border border-[#333] rounded-lg p-5 shadow-xl relative overflow-hidden bg-[radial-gradient(circle_at_center,_#222_1px,_transparent_1px)] bg-[size:24px_24px] glowing-panel" id="iot-telemetry">
            <div className="flex items-center justify-between mb-4 border-b border-[#333] pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-orange-500" />
                <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-gray-300">Live IoT Gate Telemetry</h2>
              </div>
              <span className="flex items-center gap-1 text-[9px] text-gray-500 font-mono">
                <span className="w-2 h-2 rounded-full bg-orange-600 animate-ping"></span>
                POLLING STREAMS ACTIVE // 120HZ
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {metrics.map((m) => {
                const isSelected = selectedGateId === m.gateId;
                return (
                  <button
                    key={m.gateId}
                    onClick={() => handleSelectGate(m.gateId)}
                    className={`p-3.5 rounded border text-left transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-orange-500 block w-full ${
                      isSelected 
                        ? 'bg-[#1e140d] border-orange-500/80 shadow-[0_0_12px_rgba(234,88,12,0.2)]'
                        : m.isOpen 
                          ? 'bg-black/50 border-[#333] hover:border-[#555]' 
                          : 'bg-orange-950/10 border-orange-900/40 shadow-inner hover:border-[#555]'
                    }`}
                    aria-label={`${m.gateName} sensor stream. Currently ${m.isOpen ? 'online' : 'blocked'} with ${m.crowdDensityPct}% density and ${m.estimatedWaitMinutes} minutes wait. Click or press enter to inspect on mapping systems.`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-mono font-bold text-gray-200">{m.gateName}</span>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold tracking-wider uppercase ${
                        m.isOpen ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-900/60' : 'bg-orange-950/80 text-orange-400 border border-orange-900/60'
                      }`}>
                        {m.isOpen ? 'ONLINE' : 'BLOCKED'}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                      <div className="bg-white/5 border border-white/5 p-2 rounded">
                        <div className="text-[8px] text-gray-500 uppercase font-mono font-bold">Density</div>
                        <div className={`text-xs font-mono font-bold mt-0.5 ${
                          m.crowdDensityPct > 80 ? 'text-orange-500' : m.crowdDensityPct > 60 ? 'text-amber-500' : 'text-emerald-400'
                        }`}>
                          {m.crowdDensityPct}%
                        </div>
                      </div>
                      <div className="bg-white/5 border border-white/5 p-2 rounded">
                        <div className="text-[8px] text-gray-500 uppercase font-mono font-bold">Wait Time</div>
                        <div className="text-xs font-mono font-bold text-gray-300 mt-0.5">
                          {m.estimatedWaitMinutes}m
                        </div>
                      </div>
                      <div className="bg-white/5 border border-white/5 p-2 rounded">
                        <div className="text-[8px] text-gray-500 uppercase font-mono font-bold">Inflow/m</div>
                        <div className="text-xs font-mono font-bold text-gray-300 mt-0.5">
                          {m.throughputPerMinute}
                        </div>
                      </div>
                    </div>

                    <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                      {m.accessibilityFeatures.map(feat => (
                        <span key={feat} className="bg-white/5 text-gray-400 text-[8px] px-1.5 py-0.5 rounded border border-white/10 flex items-center gap-0.5 font-mono uppercase">
                          <Accessibility className="w-2.5 h-2.5 text-gray-500" />
                          {feat.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Stadium Transit Logs Inline */}
            <div className="mt-5 pt-4 border-t border-[#333]">
              <h3 className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-orange-500" /> Transit Infrastructure Stream
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {transit.map(t => (
                  <div key={t.lineId} className="bg-black/30 p-2.5 rounded border border-[#333] flex items-center justify-between text-xs font-mono">
                    <div>
                      <div className="font-bold text-gray-300 uppercase text-[11px]">{t.lineName}</div>
                      <div className="text-[9px] text-gray-500 uppercase">Inflow Rate: {t.currentInflowRate} fans/min</div>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-bold border ${
                        t.status === 'operational' ? 'bg-emerald-950/60 text-emerald-400 border-emerald-900/50' : 'bg-orange-950/60 text-orange-400 border-orange-900/50'
                      }`}>
                        {t.status === 'operational' ? 'OK' : `DELAY +${t.delayMinutes}M`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Active Incidents & Emergency Ticker */}
          <section className="bg-[#141414] border border-[#333] rounded-lg p-5 shadow-xl glowing-panel">
            <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-gray-300 mb-4 border-b border-[#333] pb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-500" /> Active Operations Logs
            </h2>
            {incidents.length === 0 ? (
              <p className="text-xs text-gray-500 font-mono uppercase">No active operational logs. Nominal safety standards verified.</p>
            ) : (
              <div className="space-y-3">
                {incidents.map(inc => (
                  <div key={inc.id} className={`p-3.5 rounded border flex gap-3 ${
                    inc.severity === 'critical' ? 'bg-orange-950/10 border-orange-900/60' : 'bg-black/40 border-[#333]'
                  }`}>
                    <div className="mt-0.5 text-orange-500">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                    </div>
                    <div className="flex-1 text-xs">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-mono font-bold text-gray-200">{inc.id} - {inc.type.replace('_', ' ').toUpperCase()}</span>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase border ${
                          inc.severity === 'critical' ? 'bg-orange-600 text-white border-orange-500' : 'bg-white/5 text-gray-400 border-white/10'
                        }`}>
                          {inc.severity}
                        </span>
                      </div>
                      <p className="text-gray-300 font-mono text-[11px] leading-relaxed">{inc.description}</p>
                      {inc.resolutionPlan && (
                        <div className="mt-2 text-gray-400 border-t border-[#333] pt-1.5 flex gap-1 items-start">
                          <span className="text-[9px] font-mono font-bold text-orange-500">PLAN:</span>
                          <span className="text-[10px] italic text-gray-400 font-mono">{inc.resolutionPlan}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* GenAI Operations Command Synthesis Panel */}
          <section className="bg-[#141414] border border-[#333] rounded-lg p-5 shadow-xl relative overflow-hidden glowing-panel">
            <div className="absolute right-0 top-0 w-32 h-32 bg-orange-600/5 rounded-full blur-3xl"></div>
            
            <div className="flex items-center justify-between mb-4 border-b border-[#333] pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-orange-500" />
                <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-gray-300">GenAI Command Center Synthesis</h2>
              </div>
              <button
                onClick={handleSynthesizeCommand}
                disabled={synthesisLoading}
                className="bg-orange-600 hover:bg-orange-500 text-white px-3 py-1.5 rounded text-[10px] font-mono font-bold tracking-widest uppercase transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1.5 border border-orange-500/30"
              >
                {synthesisLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                Run Live Synthesis
              </button>
            </div>

            {synthesis ? (
              <div className="space-y-4">
                {/* Risk and Status Level */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-black/60 p-4 rounded border border-[#333]">
                  <div className="text-center md:border-r border-[#333] md:pr-4">
                    <div className="text-[8px] uppercase text-gray-500 font-mono font-bold">Stadium Risk Score</div>
                    <div className="text-3xl font-mono font-bold text-orange-500 mt-1">{synthesis.overallStadiumRiskScore}/100</div>
                  </div>
                  <div className="text-center md:border-r border-[#333] md:px-4">
                    <div className="text-[8px] uppercase text-gray-500 font-mono font-bold">Risk Categorization</div>
                    <div className={`text-[10px] uppercase font-mono font-bold mt-3 px-2.5 py-0.5 rounded inline-block border ${
                      synthesis.riskLevel === 'critical_crisis' ? 'bg-orange-950 text-orange-400 border-orange-900' :
                      synthesis.riskLevel === 'high_risk' ? 'bg-orange-900/20 text-orange-300 border-orange-800' :
                      synthesis.riskLevel === 'elevated' ? 'bg-amber-950 text-amber-400 border-amber-900' :
                      'bg-emerald-950 text-emerald-400 border-emerald-900'
                    }`}>
                      {synthesis.riskLevel.replace('_', ' ')}
                    </div>
                  </div>
                  <div className="md:col-span-2 md:pl-4 text-left">
                    <div className="text-[8px] uppercase text-gray-500 font-mono font-bold mb-1">Director Brief</div>
                    <p className="text-xs text-gray-300 leading-relaxed italic font-mono">{synthesis.summary}</p>
                  </div>
                </div>

                {/* Critical Alerts & Action Items */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-black/30 p-3.5 rounded border border-[#333]">
                    <div className="text-[10px] font-mono font-bold text-orange-400 uppercase mb-2 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> Synthesized Threat Warnings
                    </div>
                    {synthesis.criticalAlerts.length === 0 ? (
                      <p className="text-[10px] text-gray-500 font-mono uppercase">No active alerts reported.</p>
                    ) : (
                      <ul className="space-y-1.5">
                        {synthesis.criticalAlerts.map((al, idx) => (
                          <li key={idx} className="text-[11px] text-gray-300 font-mono flex items-start gap-1.5">
                            <span className="text-orange-500 shrink-0">•</span>
                            <span>{al}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="bg-black/30 p-3.5 rounded border border-[#333]">
                    <div className="text-[10px] font-mono font-bold text-emerald-400 uppercase mb-2 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Immediate Crowd Action Plan
                    </div>
                    <ul className="space-y-1.5 font-mono">
                      {synthesis.actionPlan.map((act, idx) => (
                        <li key={idx} className="text-[11px] text-gray-300 flex items-start gap-1.5">
                          <span className="text-emerald-400 shrink-0">{idx + 1}.</span>
                          <span>{act}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Urgent Staff Dispatches */}
                <div className="bg-black/40 p-3.5 rounded border border-[#333]">
                  <div className="text-[10px] font-mono font-bold text-gray-400 uppercase mb-2.5 flex items-center gap-1">
                    <Users className="w-4 h-4 text-orange-500" /> Command dispatch Assignments
                  </div>
                  <div className="space-y-2">
                    {synthesis.staffAssignments.map((st, idx) => (
                      <div key={idx} className="bg-black/60 p-2.5 rounded border border-[#333] flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs font-mono">
                        <div className="flex items-center gap-2">
                          <span className="bg-white/5 px-2 py-0.5 rounded font-mono text-[9px] text-orange-400 border border-white/10 font-bold">{st.staffRole}</span>
                          <span className="text-gray-500 flex items-center gap-0.5 text-[10px]">
                            <MapPin className="w-3 h-3 text-gray-600" /> {st.locationId}
                          </span>
                        </div>
                        <p className="text-gray-300 text-xs italic">"{st.instruction}"</p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ) : (
              <div className="text-center py-8 bg-black/40 rounded border border-dashed border-[#333]">
                <ShieldCheck className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                <p className="text-xs text-gray-400 font-mono uppercase">Operational Command is awaiting live stream data synthesis. Click "Run Live Synthesis" above.</p>
              </div>
            )}
          </section>

        </div>

        {/* RIGHT COLUMN: Fan Simulator & Wayfinding (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* LIVE COMMAND PERFORMANCE MATRIX */}
          <PerformanceMatrix />

          {/* Fan Experience Wayfinder Simulator */}
          <section className="bg-[#141414] border border-[#333] rounded-lg p-5 shadow-xl relative glowing-panel">
            <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-gray-300 mb-4 border-b border-[#333] pb-2 flex items-center gap-2">
              <Compass className="w-5 h-5 text-orange-500" /> Fan Wayfinder Simulator
            </h2>

            {/* Profile Inputs */}
            <div className="bg-black/55 p-4 rounded border border-[#333] space-y-3 mb-4">
              <div className="text-[9px] uppercase font-mono font-bold text-gray-500 flex items-center justify-between border-b border-[#333] pb-1.5">
                <span>SIMULATED FAN PROFILE</span>
                <span className="text-orange-500 font-mono">RED-RED-22 // METRIC</span>
              </div>

              {/* Languages Preferences */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="fan-language-select" className="block text-[8px] text-gray-500 font-mono font-bold uppercase mb-1 flex items-center gap-1">
                    <Globe className="w-3 h-3" /> Language Preference
                  </label>
                  <select
                    id="fan-language-select"
                    value={fanProfile.languagePreference}
                    onChange={(e) => setFanProfile({ ...fanProfile, languagePreference: e.target.value })}
                    className="w-full bg-[#111] text-gray-300 text-xs rounded p-1.5 border border-[#333] cursor-pointer outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 font-mono"
                  >
                    <option value="en">English (US/UK)</option>
                    <option value="es">Español (ES/MX)</option>
                    <option value="fr">Français (FR/CA)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="fan-accessibility-select" className="block text-[8px] text-gray-500 font-mono font-bold uppercase mb-1 flex items-center gap-1">
                    <Accessibility className="w-3 h-3" /> Accessibility Level
                  </label>
                  <select
                    id="fan-accessibility-select"
                    value={fanProfile.accessibilityNeeds}
                    onChange={(e) => setFanProfile({ ...fanProfile, accessibilityNeeds: e.target.value as FanProfile['accessibilityNeeds'] })}
                    className="w-full bg-[#111] text-gray-300 text-xs rounded p-1.5 border border-[#333] cursor-pointer outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 font-mono"
                  >
                    <option value="none">None (Standard)</option>
                    <option value="wheelchair">Wheelchair Access (ADA)</option>
                    <option value="sensory_sensitivity">Sensory Sensitivity (Quiet Zones)</option>
                  </select>
                </div>
              </div>

              {/* Waypoints */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="fan-start-input" className="block text-[8px] text-gray-500 font-mono font-bold uppercase mb-1">Starting Point</label>
                  <input
                    id="fan-start-input"
                    type="text"
                    value={fanProfile.currentLocation}
                    onChange={(e) => setFanProfile({ ...fanProfile, currentLocation: e.target.value })}
                    className="w-full bg-[#111] text-gray-300 text-xs rounded p-1.5 border border-[#333] outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 font-mono"
                  />
                </div>
                <div>
                  <label htmlFor="fan-dest-input" className="block text-[8px] text-gray-500 font-mono font-bold uppercase mb-1">Destination Seat</label>
                  <input
                    id="fan-dest-input"
                    type="text"
                    value={fanProfile.destination}
                    onChange={(e) => setFanProfile({ ...fanProfile, destination: e.target.value })}
                    className="w-full bg-[#111] text-gray-300 text-xs rounded p-1.5 border border-[#333] outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 font-mono"
                  />
                </div>
              </div>

              {/* Masked PII Showcase */}
              <div className="p-2 bg-black/40 rounded border border-[#333] text-[9px] space-y-1 text-gray-500 font-mono">
                <div className="text-gray-400 font-bold uppercase">PII Redaction Preview (Strict Masking):</div>
                <div>Name: <span className="text-gray-300">Lionel Mbappe</span> ➔ <span className="text-orange-400 font-bold">[REDACTED_NAME]</span></div>
                <div>Phone: <span className="text-gray-300">+1-555-0199</span> ➔ <span className="text-orange-400 font-bold">[REDACTED_PHONE]</span></div>
                <div>Email: <span className="text-gray-300">fan@stadium.org</span> ➔ <span className="text-orange-400 font-bold">[REDACTED_EMAIL]</span></div>
              </div>
            </div>

            {/* Simulated Query input */}
            <div className="space-y-2 mb-4">
              <label htmlFor="fan-query-input" className="block text-[8px] text-gray-400 font-mono font-bold uppercase">Fan Waypoint Inquiry</label>
              <textarea
                id="fan-query-input"
                value={fanQuery}
                onChange={(e) => setFanQuery(e.target.value)}
                rows={2}
                className="w-full bg-black/60 text-gray-300 text-xs rounded p-2.5 border border-[#333] outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 font-mono resize-none"
                placeholder="Ex: How do I route past Gates safely with wheelchair needs?"
              ></textarea>
            </div>

            <button
              onClick={handlePlanRoute}
              disabled={routingLoading}
              className="w-full bg-orange-600 hover:bg-orange-500 text-white font-mono font-bold tracking-widest uppercase py-2 px-4 rounded text-xs transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5 border border-orange-500/30"
            >
              {routingLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Compass className="w-3.5 h-3.5" />}
              Request Accessible Path Directions
            </button>

            {/* Wayfinder results output */}
            {routingResult && (
              <div ref={routeResultRef} className="mt-5 space-y-4 border-t border-[#333] pt-4" lang={routingResult.language}>
                
                {/* Warnings / Safety Alerts */}
                {routingResult.safetyAlerts && routingResult.safetyAlerts.length > 0 && (
                  <div className="p-3 bg-orange-950/20 border border-orange-900/50 rounded text-xs space-y-1 text-orange-300">
                    <div className="font-mono font-bold flex items-center gap-1 text-[10px] uppercase tracking-wider">
                      <AlertTriangle className="w-3.5 h-3.5 text-orange-500" /> Dynamic Hazard Warning
                    </div>
                    {routingResult.safetyAlerts.map((sa, idx) => (
                      <p key={idx} className="text-[10px] font-mono">• {sa}</p>
                    ))}
                  </div>
                )}

                {/* Markdown Directions */}
                <div className="bg-black/60 p-4 rounded border border-[#333] shadow-inner">
                  <div className="text-[8px] text-gray-500 uppercase font-mono mb-2 flex items-center justify-between">
                    <span>WAYPOINT DIRECTIONS PAYLOAD</span>
                    <span className="bg-[#111] border border-[#333] text-orange-400 px-1.5 py-0.5 rounded text-[8px] font-bold">
                      lang="{routingResult.language}"
                    </span>
                  </div>
                  {renderMarkdown(routingResult.directionsMarkdown)}
                </div>

                {/* Assistive Narratives for Screen Readers (WCAG Compliance Showcase) */}
                <div className="bg-black/30 p-3 rounded border border-[#333] flex items-start gap-3">
                  <Accessibility className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                  <div className="text-[10px] leading-relaxed font-mono">
                    <span className="font-bold text-gray-400 block mb-0.5 uppercase tracking-wide">WCAG 2.2 Screen Reader Narrative (ARIA text fallback):</span>
                    <p className="text-gray-300 italic">"{routingResult.fallbackText}"</p>
                  </div>
                </div>

                {/* Core Path stops */}
                <div className="text-xs">
                  <span className="font-mono font-bold text-gray-400 block mb-2 uppercase text-[9px]">Route Milestones:</span>
                  <div className="flex flex-wrap items-center gap-1.5 font-mono">
                    {routingResult.recommendedRoute.map((stop, sIdx) => (
                      <React.Fragment key={sIdx}>
                        <span className="bg-black/60 px-2 py-0.5 rounded text-[10px] text-gray-300 border border-[#333]">
                          {stop}
                        </span>
                        {sIdx < routingResult.recommendedRoute.length - 1 && (
                          <span className="text-gray-600">➔</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

              </div>
            )}
          </section>

          {/* DevSecOps Live Testing Sandbox */}
          <section className="bg-[#141414] border border-[#333] rounded-lg p-5 shadow-xl glowing-panel">
            <div className="flex items-center justify-between mb-3 border-b border-[#333] pb-2">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-orange-500" />
                <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-gray-300">Live DevSecOps Test Runner</h2>
              </div>
              <button
                onClick={handleRunTests}
                disabled={testsLoading}
                className="bg-black hover:bg-white/5 text-gray-300 px-2.5 py-1 rounded text-[10px] border border-[#333] font-mono tracking-wider transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1"
              >
                {testsLoading ? <RefreshCw className="w-3 h-3 animate-spin text-orange-500" /> : <Play className="w-3 h-3 text-orange-500" />}
                Run Audit
              </button>
            </div>
            
            <p className="text-[10px] text-gray-500 mb-3 leading-relaxed font-mono uppercase">
              Executes the integrated test suite on the server to verify PII masking patterns, OWASP-sanitizers, and routing crisis overrides.
            </p>

            {testOutput ? (
              <div className="space-y-3">
                <div ref={terminalRef} className="bg-black p-3 rounded border border-[#333] font-mono text-[9px] text-[#D1D5DB] h-48 overflow-y-auto shadow-inner leading-relaxed whitespace-pre-wrap">
                  {testOutput}
                </div>
                {testsPassed !== null && (
                  <div className={`p-2.5 rounded border flex items-center gap-2 text-[10px] font-mono ${
                    testsPassed ? 'bg-emerald-950/40 border-emerald-900 text-emerald-300' : 'bg-orange-950/40 border-orange-900 text-orange-300'
                  }`}>
                    {testsPassed ? (
                      <>
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span className="tracking-wide">AUDIT COMPLIANT: ALL TESTS PASSED SUCCESSFULLY!</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-4 h-4 text-orange-400" />
                        <span className="tracking-wide">AUDIT FLAGGED: RESOLVE TEST DEFECTS</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6 bg-black/40 rounded border border-dashed border-[#333] font-mono text-[9px] text-gray-600 uppercase tracking-widest">
                Awaiting audit launch... Click "Run Audit"
              </div>
            )}
          </section>

        </div>

      </main>

      {/* WCAG Footer */}
      <Footer />

    </div>
  );
}
