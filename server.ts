/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { exec } from 'child_process';
import { SmartStadiumOrchestrator } from './src/orchestrator';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize the core Smart Stadium Orchestrator
  const orchestrator = new SmartStadiumOrchestrator();

  app.use(express.json());

  // API 1: Health Check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API 2: Get active stadium metrics (crowd logs, incidents, transit feeds)
  app.get('/api/stadium/metrics', (req, res) => {
    try {
      res.json(orchestrator.getStadiumMetrics());
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to retrieve stadium metrics', details: err.message });
    }
  });

  // API 3: Fan route planner and wayfinding assistance
  app.post('/api/stadium/plan-route', async (req, res) => {
    try {
      const { profile, userQuery } = req.body;
      if (!profile || !userQuery) {
        return res.status(400).json({ error: 'Missing profile or userQuery parameters.' });
      }
      const routingResult = await orchestrator.planFanRoute(profile, userQuery);
      res.json(routingResult);
    } catch (err: any) {
      res.status(500).json({ error: 'Routing orchestration failed.', details: err.message });
    }
  });

  // API 4: Operations Command Layer Synthesis (LLM reasoning over IoT streams)
  app.post('/api/stadium/command-synthesis', async (req, res) => {
    try {
      const synthesis = await orchestrator.synthesizeOperationsCommand();
      res.json(synthesis);
    } catch (err: any) {
      res.status(500).json({ error: 'Command synthesis failed.', details: err.message });
    }
  });

  // API 5: Trigger live simulation of a severe Operational Crisis (Gate 4 closure, medical, crowd bottlenecks)
  app.post('/api/stadium/trigger-crisis', (req, res) => {
    try {
      // Simulate extreme scenario
      const crisisMetrics = [
        {
          gateId: 'G1',
          gateName: 'Gate 1 (North Main Entrance)',
          crowdDensityPct: 65,
          estimatedWaitMinutes: 18,
          throughputPerMinute: 70,
          isOpen: true,
          accessibilityFeatures: ['ramp', 'braille_signs', 'wheelchair_assist'],
          locationCoordinates: { x: 10, y: 80 }
        },
        {
          gateId: 'G2',
          gateName: 'Gate 2 (East Entrance - Family/Sensory Area)',
          crowdDensityPct: 35,
          estimatedWaitMinutes: 8,
          throughputPerMinute: 45,
          isOpen: true,
          accessibilityFeatures: ['ramp', 'sensory_room_adjacent', 'tactile_pathway'],
          locationCoordinates: { x: 90, y: 40 }
        },
        {
          gateId: 'G3',
          gateName: 'Gate 3 (South Entrance)',
          crowdDensityPct: 80,
          estimatedWaitMinutes: 30,
          throughputPerMinute: 60,
          isOpen: true,
          accessibilityFeatures: ['elevator', 'wheelchair_assist'],
          locationCoordinates: { x: 50, y: 10 }
        },
        {
          gateId: 'G4',
          gateName: 'Gate 4 (West VIP/Accessible Ingress)',
          crowdDensityPct: 98,
          estimatedWaitMinutes: 60,
          throughputPerMinute: 0,
          isOpen: false, // CLOSED!
          accessibilityFeatures: ['elevator', 'ramp', 'braille_signs'],
          locationCoordinates: { x: 10, y: 35 }
        }
      ];

      const crisisIncidents = [
        {
          id: 'INC-CRISIS-2026',
          type: 'gate_closure' as const,
          severity: 'critical' as const,
          locationId: 'G4',
          description: 'CRITICAL ACCESS CLOSURE: Gate 4 closed entirely due to an extreme physical crowd bottleneck & digital ticket scanner blackout.',
          timestamp: new Date().toISOString(),
          isActive: true,
          resolutionPlan: 'Direct fans to North Main (Gate 1) and East (Gate 2). Safety Stewards deployed with mega-phones.'
        },
        {
          id: 'INC-102',
          type: 'medical_emergency' as const,
          severity: 'medium' as const,
          locationId: 'Section 114',
          description: 'Heat fatigue incident in upper terrace section 114.',
          timestamp: new Date().toISOString(),
          isActive: true,
          resolutionPlan: 'On-site medical first responders dispatched and assisting.'
        }
      ];

      const crisisTransit = [
        {
          lineId: 'METRO-N',
          lineName: 'Metro Line North (Stadium Link)',
          status: 'delayed' as const,
          delayMinutes: 10,
          currentInflowRate: 480
        },
        {
          lineId: 'SHUTTLE-WEST',
          lineName: 'West Stadium Fan Express Shuttle',
          status: 'suspended' as const,
          delayMinutes: 45,
          currentInflowRate: 0
        }
      ];

      orchestrator.ingestLiveIoTData(crisisMetrics, crisisIncidents, crisisTransit);
      res.json({ status: 'crisis_triggered', message: 'Gate 4 Closed bottleneck simulation loaded.' });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to update simulation metrics', details: err.message });
    }
  });

  // API 6: Reset stadium state back to nominal default operations
  app.post('/api/stadium/reset', (req, res) => {
    try {
      orchestrator.seedStadiumData();
      res.json({ status: 'reset_successful', message: 'Stadium seeded back to standard tournament metrics.' });
    } catch (err: any) {
      res.status(500).json({ error: 'Reset failed', details: err.message });
    }
  });

  // API 7: Execute the comprehensive offline Unit/Integration test suite on the server and pipe logs back
  app.post('/api/stadium/run-tests', (req, res) => {
    // Executes: tsx src/orchestrator.test.ts
    exec('npx tsx src/orchestrator.test.ts', (err, stdout, stderr) => {
      // We don't crash the server if tests fail because some tests are expected to log assertion metrics.
      // We send both stdout and stderr so developers can read logs directly in the UI.
      res.json({
        success: !err,
        stdout: stdout,
        stderr: stderr,
        code: err ? err.code : 0
      });
    });
  });

  // Integrate Vite middleware or serve static files based on NODE_ENV
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`======================================================`);
    console.log(`🏟️  FIFA 2026 SMART STADIUM COMMAND SERVER ACTIVE`);
    console.log(`🚀 Host: http://localhost:${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`======================================================`);
  });
}

startServer().catch((err) => {
  console.error('Failed to boot smart stadium server:', err);
});
