/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Supported severity levels for operational incidents.
 */
export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';

/**
 * Types of stadium incidents that require operational routing and staff alerting.
 */
export type IncidentType = 'bottleneck' | 'gate_closure' | 'transit_delay' | 'medical_emergency' | 'security_alert' | 'weather_hazard';

/**
 * Metric data for stadium gate and crowd monitoring (IoT Feed logs).
 */
export interface CrowdMetric {
  gateId: string;
  gateName: string;
  crowdDensityPct: number; // 0 - 100
  estimatedWaitMinutes: number;
  throughputPerMinute: number;
  isOpen: boolean;
  accessibilityFeatures: string[]; // e.g. "ramp", "elevator", "sensory_booth"
  locationCoordinates: { x: number; y: number };
}

/**
 * Operational incident model for tracking stadium emergencies and crowd issues.
 */
export interface StadiumIncident {
  id: string;
  type: IncidentType;
  severity: SeverityLevel;
  locationId: string; // e.g., "Gate 4", "Section 102"
  description: string;
  timestamp: string; // ISO-8601
  isActive: boolean;
  resolutionPlan?: string;
}

/**
 * Transit status updates surrounding the venue.
 */
export interface TransitUpdate {
  lineId: string;
  lineName: string; // e.g., "Metro Line A", "Bus Shuttle 4"
  status: 'operational' | 'delayed' | 'suspended';
  delayMinutes: number;
  currentInflowRate: number; // fans arriving per min
}

/**
 * Stadium Fan Profile representing language, accessibility needs, and location.
 */
export interface FanProfile {
  id: string;
  name: string; // Will be masked for PII security
  email: string; // Will be masked for PII security
  phone: string; // Will be masked for PII security
  languagePreference: string; // e.g., "en", "es", "fr", "pt", "ar"
  accessibilityNeeds: 'none' | 'wheelchair' | 'sensory_sensitivity';
  currentLocation: string; // e.g., "Metro Station North"
  destination: string; // e.g., "Seat Section 204"
}

/**
 * Security audit telemetry details.
 */
export interface SecurityAudit {
  originalPayloadLength: number;
  piiRedactedCount: number;
  promptInjectionDetected: boolean;
  isSanitized: boolean;
  timestamp: string;
}

/**
 * LLM routing decision output for fan experience.
 */
export interface FanRoutingResponse {
  language: string; // Target translation language code (e.g. "es")
  accessibilityAccommodated: boolean;
  recommendedRoute: string[];
  directionsMarkdown: string; // Output in rich markdown with WCAG accessibility tags
  fallbackText: string; // Screen-reader specific text object
  alternateRoute?: string[];
  safetyAlerts: string[];
}

/**
 * Operational Command Layer synthesis response.
 */
export interface OperationsCommandSynthesis {
  overallStadiumRiskScore: number; // 0 - 100
  riskLevel: 'safe' | 'elevated' | 'high_risk' | 'critical_crisis';
  summary: string;
  criticalAlerts: string[];
  actionPlan: string[];
  staffAssignments: Array<{ staffRole: string; locationId: string; instruction: string }>;
  cacheHit?: boolean;
}

/**
 * Cache payload wrapper for high-throughput optimizations.
 */
export interface CacheEntry<T> {
  data: T;
  expiresAt: number; // Epoch timestamp
}
