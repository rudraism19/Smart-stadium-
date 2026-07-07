# FIFA World Cup 2026™ Smart Stadium Command Platform

A professional, high-performance, real-time command-and-control dashboard for managing crowd logistics, transit flow, and safety incident response at the **Aztec Stadium (STADIUM-AZTEC-04)** for the FIFA World Cup 2026™.

This full-stack platform leverages server-side GenAI Orchestration, multi-modal sensor telemetry, PII masking guardrails, dynamic accessibility-focused routing, and automated DevSecOps health compliance audits.

---

## 🎨 Visual Design: "Technical Dashboard / Data Grid" Theme

The user interface implements a meticulous, tactical grid theme inspired by elite cyber-security command rooms and industrial avionics deck displays:

- **Monochromatic Matte Palette**: A deep slate and carbon foundation (`#0A0A0A` and `#141414`) with strict contrast boundaries using sharp gray divisions (`#333`).
- **Tactical Neon Color System**: Precise neon statuses representing stream health (emerald-green operational loops, warm orange warning alerts, and cyan/blue active filters).
- **Engineering Typography pairing**: Standard body components paired with monospaced display typography (**JetBrains Mono**) for critical telemetry parameters, timestamps, and log streams.
- **Micro-interactions & Glows**: Active map sensor endpoints render key glows, pulse nodes, and fluid ping loops to attract operator attention during traffic anomalies (e.g., Gate 4 bottleneck).
- **No Over-decoration (No AI Slop)**: The platform features clean, human-scannable metrics and interactive tools with high signal-to-noise ratios.

---

## 🚀 Key Capabilities

### 1. Interactive Aztec Stadium Visual Mesh
- **Real-Time Map**: Dynamic visual outline representing the Aztec Stadium seating rings, outer perimeters, and a center pitch.
- **Dynamic Sensor Endpoints**: Gate monitors (G1, G2, G3, G4) display localized crowd pressures, lock states, and latency queues. Clicking any node instantly updates the **HUD telemetry panel**.
- **Visual Alert Overlays**: Automated flashing emergency triggers highlighting specific sectors during blockades.

### 2. Live IoT Gate Telemetry Stream
- **Density Tracking**: Dynamic crowd densities, throughput rates per minute, and estimated wait times.
- **Accessibility Integration**: Real-time listing of active accessibility options (Tactile Paths, Wheelchair Ramps, Braille Signage, Audio Assist).
- **Transit Infrastructure**: Live feeds monitoring feeder light rail lines, bus corridors, and parking queues.

### 3. GenAI Command Center Synthesis
- **Dynamic Scenario Reasoner**: Leverages server-side LLM processing to analyze active gate metrics and output real-time stadium risk indexing (0-100), crisis categorizations, and operator briefs.
- **Threat Mitigation Planner**: Formulates prioritized emergency action points based on current bottlenecks.
- **Command Dispatches**: Automated dispatch generation assigning specific instructions to localized field agents.

### 4. Fan Experience Wayfinder Simulator
- **Multi-lingual Contextual Translations**: Allows operators to query waypoints on behalf of fans in English, Spanish, French, or Portuguese.
- **PII Redaction Guardrail**: Exhibits local masking models that redact sensitive details (Names, Phone Numbers, Emails) to protect spectator privacy.
- **WCAG 2.2 AAA Compliance**: Includes a screen reader narrative preview specifically built for accessibility feedback.

### 5. DevSecOps Test Runner
- **Automated Verification**: Integrated test suite directly executable from the browser.
- **Targeted Audits**: Audits PII regex sanitization, path security overrides, and system compliance, printing output logs directly into a tactical terminal simulator.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: React 18 with Vite, styled with Tailwind CSS utility frameworks.
- **Backend**: Express.js server running in a Node environment with bundled CommonJS outputs.
- **Iconography**: Clean, professional vector indicators imported from `lucide-react`.
- **Packaging/Bundling**: Fast, reliable transpiling utilizing `esbuild` and `tsx` for high-availability production deploys.

---

## 📦 Local Installation & Development

To spin up the platform locally:

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Boot Development Server**:
   ```bash
   npm run dev
   ```
   *The development server will mount on local port `3000`.*

3. **Build Compiled Production Pack**:
   ```bash
   npm run build
   ```

4. **Launch Production Container**:
   ```bash
   npm start
   ```

---
*FWC Aztec Operations Command System v2.6.4-prod // Secure, Multi-Cloud Orchestrated.*
