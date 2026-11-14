# OUTPOST ZERO — Technical Baseline Audit

**Date:** 2026-11-14  
**Project:** OUTPOST ZERO (NASA Space Apps Challenge — Track: "Build a Junior Astronaut Mission Trainer")  
**Stack:** React 19.3.1, TypeScript 6.0.3, Vite 8.3.4, Three.js 0.186.1, @react-three/fiber 9.8.2, @react-three/drei 10.7.9, Zustand 5.0.16, Tailwind CSS 4.3.3  
**Commit Baseline:** `a7150be` ("Add AstraX game implementation") following `30e961b` ("Initial commit: OUTPOST ZERO")  

---

## 1. Repository Tree (Excluding `node_modules` / `dist`)

```
AstraX/
├── .gitignore
├── .oxlintrc.json
├── index.html
├── OUTPOST_ZERO_SPEC.md
├── package.json
├── package-lock.json
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── README.md
├── src/
│   ├── App.css
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   ├── assets/
│   │   ├── hero.png
│   │   ├── react.svg
│   │   └── vite.svg
│   └── game/
│       ├── BuildMode.tsx
│       └── colonySimulation.ts
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

---

## 2. Architecture and Data Flow

```
+---------------------------------------------------------------------------------------+
|                                      USER INPUT                                       |
|   WASD / Arrows / Shift / Space (Movement)  |  Mouse Pointer Lock (Pitch/Yaw)         |
|   UI Button / Dropdown (Build Mode / Next Sol)  |  R (Rotate) / Click (Place)         |
+---------------------------------------------------------------------------------------+
                                            |
                                            v
+---------------------------------------------------------------------------------------+
|                            APP COMPONENT (src/App.tsx)                                |
|  - Holds local React state: colony (ColonyState), buildMode (bool), selectedBuilding   |
|  - Dispatches constructBuilding() and advanceSol() to colonySimulation.ts             |
+---------------------------------------------------------------------------------------+
                      |                                       |
                      v                                       v
+-----------------------------------+   +-----------------------------------------------+
|     BUILD MODE (BuildMode.tsx)    |   |               HUD / UI OVERLAYS               |
|  - Raycasts ground plane (y=0)    |   |  - Topbar: Sol count, mission tag             |
|  - Snaps to grid (GRID = 2)       |   |  - Left Panel: Resources & 3 static goals     |
|  - Validates bounds & overlap     |   |  - Right Panel: System status & build menu    |
|  - Renders Ghost / Placed Meshes  |   |  - Bottom Bar: Control key legends            |
+-----------------------------------+   +-----------------------------------------------+
                      |
                      v
