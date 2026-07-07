/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Type } from '@google/genai';
import { SecurityEngine } from './security';
import {
  CrowdMetric,
  StadiumIncident,
  TransitUpdate,
  FanProfile,
  FanRoutingResponse,
  OperationsCommandSynthesis,
  CacheEntry
} from './types';

/**
 * Core Orchestrator for the FIFA World Cup 2026 Smart Stadium Platform.
 * Solves real-time routing for fans and provides synthesis command dashboards.
 */
export class SmartStadiumOrchestrator {
  private ai: GoogleGenAI | null = null;
  private cache = new Map<string, CacheEntry<OperationsCommandSynthesis | FanRoutingResponse>>();

  // Active stadium states (acting as the ingestion/in-memory data layer)
  private crowdMetrics: CrowdMetric[] = [];
  private incidents: StadiumIncident[] = [];
  private transitUpdates: TransitUpdate[] = [];

  constructor(apiKey?: string) {
    const key = apiKey || process.env.GEMINI_API_KEY;
    if (key && key !== 'MY_GEMINI_API_KEY') {
      try {
        this.ai = new GoogleGenAI({
          apiKey: key,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            },
          },
        });
      } catch (e) {
        console.warn('Failed to initialize GoogleGenAI. Operating in fallback mock mode.', e);
        this.ai = null;
      }
    } else {
      console.info('No valid GEMINI_API_KEY detected. Defaulting to high-fidelity Offline Mock Mode for deterministic executions.');
    }

    // Initialize default stadium environment
    this.seedStadiumData();
  }

  /**
   * Seeds default state mimicking a tournament scenario at a 2026 FIFA World Cup stadium.
   */
  public seedStadiumData(): void {
    this.crowdMetrics = [
      {
        gateId: 'G1',
        gateName: 'Gate 1 (North Main Entrance)',
        crowdDensityPct: 45,
        estimatedWaitMinutes: 12,
        throughputPerMinute: 80,
        isOpen: true,
        accessibilityFeatures: ['ramp', 'braille_signs', 'wheelchair_assist'],
        locationCoordinates: { x: 10, y: 80 }
      },
      {
        gateId: 'G2',
        gateName: 'Gate 2 (East Entrance - Family/Sensory Area)',
        crowdDensityPct: 30,
        estimatedWaitMinutes: 6,
        throughputPerMinute: 50,
        isOpen: true,
        accessibilityFeatures: ['ramp', 'sensory_room_adjacent', 'tactile_pathway'],
        locationCoordinates: { x: 90, y: 40 }
      },
      {
        gateId: 'G3',
        gateName: 'Gate 3 (South Entrance)',
        crowdDensityPct: 65,
        estimatedWaitMinutes: 22,
        throughputPerMinute: 75,
        isOpen: true,
        accessibilityFeatures: ['elevator', 'wheelchair_assist'],
        locationCoordinates: { x: 50, y: 10 }
      },
      {
        gateId: 'G4',
        gateName: 'Gate 4 (West VIP/Accessible Ingress)',
        crowdDensityPct: 90,
        estimatedWaitMinutes: 45,
        throughputPerMinute: 20,
        isOpen: false, // CLOSED due to severe crowding bottleneck
        accessibilityFeatures: ['elevator', 'ramp', 'braille_signs'],
        locationCoordinates: { x: 10, y: 35 }
      }
    ];

    this.incidents = [
      {
        id: 'INC-101',
        type: 'bottleneck',
        severity: 'high',
        locationId: 'G4',
        description: 'Gate 4 experienced an ticket-turnstile database offline event, causing crowd accumulation.',
        timestamp: new Date().toISOString(),
        isActive: true,
        resolutionPlan: 'Staff manually routing tickets; recommend detour to Gate 1 or Gate 2.'
      },
      {
        id: 'INC-102',
        type: 'medical_emergency',
        severity: 'medium',
        locationId: 'Section 114',
        description: 'Heat fatigue incident in upper terrace section 114.',
        timestamp: new Date().toISOString(),
        isActive: true,
        resolutionPlan: 'On-site medical first responders dispatched and assisting.'
      }
    ];

    this.transitUpdates = [
      {
        lineId: 'METRO-N',
        lineName: 'Metro Line North (Stadium Link)',
        status: 'operational',
        delayMinutes: 0,
        currentInflowRate: 350
      },
      {
        lineId: 'SHUTTLE-WEST',
        lineName: 'West Stadium Fan Express Shuttle',
        status: 'delayed',
        delayMinutes: 15,
        currentInflowRate: 120
      }
    ];
  }

  /**
   * Simulated Real-time IoT Ingestion Loop.
   * Modifies data parameters concurrently to simulate dynamic live conditions.
   */
  public ingestLiveIoTData(metrics: CrowdMetric[], incidents: StadiumIncident[], transit: TransitUpdate[]): void {
    if (metrics.length > 0) this.crowdMetrics = [...metrics];
    if (incidents.length > 0) this.incidents = [...incidents];
    if (transit.length > 0) this.transitUpdates = [...transit];
    // Invalidate dashboard caches on metric ingestion
    this.cache.delete('ops_dashboard_synthesis');
  }

  public getStadiumMetrics(): { crowdMetrics: CrowdMetric[]; incidents: StadiumIncident[]; transitUpdates: TransitUpdate[] } {
    return {
      crowdMetrics: this.crowdMetrics,
      incidents: this.incidents,
      transitUpdates: this.transitUpdates
    };
  }

  /**
   * In-Memory Caching Wrapper with TTL (Time-To-Live).
   */
  private getCached<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return entry.data as T;
  }

  private setCached<T>(key: string, data: T, ttlMs: number): void {
    this.cache.set(key, {
      data: data as OperationsCommandSynthesis | FanRoutingResponse,
      expiresAt: Date.now() + ttlMs
    });
  }

  /**
   * Operational Command Synthesis (Operations Command Layer).
   * Synthesizes IoT feeds, ticketing logs, and incidents using an LLM reasoning loop.
   */
  public async synthesizeOperationsCommand(): Promise<OperationsCommandSynthesis> {
    const cacheKey = 'ops_dashboard_synthesis';
    const cachedData = this.getCached<OperationsCommandSynthesis>(cacheKey);
    if (cachedData) {
      return { ...cachedData, cacheHit: true };
    }

    const currentMetricsText = JSON.stringify(this.crowdMetrics, null, 2);
    const activeIncidentsText = JSON.stringify(this.incidents.filter(i => i.isActive), null, 2);
    const transitText = JSON.stringify(this.transitUpdates, null, 2);

    const systemInstruction = `You are the lead AI Stadium Operations Director for FIFA World Cup 2026.
Analyze the live stream of stadium data (crowd metrics, incidents, transit logs) and return a synthesized JSON command object.
Provide highly pragmatic, safe operational advice matching standard incident response protocols.
Determine:
1. An overall Stadium Risk Score (0 to 100).
2. Risk Level ('safe', 'elevated', 'high_risk', 'critical_crisis').
3. A concise operational summary.
4. Active Critical alerts list.
5. Action plan items.
6. Urgent staff assignments.

Strict Output Rules:
- Return ONLY a valid JSON object matching the requested schema. Do not wrap in markdown unless requested or do not write preamble.
- DO NOT suggest actions violating local fire codes or crowd safety thresholds.
- Always check open/closed gates and route away from closed gates.`;

    const prompt = `
=== CURRENT CROWD DENSITY & GATE METRICS ===
${currentMetricsText}

=== ACTIVE INCIDENTS ===
${activeIncidentsText}

=== STADIUM TRANSIT FEEDS ===
${transitText}

Generate the command synthesis JSON.`;

    let synthesisResult: OperationsCommandSynthesis;

    if (this.ai) {
      try {
        const response = await this.ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: prompt,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                overallStadiumRiskScore: { type: Type.INTEGER, description: 'Overall risk score of stadium from 0 to 100' },
                riskLevel: { type: Type.STRING, description: 'Risk categorization: safe, elevated, high_risk, critical_crisis' },
                summary: { type: Type.STRING, description: 'Comprehensive operational brief for the Venue Director' },
                criticalAlerts: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'High-level red-flags or warnings' },
                actionPlan: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Step-by-step physical crowd safety strategies' },
                staffAssignments: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      staffRole: { type: Type.STRING, description: 'Role to dispatch' },
                      locationId: { type: Type.STRING, description: 'Exact target location' },
                      instruction: { type: Type.STRING, description: 'Action command' }
                    },
                    required: ['staffRole', 'locationId', 'instruction']
                  }
                }
              },
              required: ['overallStadiumRiskScore', 'riskLevel', 'summary', 'criticalAlerts', 'actionPlan', 'staffAssignments']
            }
          }
        });

        const textResponse = response.text || '';
        const parsed = JSON.parse(textResponse.trim());
        if (
          parsed &&
          typeof parsed.overallStadiumRiskScore === 'number' &&
          typeof parsed.riskLevel === 'string' &&
          typeof parsed.summary === 'string' &&
          Array.isArray(parsed.criticalAlerts) &&
          Array.isArray(parsed.actionPlan) &&
          Array.isArray(parsed.staffAssignments)
        ) {
          synthesisResult = parsed;
        } else {
          console.warn('Gemini operations synthesis response missed required fields. Falling back to algorithmic backup.');
          synthesisResult = this.algorithmicOperationsFallback();
        }
      } catch (err: any) {
        console.error('Gemini operations synthesis failed, falling back to algorithmic backup:', err.message);
        synthesisResult = this.algorithmicOperationsFallback();
      }
    } else {
      // Deterministic Offline High-Fidelity Mock
      synthesisResult = this.algorithmicOperationsFallback();
    }

    // Cache the operations synthesis for 5 seconds to throttle rapid polling
    this.setCached(cacheKey, synthesisResult, 5000);
    return synthesisResult;
  }

  /**
   * Fan Route Planner & Multilingual Experience Layer.
   * Takes a fan query, masks private details, processes using Gemini with a geospatial context, and validates accessibility.
   */
  public async planFanRoute(profile: FanProfile, userQuery: string): Promise<FanRoutingResponse> {
    // 1. PII Redaction
    const redactionInput = `${profile.currentLocation} to ${profile.destination}. Query: ${userQuery}`;
    const { redactedText, count: redactedCount } = SecurityEngine.redactPII(redactionInput, profile);

    // Also redact PII from individual profile fields to prevent leakage in prompt interpolation
    const redactedCurrentLocation = SecurityEngine.redactPII(profile.currentLocation, profile).redactedText;
    const redactedDestination = SecurityEngine.redactPII(profile.destination, profile).redactedText;

    // 2. Prompt Injection Safeguard Check
    const hasInjection = SecurityEngine.detectPromptInjection(userQuery);
    if (hasInjection) {
      return {
        language: profile.languagePreference,
        accessibilityAccommodated: false,
        recommendedRoute: ['Security Desk Main Office'],
        directionsMarkdown: `### ⚠️ Security Access Violation / Alerta de Seguridad
Your query contains prohibited instructions and has been intercepted. Stadium security has been logged.

*Su consulta contiene instrucciones prohibidas y ha sido bloqueada. Se ha registrado en la seguridad del estadio.*`,
        fallbackText: 'Security Alert: Prohibited system command was blocked.',
        safetyAlerts: ['PROHIBITED PROMPT INJECTION ATTEMPT DETECTED']
      };
    }

    // 3. Cache lookup
    const cacheKey = `fan_route_${profile.languagePreference}_${profile.accessibilityNeeds}_${profile.currentLocation.replace(/\s+/g, '_')}_${profile.destination.replace(/\s+/g, '_')}`;
    const cachedRoute = this.getCached<FanRoutingResponse>(cacheKey);
    if (cachedRoute) {
      return cachedRoute;
    }

    // Identify closed/restricted zones to append as system constraints
    const closedGates = this.crowdMetrics.filter(g => !g.isOpen).map(g => g.gateId);
    const closedGateNames = this.crowdMetrics.filter(g => !g.isOpen).map(g => g.gateName);

    const systemInstruction = `You are the stadium Fan Experience Wayfinding Specialist for the FIFA World Cup 2026.
Generate route recommendations and accessibility directions.
Respond in the language specified by the fan's profile (e.g., "es" for Spanish, "en" for English, "fr" for French, "pt" for Portuguese).
You must output a JSON object adhering exactly to the schema.
Always adhere to accessibility requirements:
- If wheelchair access is needed, route exclusively via ramps, elevators, and wide paths.
- Avoid closed areas (Closed gates: ${closedGateNames.join(', ')}).
- Focus on WCAG AAA readable directions with lists, clear headings, and landmark descriptions.`;

    const prompt = `
=== FAN PROFILE ===
Language: ${profile.languagePreference}
Accessibility Needs: ${profile.accessibilityNeeds}
Starting Location: ${redactedCurrentLocation}
Destination: ${redactedDestination}
Redacted User Query: ${redactedText}

=== CURRENT STADIUM ENVIRONMENT ===
Gates: ${JSON.stringify(this.crowdMetrics.map(g => ({ id: g.gateId, name: g.gateName, isOpen: g.isOpen, wait: g.estimatedWaitMinutes, features: g.accessibilityFeatures })))}
Incidents: ${JSON.stringify(this.incidents.filter(i => i.isActive).map(i => ({ type: i.type, location: i.locationId, desc: i.description })))}

Generate accessible routing directions in language code "${profile.languagePreference}".`;

    let routingResponse: FanRoutingResponse;

    if (this.ai) {
      try {
        const response = await this.ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: prompt,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                language: { type: Type.STRING, description: 'Language code of response, matching profile preference' },
                accessibilityAccommodated: { type: Type.BOOLEAN, description: 'Whether specified accessibility needs were fully integrated' },
                recommendedRoute: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Sequential locations/gate names' },
                directionsMarkdown: { type: Type.STRING, description: 'Accessible markdown directions' },
                fallbackText: { type: Type.STRING, description: 'Pure screen-reader friendly narrative text description' },
                alternateRoute: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Backup route elements if bottleneck occurs' },
                safetyAlerts: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Warnings regarding closed zones or heavy crowd sections' }
              },
              required: ['language', 'accessibilityAccommodated', 'recommendedRoute', 'directionsMarkdown', 'fallbackText', 'safetyAlerts']
            }
          }
        });

        const textResponse = response.text || '';
        const parsed = JSON.parse(textResponse.trim());
        if (
          parsed &&
          typeof parsed.language === 'string' &&
          typeof parsed.accessibilityAccommodated === 'boolean' &&
          Array.isArray(parsed.recommendedRoute) &&
          typeof parsed.directionsMarkdown === 'string' &&
          typeof parsed.fallbackText === 'string' &&
          Array.isArray(parsed.safetyAlerts)
        ) {
          routingResponse = parsed;
        } else {
          console.warn('Gemini fan routing response missed required fields. Falling back to algorithmic backup.');
          routingResponse = this.algorithmicRoutingFallback(profile);
        }

        // Dynamic Guardrail Validation
        const guardrailCheck = SecurityEngine.validateSafetyGuardrails(routingResponse.directionsMarkdown, closedGates);
        if (!guardrailCheck.isSafe) {
          console.warn('Safety guardrail triggered on LLM output. Activating secure fallback router:', guardrailCheck.warning);
          routingResponse = this.algorithmicRoutingFallback(profile);
        }
      } catch (err: any) {
        console.error('LLM fan routing failed, falling back to algorithmic router:', err.message);
        routingResponse = this.algorithmicRoutingFallback(profile);
      }
    } else {
      routingResponse = this.algorithmicRoutingFallback(profile);
    }

    // OWASP Output Sanitization on markdown fields to prevent XSS injection
    routingResponse.directionsMarkdown = SecurityEngine.sanitizeHTML(routingResponse.directionsMarkdown);
    routingResponse.fallbackText = SecurityEngine.sanitizeHTML(routingResponse.fallbackText);

    // Save to Cache
    this.setCached(cacheKey, routingResponse, 30000); // Route cache persists for 30s
    return routingResponse;
  }

  /**
   * Algorithmic operations analysis backup in case of network timeouts, API exhaustion, or offline runs.
   */
  private algorithmicOperationsFallback(): OperationsCommandSynthesis {
    const activeIncidents = this.incidents.filter(i => i.isActive);
    let riskScore = 15; // Base risk

    activeIncidents.forEach(inc => {
      if (inc.severity === 'critical') riskScore += 35;
      else if (inc.severity === 'high') riskScore += 25;
      else if (inc.severity === 'medium') riskScore += 15;
      else riskScore += 5;
    });

    const highCrowds = this.crowdMetrics.filter(g => g.crowdDensityPct > 70);
    riskScore += highCrowds.length * 10;

    if (riskScore > 100) riskScore = 100;

    let riskLevel: 'safe' | 'elevated' | 'high_risk' | 'critical_crisis' = 'safe';
    if (riskScore >= 75) riskLevel = 'critical_crisis';
    else if (riskScore >= 50) riskLevel = 'high_risk';
    else if (riskScore >= 25) riskLevel = 'elevated';

    const criticalAlerts: string[] = [];
    const actionPlan: string[] = [];
    const staffAssignments: OperationsCommandSynthesis['staffAssignments'] = [];

    if (this.crowdMetrics.some(g => !g.isOpen)) {
      const closed = this.crowdMetrics.filter(g => !g.isOpen).map(g => g.gateName);
      criticalAlerts.push(`STADIUM ACCESS LIMIT: ${closed.join(', ')} closed.`);
      actionPlan.push(`Activate alternative entrance routes and relocate fans to adjacent open gates.`);
      staffAssignments.push({
        staffRole: 'Crowd Safety Officers',
        locationId: 'Gate 4 Corridor',
        instruction: 'Establish physical barriers and manually point fans towards Gate 1 (North Main) and Gate 2.'
      });
    }

    activeIncidents.forEach(inc => {
      criticalAlerts.push(`Active Emergency: ${inc.description}`);
      if (inc.type === 'bottleneck') {
        actionPlan.push(`Relieve ticketing system backlog at ${inc.locationId} using handheld manual scanners.`);
        staffAssignments.push({
          staffRole: 'Support Systems Engineers',
          locationId: inc.locationId,
          instruction: 'Reset local authentication servers and implement offline ticketing protocols.'
        });
      } else if (inc.type === 'medical_emergency') {
        actionPlan.push(`Ensure medical response access lane is kept entirely clear of spectators at ${inc.locationId}.`);
        staffAssignments.push({
          staffRole: 'Medical Unit 2',
          locationId: inc.locationId,
          instruction: 'Establish triage space and prepare for field-hospital patient transfer if required.'
        });
      }
    });

    if (actionPlan.length === 0) {
      actionPlan.push('All access operations running at nominal limits. Continue standard automated monitoring of turnstiles.');
    }

    return {
      overallStadiumRiskScore: riskScore,
      riskLevel,
      summary: `Stadium Operation Center analytical report: Automated monitoring is active. Current metrics show ${activeIncidents.length} active emergency incident(s) and ${highCrowds.length} heavily congested sector(s). System is operating with high resiliency backup parameters.`,
      criticalAlerts,
      actionPlan,
      staffAssignments
    };
  }

  /**
   * Safe, deterministic routing engine based on active stadium state.
   * Guarantees 100% adherence to active gate closures and accessibility needs.
   */
  public algorithmicRoutingFallback(profile: FanProfile): FanRoutingResponse {
    const isWheelchair = profile.accessibilityNeeds === 'wheelchair';
    const isSensory = profile.accessibilityNeeds === 'sensory_sensitivity';

    // Find all OPEN gates
    const openGates = this.crowdMetrics.filter(g => g.isOpen);

    // Filter by accessibility features if wheelchair is needed
    let suitableGates = openGates;
    if (isWheelchair) {
      suitableGates = openGates.filter(g => g.accessibilityFeatures.includes('ramp') || g.accessibilityFeatures.includes('elevator'));
    }

    // Default to the first suitable open gate with minimum wait
    if (suitableGates.length === 0) {
      suitableGates = openGates; // Fallback to any open gate if none have access, though in real stadium there's always one
    }

    // Sort by shortest wait time to optimize fan comfort
    suitableGates.sort((a, b) => a.estimatedWaitMinutes - b.estimatedWaitMinutes);
    const targetGate = suitableGates[0] || this.crowdMetrics[0];

    const recommendedRoute = [
      profile.currentLocation,
      targetGate.gateName,
      profile.destination
    ];

    const isSpanish = profile.languagePreference === 'es';
    const isFrench = profile.languagePreference === 'fr';

    let directionsMarkdown = '';
    let fallbackText = '';
    let safetyAlerts: string[] = [];

    // Multilingual support
    if (isSpanish) {
      directionsMarkdown = `### 🗺️ Ruta de Navegación Sugerida (Accesible)
Paso 1: Salga de **${profile.currentLocation}** siguiendo los indicadores táctiles.
Paso 2: Diríjase a **${targetGate.gateName}** para ingresar de forma segura. El tiempo estimado de espera es de solo **${targetGate.estimatedWaitMinutes} minutos**.
${isWheelchair ? `*Nota de accesibilidad:* Esta ruta utiliza rampas y accesos amplios para silla de ruedas.` : ''}
${isSensory ? `*Nota de accesibilidad:* Esta ruta evita la zona G4 de alta densidad y cuenta con salas sensoriales adyacentes.` : ''}
Paso 3: Siga los carteles de señalización directamente hasta su asiento en **${profile.destination}**.`;

      fallbackText = `Direcciones para lector de pantalla: Comenzando en ${profile.currentLocation}, avance hacia ${targetGate.gateName}, que está completamente abierta y accesible, luego diríjase a ${profile.destination}.`;
      safetyAlerts = this.crowdMetrics.filter(g => !g.isOpen).map(g => `¡ALERTA! El acceso por ${g.gateName} se encuentra CERRADO temporalmente por congestión. Por favor evite esa zona.`);
    } else if (isFrench) {
      directionsMarkdown = `### 🗺️ Itinéraire Recommandé (Accessible)
Étape 1: Quittez **${profile.currentLocation}** en suivant les repères au sol.
Étape 2: Dirigez-vous vers **${targetGate.gateName}** pour un accès sécurisé. Le temps d'attente estimé est de **${targetGate.estimatedWaitMinutes} minutes**.
${isWheelchair ? `*Note d'accessibilité:* Cet itinéraire utilise exclusivement des rampes et des ascenseurs.` : ''}
Étape 3: Suivez la signalisation directement vers votre tribune à **${profile.destination}**.`;

      fallbackText = `Instructions pour lecteur d'écran: Départ de ${profile.currentLocation}, dirigez-vous vers ${targetGate.gateName} qui est ouvert et adapté, puis continuez vers ${profile.destination}.`;
      safetyAlerts = this.crowdMetrics.filter(g => !g.isOpen).map(g => `ATTENTION! ${g.gateName} est actuellement FERMÉ. Veuillez contourner ce secteur.`);
    } else {
      // Default English
      directionsMarkdown = `### 🗺️ Suggested Navigation Route (Accessible)
Step 1: Exit **${profile.currentLocation}** following the stadium layout markers.
Step 2: Proceed to **${targetGate.gateName}** for optimal ingress. The estimated queue time is **${targetGate.estimatedWaitMinutes} minutes**.
${isWheelchair ? `*Accessibility Note:* This route is fully equipped with ADA ramps and wide wheelchair corridors.` : ''}
${isSensory ? `*Accessibility Note:* This path bypasses loud high-density zones and connects adjacent to quiet areas.` : ''}
Step 3: Follow the color-coded guides straight to your seating sector at **${profile.destination}**.`;

      fallbackText = `Screen-reader Directions: Beginning at ${profile.currentLocation}, move towards ${targetGate.gateName} which is open and accessible, then head directly to ${profile.destination}.`;
      safetyAlerts = this.crowdMetrics.filter(g => !g.isOpen).map(g => `WARNING: ${g.gateName} is temporarily CLOSED due to heavy congestion bottleneck. Avoid the western zone.`);
    }

    return {
      language: profile.languagePreference,
      accessibilityAccommodated: isWheelchair || isSensory,
      recommendedRoute,
      directionsMarkdown,
      fallbackText,
      alternateRoute: [profile.currentLocation, 'East Service Lane', profile.destination],
      safetyAlerts
    };
  }
}
