# OUTPOST ZERO — Tasks and Progress Tracker

**Status:** Phase 1 — Stabilize & State Initialization  
**Last Updated:** 2026-11-14 19:05:00 UTC+5  
**Authoritative Source:** `OUTPOST_ZERO_SPEC.md` (Sections 16–22) & `AUDIT.md`  

---

## P0 Blockers

- [x] `T-001` [P0] **Restore World component in `src/App.tsx` from git history**  
  *Evidence:* Recovered `World` definition from `git show a7150be^:src/App.tsx`, wired lighting, terrain, rocks, astronaut/camera, placed buildings, and BuildMode. `npm run build` and `npm run lint` pass with 0 errors.
- [x] `T-002` [P0] **Clean up React Compiler and linter warnings in `BuildMode.tsx` and `App.tsx`**  
  *Evidence:* Removed direct `setState` inside effect body in `BuildMode.tsx`, moved `tabIndex` and `outline` attributes to `<Canvas>` JSX, eliminated all 12 oxlint warnings. `oxlint` returns 0 warnings and 0 errors.
- [ ] `T-003` [P0] **Fortify player controller and pointer-lock exit lifecycle**  
  *Acceptance Criteria:* Entering and exiting pointer lock (or switching focus/tabs/ESC) properly resets active keyboard movement map (`keys.current`) so astronaut never moves on stuck keys. World boundary clamps (-80 to 80).

---

## Core Simulation

- [ ] `T-004` [P0] **Consolidate single authoritative colony store (`useColonyStore`)**  
  *Acceptance Criteria:* Single Zustand store owning `ColonyState` (`sol`, `elapsedSeconds`, `resources: { oxygen, energy, food, materials }`, `structures`, `alerts`, `simulationStatus`, `speed`). Narrow selectors prevent full 3D scene re-renders on tick.
- [ ] `T-005` [P1] **Implement pure, immutable `simulateTick(state, dt)` function**  
  *Acceptance Criteria:* Pure function `(state, dt) => ColonyState`. Fixed 1-second simulation step with accumulator, delta clamped to max 0.25s per frame. 1 SOL = 45 real seconds at 1x speed.
- [ ] `T-006` [P1] **Support simulation controls: Pause, 1x, 3x, and hidden Dev 'K' Skip-SOL tool**  
  *Acceptance Criteria:* UI provides Pause, 1x, and 3x buttons. Simulation freezes during menus or when tab is hidden. Pressing 'K' toggles dev button to advance 1 SOL for rapid testing.
- [ ] `T-007` [P1] **Implement brownout, failure, and victory rules (Section 17.3)**  
  *Acceptance Criteria:* Energy reaching 0 triggers brownout (deactivates non-solar structures); oxygen at 0 for 1 SOL causes failure; food at 0 for 2 SOL causes failure; reaching Sol 6 with capacity >= 4, active comms, and no 0 resource triggers victory.
- [ ] `T-008` [P1] **Set up Vitest and add unit tests for simulation engine**  
  *Acceptance Criteria:* Automated test suite passing `simulateTick` calculations, determinism (same result at 30 vs 144 FPS accumulator), clamp on tab hide, brownout, and failure triggers.

---

## Construction

- [ ] `T-009` [P1] **Data-driven structure catalogue with 6 structures (Section 18.2)**  
  *Acceptance Criteria:* Catalogue includes `hab_01` (150 mat), `hab_02` (250 mat), `solar_farm` (100 mat), `comms_tower` (80 mat), `oxygen_generator` (150 mat), and `greenhouse` (200 mat). Map existing 7 procedural meshes to these 6; hide extra mesh types cleanly.
- [ ] `T-010` [P1] **Implement Section 6.2 construction lifecycle and safeguards**  
  *Acceptance Criteria:* IDLE -> SELECT -> PREVIEW -> VALIDATE -> COMMIT -> IDLE. Re-validate affordability and overlap at commit time. Costs deducted exactly once. Stable unique instance IDs. Double-click safety. Cancel returns to IDLE without side effects.
- [ ] `T-011` [P1] **Add unit tests for construction rules and validation**  
  *Acceptance Criteria:* Tests verify affordability checks, invalid placement rejection, double-click protection, and exact materials deductions.

---

## Integration (HUD and Alerts)

- [ ] `T-012` [P1] **Live resource HUD with stock and production/consumption deltas**  
  *Acceptance Criteria:* Topbar displays current SOL (01-05), speed, and pause state. Left panel displays live Oxygen, Energy, Food, Materials stocks plus net delta (+/- per SOL) and crew consumption. All values labeled as simulation abstractions.
- [ ] `T-013` [P1] **Structured alert system with stable IDs, severity, and plain-language reasons**  
  *Acceptance Criteria:* Alerts generated from authoritative state transitions (`info`, `warning` at <25%, `critical` at 0). Alerts explain cause (e.g., "Brownout: Solar generation insufficient for active base").
- [ ] `T-014` [P1] **Decouple 3D scene re-renders from simulation tick**  
  *Acceptance Criteria:* Canvas scene consumes only placed structure list and build mode props; HUD components subscribe to resource ticks via narrow selectors. Measure 60+ FPS stability.

---

## Trainer Layer (Junior Astronaut Guided Mission — Section 19)