+---------------------------------------------------------------------------------------+
|                           THREE.JS CANVAS / WORLD SCENE                               |
|  - Intended: Stars, Lighting, Terrain, Rocks, FollowCamera, Astronaut, Placed Meshes  |
|  - CRITICAL DEFECT: <World> invocation rendered at App.tsx:560 is UNDEFINED in scope!|
+---------------------------------------------------------------------------------------+
```

---

## 3. Verified Feature Matrix

| Feature | Status | Source Location | Evidence / Runtime Observation | Notes & Defect Summary |
|---|---|---|---|---|
| **Build & Typecheck** | **Broken** | `src/App.tsx:560`, `tsconfig.app.json` | `npm run build` fails with `TS2304: Cannot find name 'World'` + 8 `TS6133` unused locals | Accidental deletion of `function World` during commit `a7150be`. Blocks compilation. |
| **Linting** | **Broken** | `src/App.tsx`, `src/game/BuildMode.tsx` | `npm run lint` yields 12 warnings (`World is not defined`, unused imports/functions, hook state warnings) | Oxlint passes with exit 0 but flags critical runtime undeclared identifier. |
| **Scene & World Rendering** | **Broken** | `src/App.tsx:560` | Dev server runs, but browser execution throws `ReferenceError: World is not defined` | Blank screen at runtime; 3D scene cannot mount until `World` component is restored. |
| **Player Controller / Movement** | **Partial** | `src/App.tsx:304-524` (`FollowCamera`) | Code has WASD, sprinting, jump, camera lerp, and 'E' jetpack flight | Pointer-lock and keyboard listeners lack complete edge-case cleanup; unused due to missing `World`. |
| **Build Mode Interaction** | **Partial** | `src/game/BuildMode.tsx` | Raycasting, grid snap (2m), collision radius (3.5m), rotation ('R'), ghost ring (green/red) | Works in isolation; duplicates affordability & collision checks; does not use spec lifecycle. |
| **Structure Catalogue** | **Partial** | `src/game/colonySimulation.ts:51-129` | 7 structures defined: `habitat`, `solar`, `lifeSupport`, `greenhouse`, `waterRecycler`, `shielding`, `battery` | Costs use "credits" (not materials). Missing `hab_01`, `hab_02`, `comms_tower`, `oxygen_generator` spec IDs. |
| **Colony Simulation Engine** | **Partial** | `src/game/colonySimulation.ts:213-336` | Pure `advanceSol(state)` with health factors and 3 scripted events (Sol 8, 15, 22) | Turn-based manual button, not real-time accumulator tick (`simulateTick`). Uses 30 sols instead of 5-SOL MVP. |
| **HUD & Resource Telemetry** | **Partial** | `src/App.tsx:568-760` | Live binding to `colony.resources` (power, oxygen, water, food, materials, credits) | Shows real state, but no net rates (+/- per sol). Water and credits exist in code but are absent from spec. |
| **Alert System** | **Partial** | `src/App.tsx:738-743`, `colonySimulation.ts` | Banner for `colony.event` and string shortage reports | Lacks stable IDs, severity tiers (`info`/`warning`/`critical`), and transition-based detection. |
| **Trainer Mission Layer** | **Missing** | `src/App.tsx:609-631` | 3 hardcoded checklist items ("Establish a habitat", "Generate power", "Protect life support") | Missing Section 19 8-step guided mission, "why this matters" explanations, 20s idle hints, and victory/fail modal. |
| **Time Controls (Pause / 1x / 3x)** | **Missing** | N/A | None implemented; only a manual "ADVANCE TO NEXT SOL" button | Spec Section 17.1 requires fixed timestep (1s accumulator, 1 SOL = 45s at 1x, pause, 1x, 3x). |
| **Unit Tests** | **Missing** | N/A | No test files or Vitest script in `package.json` | Required by Section 10.1 & 22 for simulation determinism and construction rules. |

---

## 4. Build, Lint, and Test Results

- **`npm run lint` (`oxlint`):**
  - **Result:** 12 warnings (0 fatal oxlint errors).
  - **Issues:**
    - `react(jsx-no-undef)`: `'World' is not defined` (`src/App.tsx:560:10`).
    - `eslint(no-unused-vars)`: `Stars`, `BuildMode`, `Habitat`, `SolarFarm`, `CommunicationsTower`, `Rocks`, `Terrain`, `FollowCamera` unused.
    - `react(set-state-in-effect)`: Calling `setPosition(null)` directly in effect inside `BuildMode.tsx:211`.
    - `react(immutability)`: Modifying `gl.domElement` in `FollowCamera` effect.
- **`npm run build` (`tsc -b && vite build`):**
  - **Result:** FAILED (Exit Code 1).
  - **Issues:** `TS2304: Cannot find name 'World'` in `src/App.tsx:560:10`, plus 8 `TS6133` unused identifier errors triggered by strict `noUnusedLocals: true`.
- **Unit Tests:**
  - **Result:** None configured in repository.

---

## 5. State & HUD Analysis

1. **Does the HUD show real or mock values?**
   - **Real:** Power, oxygen, water, food, materials, credits, building counts, and event banner are bound directly to `colony` state in `src/App.tsx`.
   - **Illustrative / Mock:** Coordinates ("18.4° N ARCADIA PLANITIA"), date ("MARS 2049"), sector tag, and objective completion status (partially dynamic, but fixed to 3 hardcoded checks). Production/consumption deltas are absent.
2. **Do construction and simulation share one state?**
   - **Yes, partially:** Both `constructBuilding` and `advanceSol` consume and return `ColonyState` held in `App.tsx` state.
   - **Defects:**
     - `BuildMode.tsx` duplicates affordability (`credits >= cost`) and collision geometry (`Math.hypot < 3.5`) on preview/click rather than delegating validation to a single authoritative rule.
     - Simulation is currently advanced via a manual button click instead of an autonomous clock loop.

---

## 6. Spec vs Codebase Divergence & Top Risks

1. **P0 Build / Runtime Blocker (Crash on Launch):**
   `World` was deleted from `src/App.tsx` in commit `a7150be`. The app cannot compile and crashes with a blank screen on launch.
2. **Economy & Resource Model Conflict:**
   - **Codebase:** Uses `credits` (600 CR starting), `water` (35), `power` (24), `oxygen` (35), `food` (35), `materials` (100). Buildings cost credits.
   - **Spec (Section 17-18):** 4 core resources: `Oxygen` (200), `Energy` (100), `Food` (150), `Materials` (800). No credits or water. Buildings cost Materials (e.g. HAB-01: 150 materials; Solar: 100 materials). Crew demand is −32 O2/SOL, −24 Food/SOL.
3. **Simulation Progression Model:**
   The code implements a turn-based Sol button (`advanceSol` Sol 1 to 30 with hardcoded events at Sols 8, 15, 22). The spec mandates a real-time fixed 1s accumulator loop where 1 SOL = 45s real-time at 1x, with Pause and 3x controls, capped at a 5-SOL mission.
4. **Input & Pointer Lock Fragility:**
   Key state can remain stuck on pointer-lock release; canvas focus handling and listener cleanup need fortification against window blur and menu transitions.
5. **Missing Guided Mission & Victory/Defeat Modal:**
   Judges cannot experience the Junior Astronaut Mission Trainer loop without the 8-step guided objectives, hints, and explanatory debriefing screen.

---

## 7. First 5 Prioritized Tasks

1. **Task 1 (P0 — Blocker): Restore `World` & Fix Build/Lint Errors**  
   Re-assemble the `World` component in `src/App.tsx` wiring `Stars`, lighting, `Terrain`, `Rocks`, `FollowCamera`, placed structures, and `BuildMode`. Fix oxlint and `tsc` errors so `npm run build` cleanly passes.
2. **Task 2 (P0 — State): Consolidate Authoritative Colony Store (`useColonyStore`)**  
   Introduce a single Zustand/authoritative store managing `ColonyState`, reconciling resource definitions and structure catalogue per Sections 17 & 18 (Oxygen, Energy, Food, Materials; Materials-based costs; crew demand).
3. **Task 3 (P1 — Core): Real-Time Deterministic Simulation (`simulateTick`) & Tests**  
   Implement pure `simulateTick(state, dt)` with a 1-second fixed accumulator, time delta clamping (max 0.25s), pause/1x/3x speed controls, brownout rules, and Sol progression (1 SOL = 45s). Add Vitest unit test suite verifying determinism and failure states.
4. **Task 4 (P1 — Construction): Construction Lifecycle & Safeguards**  
   Refactor `BuildMode` and structure definitions to implement the Section 6.2 state machine (idle -> select -> preview -> validate -> commit/cancel) with double-click guard, exactly-once material cost deduction, stable UUIDs, and data-driven catalogue (HAB-01, HAB-02, Solar Farm, Comms Tower, Oxygen Generator, Greenhouse).
5. **Task 5 (P1 — Integration & Trainer): Live Telemetry HUD, Alerts & Guided Mission**  
   Display live stocks + net production/consumption deltas in HUD; implement Section 19 guided trainer objectives (8 steps with "why this matters" and 20s idle hints); add victory/brownout/defeat end screen with full reset.
