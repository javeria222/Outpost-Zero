# OUTPOST ZERO — Tasks and Progress Tracker

**Status:** Phase 1 — Stabilize & State Initialization  
**Last Updated:** 2026-11-14 19:46:00 UTC+5  
**Authoritative Source:** `OUTPOST_ZERO_SPEC.md` (Sections 16–22) & `AUDIT.md`  

---

## P0 Blockers

- [x] `T-001` [P0] **Restore World component in `src/App.tsx` from git history**  
  *Evidence:* Recovered `World` definition from `git show a7150be^:src/App.tsx`, wired lighting, terrain, rocks, astronaut/camera, placed buildings, and BuildMode. `npm run build` and `npm run lint` pass with 0 errors.
- [x] `T-002` [P0] **Clean up React Compiler and linter warnings in `BuildMode.tsx` and `App.tsx`**  
  *Evidence:* Removed direct `setState` inside effect body in `BuildMode.tsx`, moved `tabIndex` and `outline` attributes to `<Canvas>` JSX, eliminated all 12 oxlint warnings. `oxlint` returns 0 warnings and 0 errors.
- [ ] `T-003` [P0] **Fortify player controller and pointer-lock exit lifecycle**  
  *Acceptance Criteria:* All three scenarios fully fixed and manually verified:
  1. Hold arrow key → press ESC → astronaut stops immediately (no stuck movement).
  2. Hold arrow key → Alt+Tab (window blur) → astronaut stops immediately on return.
  3. Hold arrow key → switch tabs (visibilitychange) → astronaut stops immediately.
  *Implementation notes:* `clearKeys()` must also call `document.exitPointerLock()` when the pointer is currently locked. The `pointerlockchange` DOM event must also trigger `clearKeys()` so releasing pointer lock via any mechanism (browser UI, OS shortcut, ESC) resets movement state. When `buildMode` becomes true, exit pointer lock and clear keys before the listeners re-register.
  **Do NOT tick until all three scenarios are manually verified at runtime.**

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
  *Acceptance Criteria:* Alerts generated from authoritative state transitions only (`info`, `warning` at <25%, `critical` at 0). Alerts explain cause in plain language (e.g., "Brownout: Solar generation insufficient for active base"). **Dust Storm (scripted sol-8 event in `advanceSol`) must be removed from MVP alert flow — it fires on a hardcoded sol index with no relation to actual state and is incompatible with the 5-SOL mission. It is superseded by S1 (T-025) as a state-driven stretch feature.** The prototype's `WATER LEAK` (sol 15) and `GRID FAULT` (sol 22) scripted events also do not apply to the 5-SOL mission and must not fire in the new simulation loop.
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

- [ ] `T-025` [P3] **S1: Dust Storm dynamic environmental event** *(Stretch goal — do NOT implement until M1–M11 complete)*  
  *Acceptance Criteria:* On Sol 3, solar output halves for 1 SOL with visual atmospheric dust effect. Must be **state-driven** (a `dustStormActive: boolean` field in `ColonyState` that `simulateTick` reads) — NOT a hardcoded sol-index check. Reclassified from MVP alert to stretch goal 2026-11-14.
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

- [x] `B-001` [P0] **`World` component missing in `src/App.tsx`** — Fixed in T-001 (`a3a5260`).
- [x] `B-004` [P2] **React compiler hook warnings in `BuildMode.tsx`** — Fixed in T-002 (`a3a5260`).

- [ ] `B-002` [P0] **Stuck keys on pointer-lock release — runtime-verified regression**  
  *Repro steps:*  
  1. Load app, click canvas to acquire pointer lock.  
  2. Hold any arrow key (e.g. ↑) — astronaut moves forward.  
  3. Press ESC to release pointer lock.  
  4. **Observed:** Astronaut continues moving indefinitely (stuck key).  
  *Also broken for:*  
  - Alt+Tab / window blur: hold key → switch away → switch back → astronaut still moving.  
  - Tab visibility change: hold key → switch browser tabs → return → astronaut still moving.  
  *Root cause (identified 2026-11-14):* `clearKeys` fires on `blur` and `visibilitychange` and zeroes `keys.current`, but it does NOT listen to the `pointerlockchange` event. When ESC releases pointer lock, no event fires that calls `clearKeys`. The `keyup` for the held key is consumed by the browser during the ESC transition and never reaches the app.  
  *Fix required (T-003):* Add `document.addEventListener('pointerlockchange', clearKeys)` and `document.addEventListener('pointerlockerror', clearKeys)` inside the `useEffect`. Also exit pointer lock in `clearKeys` when `document.pointerLockElement === canvas`, and ensure buildMode transition clears keys before re-registering listeners.  
  **Do NOT tick T-003 until all three scenarios above are manually verified.**

- [ ] `B-003` [P1] **Prototype resource mismatch** — Prototype `advanceSol()` uses Credits and Water; spec uses Oxygen/Energy/Food/Materials. The new Zustand store (T-004) uses the correct spec resources. The prototype `colonySimulation.ts` is superseded but kept in-tree for reference until T-004 is complete.

- [ ] `B-005` [P1] **Prototype dust-storm alert is hardcoded to Sol 8 and incompatible with 5-SOL mission**  
  *Source:* `src/game/colonySimulation.ts:229` — `if (nextSol === 8) { next.event = "DUST STORM"; ... }`.  
  *Impact:* Sol 8 never fires in the 5-SOL mission; the event would never show. Additionally, `WATER LEAK` (Sol 15) and `GRID FAULT` (Sol 22) also cannot fire.  
  *Resolution:* All three scripted-sol events must be **excluded** from the new `simulateTick`. Dust Storm is reclassified as S1 stretch goal (T-025) and will be state-driven when implemented. Water Leak and Grid Fault are deprecated entirely from MVP scope.

---

## Decisions Log

1. **2026-11-14:** Confirmed alignment of economy with Spec Sections 17 & 18 (Oxygen, Energy, Food, Materials). Materials are the sole construction currency; Credits and Water are deprecated.
2. **2026-11-14:** Recover `World` component directly from git history (`git show a7150be^:src/App.tsx`) and adapt to connect with `BuildMode` and placed structures.
3. **2026-11-14:** Keep manual "Skip SOL" button as a hidden dev tool only, toggled via the 'K' key. Visible user UI follows autonomous 45s/SOL accumulator with 1x/3x/pause.
4. **2026-11-14:** Use existing `zustand` dependency for single authoritative store with narrow selectors to protect Three.js Canvas render loop from tick overhead.
5. **2026-11-14:** Map 7 existing procedural meshes in `BuildMode.tsx` to the 6 catalogue structures (HAB-01, HAB-02, Solar Farm, Comms Tower, Oxygen Generator, Greenhouse); keep unused meshes safely in code but hidden from the build menu.
6. **2026-11-14:** Dust Storm reclassified from MVP alert to **S1 stretch goal** (T-025). It must be state-driven when implemented, NOT a hardcoded sol-index check. The prototype's Sol-8 dust storm, Sol-15 water leak, and Sol-22 grid fault scripted events are excluded from the new `simulateTick` entirely.
7. **2026-11-14:** T-013 alert system must NOT port the prototype's hardcoded environmental events. All alerts derive from live resource state only (thresholds, brownout, failure conditions).