- [ ] `T-015` [P1] **Implement 8-objective guided mission controller**  
  *Acceptance Criteria:* Auto-evaluates state triggers for:  
  1. Open build menu  
  2. Build a Solar Farm  
  3. Build HAB-01  
  4. Build an Oxygen Generator  
  5. Build a Greenhouse  
  6. Build second Solar Farm (net energy >= 0)  
  7. Build Communications Tower  
  8. Survive until SOL 6 (Victory)
- [ ] `T-016` [P1] **Display "Why this matters" educational rationale and 20s idle hints**  
  *Acceptance Criteria:* Each objective displays a 1–2 sentence pedagogical explanation. If player remains on an objective for >20s without progress, display an actionable hint.
- [ ] `T-017` [P1] **Mission Debrief end-screen (Victory / Defeat) and complete Reset**  
  *Acceptance Criteria:* End modal displays final outcome, Sol survived, alert history recap, and "Retry" button that completely resets state, objectives, and placed 3D meshes.
- [ ] `T-018` [P1] **Pause menu and controls help overlay**  
  *Acceptance Criteria:* Accessible via ESC or UI button. Shows movement, camera, building, and simulation controls. Pauses the simulation while active.

---

## Polish and Performance

- [ ] `T-019` [P2] **Visual and audio placement feedback cues**  
  *Acceptance Criteria:* Visual confirmation flash/ring on successful placement; clear red shake/rejection toast on invalid placement or lack of materials.
- [ ] `T-020` [P2] **Initial loading screen and asset fallback**  
  *Acceptance Criteria:* Clean loading indicator while Three.js scene initializes; graceful fallbacks if WebGL context initializes slowly.
- [ ] `T-021` [P2] **Performance verification and FPS benchmark**  
  *Acceptance Criteria:* Measure FPS before and after integration. Ensure >= 30 FPS on integrated graphics and 60 FPS on dedicated GPU.

---

## Release and Submission (Section 21 Checklist)

- [ ] `T-022` [P1] **Production build verification**  
  *Acceptance Criteria:* `npm run build` generates optimized `dist/` bundle with no TypeScript or asset errors.
- [ ] `T-023` [P2] **Comprehensive README documentation**  
  *Acceptance Criteria:* Documents project overview, mission trainer context, controls, technical architecture, how to run, and team credits.
- [ ] `T-024` [P2] **Verify Section 22 acceptance tests and Section 10.3 manual checklist**  
  *Acceptance Criteria:* All 8 MVP tests in Section 22 and 11 end-to-end tests in Section 10.3 pass and are logged.

---

## Stretch Goals (S1–S6)

- [ ] `T-025` [P3] **S1: Dust Storm dynamic environmental event**  
  *Acceptance Criteria:* On Sol 3, solar output halves for 1 SOL with visual atmospheric dust effect.
- [ ] `T-026` [P3] **S2: Radiation protection indicator**  
  *Acceptance Criteria:* Displays habitat shielding status based on placed structures.
- [ ] `T-027` [P3] **S3: Structure demolition / 50% refund**  
  *Acceptance Criteria:* Allows refunding structures in build mode for 50% materials.
- [ ] `T-028` [P3] **S4: LocalStorage session persistence**  
  *Acceptance Criteria:* Option to resume saved colony state within browser session.
- [ ] `T-029` [P3] **S5: Minimap / grid visual helper**  
  *Acceptance Criteria:* Top-down radar or ground placement grid projected on terrain.
- [ ] `T-030` [P3] **S6: NASA-sourced fact cards**  
  *Acceptance Criteria:* Fact popups on space architecture linked to NASA public resources.

---

## Bugs and Findings

- [ ] `B-001` [P0] **`World` component missing in `src/App.tsx`** (Identified in AUDIT.md; blocks compilation and execution).
- [ ] `B-002` [P1] **Stuck keys on pointer-lock release** (Keys remain active if released outside canvas or on blur).
- [ ] `B-003` [P1] **Prototype resource mismatch** (Code uses Credits and Water; Spec uses Oxygen, Energy, Food, Materials).
- [ ] `B-004` [P2] **React compiler hook warnings in `BuildMode.tsx`** (`setPosition` inside effect).

---

## Decisions Log

1. **2026-11-14:** Confirmed alignment of economy with Spec Sections 17 & 18 (Oxygen, Energy, Food, Materials). Materials are the sole construction currency; Credits and Water are deprecated.
2. **2026-11-14:** Recover `World` component directly from git history (`git show a7150be^:src/App.tsx`) and adapt to connect with `BuildMode` and placed structures.
3. **2026-11-14:** Keep manual "Skip SOL" button as a hidden dev tool only, toggled via the 'K' key. Visible user UI follows autonomous 45s/SOL accumulator with 1x/3x/pause.
4. **2026-11-14:** Use existing `zustand` dependency for single authoritative store with narrow selectors to protect Three.js Canvas render loop from tick overhead.
5. **2026-11-14:** Map 7 existing procedural meshes in `BuildMode.tsx` to the 6 catalogue structures (HAB-01, HAB-02, Solar Farm, Comms Tower, Oxygen Generator, Greenhouse); keep unused meshes safely in code but hidden from the build menu.
