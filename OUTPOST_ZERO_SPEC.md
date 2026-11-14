# OUTPOST ZERO: Project Technical Specification

**Browser-based interactive 3D Mars outpost simulation**

> **Version 2.1.** Sections 1 to 15 are converted from the original v2.0 PDF. Sections 16 to 22 are **added** to fill the gaps (MVP definition, guided mission, balance values, 24-hour plan, submission checklist). Added content is marked **[ADDED]**.

## Project Information

| Field | Detail |
|---|---|
| Project | OUTPOST ZERO |
| Team | AstraX |
| Challenge | NASA Space Apps Challenge 2026 |
| Challenge track | Build a Junior Astronaut Mission Trainer |
| Application type | Browser-based interactive 3D simulation |
| Technology stack | React 19 · TypeScript · Vite 8 · Three.js |
| Document type | Project technical specification |
| Version | 2.1 |

---

## 1. Executive Summary

OUTPOST ZERO is a browser-based Mars outpost experience. The user explores a Martian environment as an astronaut and develops a settlement by placing infrastructure and managing colony-critical systems. The product combines a cinematic 3D environment with an understandable, interconnected simulation of the constraints involved in sustaining a human presence on Mars.

The application is built on a React, TypeScript and Vite foundation with Three.js rendering. Reported capabilities include astronaut movement and camera controls, a build-mode implementation, colony simulation logic, and a HUD with a colony-state interface. These are the established components of the project. The implementation depth, code ownership boundaries, runtime behaviour and completeness of each system are tracked through the verification framework in Section 4 and are labelled with the status vocabulary defined in Section 1.1.

The development approach is to preserve working systems and extend them rather than rewrite them: map the current implementation, identify the highest-impact gaps, and connect construction, resources, mission time and feedback into one coherent simulation.

> **System objective.** Deliver a stable interactive experience in which player actions have understandable consequences: structures cost resources, infrastructure changes production or protection, colony demand changes over mission time, and the interface communicates the state of the outpost.

### 1.1 Document conventions

| Term | Meaning |
|---|---|
| Reported | A capability identified in the project context that has not yet been independently verified against the repository and runtime. |
| Target behaviour | The intended product or system behaviour for the finished experience. |
| Proposed interface | A design proposal. It does not claim that the API, type or data model already exists in the codebase. |
| Status values | Verified, Partial, Unverified, Missing, Broken and Blocked, as defined in Section 4.4. |
| Source of truth | The Git repository and the running application are authoritative. This specification describes reported and intended behaviour and does not by itself establish that a feature exists. |

---

## 2. Product Scope and User Experience

### 2.1 Core user loop

1. Enter the Mars environment
2. Explore and orient the astronaut
3. Open construction mode
4. Select a structure
5. Preview and validate placement
6. Confirm or cancel placement
7. Colony state updates (resources, structures)
8. Simulation advances with mission time
9. HUD and alerts communicate colony status

The loop repeats: colony status informs the next construction decision. This is the intended high-level loop. Its mapping to existing screens, components, stores and handlers is recorded during the baseline verification described in Section 13.

### 2.2 Product pillars

| Pillar | Expected experience | Technical implication |
|---|---|---|
| Exploration | The user can move through a legible Mars environment. | Stable camera and movement; collision and world boundaries; acceptable frame rate. |
| Construction | The user can select and place outpost structures. | Placement preview, validation, costs, confirmation, persistence in session. |
| Colony management | The user understands resource production and demand. | Single source of truth for simulation state; explicit production and consumption rules. |
| Mission progression | Time passing changes colony conditions. | Deterministic simulation tick; clear pause and advance behaviour; no uncontrolled frame-rate dependence. |
| Learning and feedback | The user can understand why a system is stable or failing. | Readable status indicators, explanations, and cause-and-effect feedback. |

### 2.3 Out of scope unless already present or explicitly approved

- Real-world operational life-support control or mission-grade Mars habitat design.
- Multiplayer, accounts, cloud saves or backend services, unless confirmed in the current repository or approved by the project.
- Complex physics or scientific models beyond what the challenge experience needs.
- A complete rewrite of the rendering or state architecture merely to match this specification.

---

## 3. Implementation Baseline

This section records the reported baseline of the project. It deliberately avoids claiming that a named feature is complete or production-ready; every row below is Reported or Unverified until confirmed through Section 4.

| Area | Reported information | Status and verification |
|---|---|---|
| Frontend | React and TypeScript application built with Vite. | Reported. Exact package versions and scripts are confirmed from `package.json`. |
| 3D rendering | Three.js is part of the project technology. | Reported. Scene setup, renderer lifecycle, asset loading and any React Three Fiber usage are documented from source. |
| Environment | A Mars terrain scene and environmental objects such as rocks. | Reported. Scene composition, asset sources and performance are established at runtime. |
| Player controls | Movement, mouse camera, pointer lock, jumping and sprinting. | Reported. Input handling, focus and blur behaviour, collision and movement tuning remain to be verified. |
| Construction | Build mode and several structure types. | Reported. Placement workflow, state ownership, validation and persistence are to be mapped. |
| Colony logic | A colony simulation module (`colonySimulation.ts`). | Reported. Whether it is a live simulation or only state scaffolding is undetermined. |
| HUD | A HUD and colony and resource-related interface. | Reported. Displayed values must be confirmed as derived from actual simulation state. |

### 3.1 Known file references

```
src/
  App.tsx
  App.css
  game/
    BuildMode.tsx
    colonySimulation.ts
package.json
```

This is a partial file inventory only. A complete source tree is generated from the repository checkout, and these files are not assumed to be the only relevant ones.

### 3.2 Reported construction items

| Item | Type | Status |
|---|---|---|
| HAB-01 | Habitat | Reported. Object definition, visual asset, cost, effects and runtime behaviour are unverified. |
| HAB-02 | Habitat | Reported. Object definition, visual asset, cost, effects and runtime behaviour are unverified. |
| Solar farm | Power infrastructure | Reported. Object definition, visual asset, cost, effects and runtime behaviour are unverified. |
| Communications tower | Communications infrastructure | Reported. Object definition, visual asset, cost, effects and runtime behaviour are unverified. |

The labels above are identifiers and names taken from the project context. Their actual definitions, assets, costs, effects and behaviours are read from source.

---

## 4. Verification and Audit Framework

Significant implementation work is preceded by a controlled audit of the current state, so that every feature carries an evidence-based status.

### 4.1 Repository and build verification

- Repository URL, active branch, commit hash and working-tree status are recorded.
- `package.json`, the lockfile, Vite configuration, TypeScript configuration, lint configuration and environment-variable usage are inspected.
- The existing install, build, lint and type-check scripts are run where available, and exact commands and outcomes are recorded.
- A complete source tree is generated, excluding generated folders such as `node_modules`, `dist`, `build` and cache directories.
- Entry points, routes and screens, scene composition, state management, shared UI, game systems and asset directories are identified.
- Installed-but-unused dependencies, duplicated utilities and TODO/FIXME markers are identified.

### 4.2 Runtime verification

- The application is started using the documented development command.
- The browser, viewport and any required setup or environment variables are recorded.
- Console errors, failed network requests, asset loading failures and WebGL warnings are checked.
- The primary user journey is walked through: load scene, move, look around, enter build mode, select a structure, place or cancel, and inspect HUD values.
- Defects are captured as reproducible reports with steps, expected result, actual result and severity.

### 4.3 Feature status matrix

| Feature | Status | Source location | Runtime test | Notes / gap |
|---|---|---|---|---|
| Player movement | Unverified | To identify | Move, sprint, jump; check boundaries. | Record controls and defects. |
| Camera / pointer lock | Unverified | To identify | Enter and exit pointer lock; test focus loss. | Check mobile and fallback behaviour. |
| Build mode | Unverified | `BuildMode.tsx` (known) | Open, select, preview, cancel, confirm. | Map all states and handlers. |
| Structure definitions | Unverified | To identify | Inspect every buildable item. | Record costs, effects, asset references. |
| Colony simulation | Unverified | `colonySimulation.ts` (known) | Advance time and observe values. | Determine whether rules are implemented. |
| HUD / resource display | Unverified | To identify | Compare displayed values with state. | Check for hard-coded mock values. |
| Production build | Unverified | `package.json` | Run production build. | Record warnings and errors. |

### 4.4 Status definitions

| Status | Definition |
|---|---|
| Verified | Inspected in code and exercised successfully at runtime. |
| Partial | Some working behaviour exists, but the defined acceptance criteria are not met. |
| Unverified | Not yet inspected or tested. This is not the same as missing. |
| Missing | The audit confirms that no implementation exists. |
| Broken | An implementation exists but fails a reproducible test. |
| Blocked | Progress is not possible because a dependency, asset, decision or access is unavailable. |

---

## 5. Target System Design

The following is a proposed logical design that guides integration. It does not require creating these exact files or adopting a new framework; the current architecture is reused wherever it already provides the same responsibility.

### 5.1 Responsibility boundaries

| System | Responsibility | Must not own |
|---|---|---|
| 3D scene / renderer | Render terrain, structures, lighting, player avatar and visual effects. | Authoritative resource calculations or duplicate colony state. |
| Player controller | Read input and update player movement and camera. | Construction costs or colony resource rules. |
| Build mode | Selection, placement preview, validation request, confirm and cancel interaction. | Independent copies of colony inventory or resource totals. |
| Structure catalogue | Definitions for buildable structures: identity, display data, cost, capabilities. | Live mutable colony state. |
| Colony simulation | Authoritative resource state and deterministic simulation updates. | Direct DOM or UI manipulation, or rendering-specific objects. |
| HUD / UI | Display state and dispatch user intent. | Maintaining separate authoritative resource values. |
| Mission clock | Control simulation time or tick requests. | Changing resources outside the simulation rules. |

### 5.2 State ownership principle

There is one authoritative colony state. Build mode, the HUD and scene presentation read from, or dispatch actions to, that state rather than maintaining competing copies of resources or structures. The implementation may use React state, Zustand, Context or an existing store; the current choice is identified during the audit before any change is proposed.

### 5.3 Proposed conceptual state shape

```ts
type ResourceId = 'oxygen' | 'energy' | 'food' | 'materials';

type ResourceState = {
  oxygen: number;
  energy: number;
  food: number;
  materials: number;
};

type StructureInstance = {
  id: string;           // unique instance id
  definitionId: string; // e.g. habitat / solar_farm
  position: { x: number; y: number; z: number };
  rotationY: number;
  status: 'building' | 'active' | 'damaged';
};

type ColonyAlert = {
  id: string; // stable id for transition-based detection
  system: ResourceId | 'radiation' | 'construction';
  severity: 'info' | 'warning' | 'critical';
  reason: string;
};

type ColonyState = {
  sol: number;
  elapsedSeconds: number;
  resources: ResourceState;
  structures: StructureInstance[];
  alerts: ColonyAlert[];
  simulationStatus: 'running' | 'paused';
};
```

This is a proposed conceptual contract rather than a requirement to copy it verbatim. Naming and types are adapted to the repository's existing conventions, and fields are added only when supported by actual mechanics.

---

## 6. Gameplay System Requirements

### 6.1 Structure catalogue

Buildable structures are data-driven where practical. This reduces duplicated conditional logic in the build menu, placement checks and simulation.

```ts
type StructureDefinition = {
  id: string;
  name: string;
  description: string;
  category: 'habitat' | 'power' | 'communications'
          | 'life_support' | 'food';
  buildCost: Partial<Record<ResourceId, number>>;
  footprint: { width: number; depth: number };
  effects: {
    oxygenProduction?: number;
    oxygenConsumption?: number;
    energyProduction?: number;
    energyConsumption?: number;
    foodProduction?: number;
    foodConsumption?: number;
    radiationProtection?: number;
    habitatCapacity?: number;
  };
  modelKey: string;
};
```

For each existing structure, the catalogue records: catalogue ID, display name, model or asset reference, footprint, build cost, resource effects, unlock conditions (if any), and whether each effect is implemented or only planned.

### 6.2 Construction lifecycle

```
IDLE
  -> SELECTING_STRUCTURE
  -> PLACEMENT_PREVIEW
  -> VALIDATE_PLACEMENT
  -> COMMIT_STRUCTURE (valid and affordable) -> IDLE
  -> PLACEMENT_PREVIEW (rejected, reason shown)
Cancel from any placement state -> IDLE
```

| State | Behaviour | Transitions |
|---|---|---|
| IDLE | No structure selected; no placement in progress. | Opening the build menu leads to SELECTING_STRUCTURE. |
| SELECTING_STRUCTURE | Build menu shows structure name, purpose and cost. | Selecting an item leads to PLACEMENT_PREVIEW; closing the menu returns to IDLE. |
| PLACEMENT_PREVIEW | A preview follows the pointer and shows valid or invalid state. No resources are spent. | Confirm leads to VALIDATE_PLACEMENT; cancel returns to IDLE. |
| VALIDATE_PLACEMENT | Bounds, terrain suitability, overlap and affordability are checked at confirmation time. | Valid and affordable leads to COMMIT_STRUCTURE; otherwise the placement is rejected with a reason and returns to PLACEMENT_PREVIEW. |
| COMMIT_STRUCTURE | Cost is deducted once and one structure instance is created. | Returns to IDLE. |

**Required behaviour**

- Selecting a catalogue item enters placement-preview mode without spending resources.
- The preview communicates valid and invalid placement states clearly.
- Validation checks world bounds, terrain suitability where relevant, and overlap with existing structures.
- Confirmation is rejected if the placement is invalid or the colony cannot afford the cost.
- On successful confirmation, costs are deducted exactly once and one structure instance is created.
- Cancel exits placement mode without changing colony resources or structure state.
- The HUD and the 3D scene reflect the same committed state.

**Construction safeguards**

- Validation is performed again at confirmation time; the earlier preview result is not trusted alone.
- Resources are never charged during pointer movement or preview rendering.
- Each placed instance receives a stable unique ID.
- Repeated clicks or rapid input cannot create duplicate placements or double-charge costs.
- Placement calculations are independent of render frame rate.

### 6.3 Resource simulation

The simulation has explicit production, consumption and elapsed-time rules. Resource values are not adjusted directly by UI components.

| Resource | Potential sources | Potential demand / loss | Player-facing signal |
|---|---|---|---|
| Oxygen | Life-support equipment or other defined infrastructure. | Crew demand; system operating costs, if modelled. | Oxygen level, trend, shortage alert. |
| Energy | Solar farm or other power infrastructure. | Habitat, life support, communications and other active structures. | Stored energy, production versus consumption. |
| Food | Food production infrastructure or starting supplies. | Crew consumption over mission time. | Available supply, days of supply or warning. |
| Materials | Starting inventory or explicitly modelled sources. | Construction costs and repairs, if implemented. | Available stock and cost shortfall. |
| Radiation protection | Protective structures or habitat shielding. | Environmental exposure; modelled as a risk or condition, not a consumable, unless designed otherwise. | Exposure and protection status with explanation. |

Scientific constants are not invented, and simplified game values are not presented as real mission-planning data. Transparent gameplay parameters are used and labelled as simulation abstractions where appropriate.

### 6.4 Simulation tick and time

- One simulation update function receives the current state and a controlled time delta or tick duration.
- Resource production is not tied directly to render frames, because device frame rates vary.
- A fixed simulation interval or deterministic elapsed-time calculation is used.
- Pause, resume and SOL advancement are explicitly defined.
- Elapsed time is clamped or validated so that a suspended browser tab does not create an unexpected giant simulation step.
- The rules are testable without rendering the 3D scene.

```ts
// Illustrative pure-function boundary; adapted to existing code.
function simulateTick(
  state: ColonyState,
  deltaSeconds: number
): ColonyState {
  // Calculate structure output and colony demand.
  // Apply resource changes using documented game rules.
  // Derive alerts and status.
  // Return a new state; do not mutate the input.
}
```

### 6.5 Alerts and failure states

- Alerts are generated from authoritative state, not from independent UI timers.
- Each alert identifies the affected system, severity and reason.
- Duplicate alert creation on every render or tick is avoided through stable IDs or transition-based detection.
- The behaviour when a resource reaches zero is defined: warning, degraded operation, mission failure, or another agreed gameplay response.
- Rules are kept consistent and consequences are explained to the user.

---

## 7. User Interface and Interaction Requirements

| UI area | Required information / behaviour |
|---|---|
| Main HUD | SOL/day, core resource values and concise colony status. |
| Build menu | Structure name, purpose, cost and selection state. |
| Placement preview | Selected structure, placement validity and a clear invalid reason where possible. |
| Resource panel | Current stock and production and consumption breakdown where available. |
| Alerts | Actionable explanation of shortages, invalid placement or critical system status. |
| Mission / status panel | Current objective or next recommended action, if objectives are part of the agreed design. |
| Pause / settings | A predictable way to pause the simulation and access controls and settings, if supported. |

The interface does not imply that a system is simulated when the underlying logic is not implemented. If a value is illustrative or static, it is labelled accordingly until connected to live state.

---

## 8. 3D World and Performance Requirements

### 8.1 Scene responsibilities

- Scene setup, asset loading, player control, buildable objects and HUD responsibilities are kept clearly separated where the current architecture permits.
- New geometry, materials and event handlers are not created repeatedly on every React render.
- GPU resources and event listeners are disposed of when components or scenes unmount.
- Pointer-lock exit and keyboard input cleanup work when the user changes focus or leaves the scene.
- Placed structure transforms are consistent between simulation data and rendered objects.

### 8.2 Performance audit

- Frame rate is measured on a representative laptop and on a lower-powered device if available.
- Draw calls, geometry and material reuse, texture sizes, shadow settings and post-processing are inspected.
- Instancing or shared assets are used for repeated environmental objects where it materially improves performance.
- Large assets are not loaded synchronously on the critical startup path.
- A visible loading state is provided and failed assets are handled gracefully.
- Resizing and browser tab visibility changes are tested.

> **Optimization method.** Optimization is measured, not assumed: record a baseline, identify the bottleneck, make one targeted change, and compare results.

---

## 9. Software Quality, Error Handling and Security

- TypeScript strictness and existing lint conventions are kept; errors are not silenced with broad `any` casts.
- External or user-controlled values are validated before they enter simulation state.
- Stable IDs and predictable state transitions are used.
- Hidden global mutable state is avoided for core game mechanics.
- Browser event listeners are always paired with cleanup.
- Missing assets and invalid configuration are handled without crashing the entire application.
- API keys, credentials and private environment files are never committed.
- Any environment variables are documented, and a safe example environment file is provided if the project requires one.
- No backend, database, authentication or analytics is added unless the product requires it and the scope is approved.

---

## 10. Test Strategy and Acceptance Criteria

### 10.1 Unit-level tests

- Resource calculation produces the expected output for a known state and time delta.
- Insufficient resources prevent construction and do not change state.
- Valid construction deducts the correct cost exactly once.
- Invalid or overlapping placement is rejected.
- The simulation tick does not mutate the previous state if immutable state updates are the chosen pattern.
- Alert generation does not create duplicates on repeated ticks.

### 10.2 Integration tests

- Build menu selection creates a placement preview.
- Confirming a valid, affordable placement creates one structure and updates the HUD.
- Cancelling placement leaves resources and structure count unchanged.
- A structure's production or consumption effect is reflected after simulation time advances.
- Pausing stops simulation progression while preserving access to permitted UI.

### 10.3 Manual end-to-end checklist

| Test | Pass condition |
|---|---|
| Application startup | App loads without fatal console errors. |
| Scene rendering | Terrain, player and required assets render. |
| Movement | Movement, camera, sprint and jump behave consistently. |
| Pointer lock | Enter and exit work; keyboard state does not get stuck. |
| Build selection | A structure can be selected and previewed. |
| Placement validation | Invalid locations are rejected with understandable feedback. |
| Resource affordability | Cannot build if the colony cannot afford the structure. |
| Construction commit | One confirmation creates one structure and deducts one cost. |
| Simulation | Advancing time changes resource values according to defined rules. |
| HUD consistency | HUD values match authoritative simulation state. |
| Build output | Production build completes and the deployed app loads. |

### 10.4 Definition of done

A task is complete when the behaviour is implemented, the relevant acceptance criteria pass, regressions are checked, and documentation and status are updated. Writing code alone does not constitute completion.

---

## 11. Implementation Roadmap

| Phase | Work | Deliverable / exit criterion |
|---|---|---|
| 0 — Audit | Repository tree, scripts, architecture map, runtime baseline, verified feature matrix. | Current state is documented: what exists, what works and what is missing. |
| 1 — Stabilize | Fix build blockers, runtime crashes, input cleanup and high-severity defects. | App starts reliably; core exploration remains functional. |
| 2 — Construction | Catalogue, placement preview, validation, affordability, commit and cancel flow. | Construction works end-to-end and is covered by tests. |
| 3 — Simulation core | Single authoritative state, deterministic tick, resource calculations, SOL progression. | Resource changes are predictable and testable without 3D rendering. |
| 4 — Integration | Connect structure effects, resource HUD, alerts and mission status. | Player actions produce visible, consistent simulation consequences. |
| 5 — Polish | Visual feedback, loading and error states, responsive behaviour, performance. | Experience is stable and understandable on target devices. |
| 6 — Release | Regression test, production build, deployment verification, final documentation. | Release candidate is reproducible and demo-ready. |

> **Priority rule.** Blockers and core-loop correctness take priority over cosmetic polish. New content is not built on top of an unstable construction or simulation foundation.

> **[ADDED] Note.** This roadmap is compressed into a 24-hour schedule in Section 20.

---

## 12. Development Tracking Template

| Field | What to record |
|---|---|
| Task ID / title | Short unique identifier and outcome-focused title. |
| Priority | P0 blocker, P1 core functionality, P2 important, P3 polish. |
| Status | Not started, in progress, blocked, in review, verified complete. |
| Owner | Person responsible for implementation. |
| Affected files | Actual source paths changed or inspected. |
| Dependencies | Required assets, decisions or upstream tasks. |
| Acceptance criteria | Observable conditions that determine completion. |
| Test evidence | Commands, test results, screenshots or video, reproduction steps. |
| Known risks | Potential regressions, performance impact, edge cases. |

### 12.1 Priority definitions

| Priority | Definition |
|---|---|
| P0 | Prevents the app from running or blocks the core demo. |
| P1 | Required for the primary user loop (construction, resource state, core controls). |
| P2 | Improves clarity, completeness or reliability. |
| P3 | Optional polish that does not block the intended demo. |

---

## 13. Baseline Verification Procedure

The baseline of the project is established through the following sequence, which precedes implementation work.

1. Repository state is recorded: branch and commit hash.
2. The project is run exactly as currently configured, without upgrading packages first.
3. The full source of `App.tsx`, `BuildMode.tsx`, `colonySimulation.ts` and all imported modules is read.
4. The storage locations of structure definitions, resource values and placed-object state are traced.
5. The data flow is mapped from user input to build mode, to state update, to 3D scene and HUD.
6. A manual audit is performed and the feature matrix (Section 4.3) is filled in with evidence.
7. A findings report is produced covering current architecture, verified working features, broken or partial features, missing features and the first three recommended tasks.
8. Implementation then begins, reusing existing systems wherever possible.

The example state types, system boundaries and roadmap in this specification describe a target design. They are reconciled with the actual codebase and are not assumed to exist in it.

### 13.1 Baseline technical audit report

The first deliverable is a one-page technical audit, which forms the basis for estimating remaining work. It contains:

- Repository tree.
- Architecture and data-flow diagram.
- Verified feature matrix.
- Build and test results.
- Top risks.
- Prioritized next tasks.

---

## 14. Risks, Open Decisions and Known Limitations

### 14.1 Risk register

| Risk / unknown | Why it matters | Resolution |
|---|---|---|
| Actual codebase may differ from the partial file map. | Work may be directed at the wrong place or duplicate existing systems. | Generate the full tree and trace imports. |
| Displayed resources may be mock or static values. | The HUD could imply a simulation that does not exist. | Trace every displayed value to its source. |
| Construction and simulation may use separate state. | Placement could fail to affect colony systems consistently. | Identify authoritative state and define the integration boundary. |
| Structure costs and effects are not documented here. | Balancing and expected gameplay cannot be tested. | Extract existing values; agree on missing gameplay parameters. |
| SOL and time behaviour is unclear. | Resource rates and progression depend on time semantics. | Define simulation tick and pause and advance rules. |
| Target device and performance baseline unknown. | The 3D experience may perform poorly on some devices. | Measure on demo hardware and a lower-end device. |
| Asset licensing and source not inventoried. | A release or demo could include untracked or unusable assets. | Record asset provenance and licences. |

### 14.2 Open design decisions

- Is the simulation real-time, turn-based, or advanced by a player-controlled SOL button? **[ADDED] Resolved in Section 17.**
- What is the intended crew size, and which resource systems are essential for the demo? **[ADDED] Resolved in Section 17.**
- Are structure costs and production rates already designed, or do they need agreement? **[ADDED] Starting values proposed in Section 18.**
- What is the minimum supported device and browser for the final demonstration? **[ADDED] Resolved in Section 16.4.**
- Which features are mandatory for the challenge submission, and which are stretch goals? **[ADDED] Resolved in Section 16.**

### 14.3 Known limitations

- The implementation status of the reported systems (movement, build mode, colony simulation, HUD) is unverified; only the items in Section 3 are reported.
- Structure costs, effects and unlock conditions are not documented and are not yet confirmed as implemented.
- Simulation time semantics (real-time, turn-based or player-advanced) are undecided. **[ADDED] Decided in Section 17.**
- The target device and performance baseline are not yet measured.
- Asset provenance and licensing have not been inventoried.

---

## 15. Design Principles

- Inspect before implementing.
- Preserve working code; refactor only with a clear reason.
- Maintain one authoritative source of colony state.
- Separate rendering from simulation rules.
- Make simulation updates deterministic and testable.
- Validate placement and affordability at commit time.
- Connect every displayed metric to a real state value or label it as illustrative.
- Test user-visible behaviour, not only compilation.
- Document assumptions, parameters and unfinished work.
- Never mark a feature complete without verification.

OUTPOST ZERO evolves from its existing foundation into a coherent, testable Mars outpost experience. The immediate focus is a verified technical baseline, followed by focused implementation of the core construction and colony-simulation loop.

---
---

# ADDED SECTIONS (v2.1)

> Everything below is **[ADDED]** and was not in the original PDF. Values are simulation abstractions for gameplay, not real mission-planning data. If the existing codebase already has equivalents, **keep the existing values and structures** and only fill gaps (Section 4 audit comes first).

## 16. [ADDED] MVP Definition

### 16.1 MVP goal

A judge can open the deployed link, finish a guided 5-SOL survival mission in about 3 to 5 minutes, and understand *why* the colony survived or failed.

### 16.2 MVP features (must-have, P0/P1)

| # | Feature | Acceptance criteria |
|---|---|---|
| M1 | App loads and runs from a deployed URL | Production build passes; no fatal console errors; loading state shown. |
| M2 | Astronaut exploration | Move, look, sprint, jump; pointer lock enter/exit works; no stuck keys; world boundary. |
| M3 | Build mode with 6 structures | Menu, preview (green/red), validate, confirm, cancel, per-Section 6.2. |
| M4 | Single authoritative colony state | One store; HUD, build mode and scene read from it. |
| M5 | Deterministic simulation tick | Pure `simulateTick`, fixed timestep, delta clamped, pause/resume, speed 1x/3x. |
| M6 | Live resource HUD | Oxygen, energy, food, materials, SOL, crew count; production/consumption shown. |
| M7 | Alerts with reasons | Warning at <25% buffer, critical at 0; stable IDs; plain-language "why". |
| M8 | Win/lose conditions | Defined in Section 17.3; end screen with a summary and "retry". |
| M9 | Guided mission (trainer layer) | Objectives from Section 19; each explains a real concept. |
| M10 | Basic audio/visual feedback | Placement confirmation, invalid placement, alert cue (can be minimal). |
| M11 | Pause menu and controls help | Shows controls, pause, restart mission. |

### 16.3 Stretch goals (only after all M1 to M11 pass)

| # | Feature | Notes |
|---|---|---|
| S1 | Dust storm event | On Sol 3, solar output halves for 1 SOL. Teaches energy reserves. |
| S2 | Radiation protection indicator | Uses `radiationProtection` effect. |
| S3 | Structure deletion/refund | 50% refund. |
| S4 | Save/restore in `localStorage` | Session persistence only. |
| S5 | Minimap or build-grid snapping | Usability. |
| S6 | NASA-sourced fact cards | Short "Did you know" cards linked to NASA public resources (verify sources and licences first). |

### 16.4 Non-functional MVP targets

- Desktop browser, latest Chrome and Edge (Firefox/Safari best effort). Mobile is out of scope.
- Target at least 30 FPS on a mid-range laptop with integrated graphics.
- Initial load under about 15 seconds on a normal connection; large assets lazy-loaded.
- Keyboard + mouse controls only.

### 16.5 Explicitly out of MVP

Multiplayer, accounts, backend, cloud saves, mobile/touch controls, procedural terrain, multiple maps, complex physics, real scientific modelling.

## 17. [ADDED] Resolved Design Decisions

### 17.1 Time model: real-time with pause and speed control

- Fixed simulation timestep (1 simulated second per tick, accumulator-based, independent of render FPS).
- **1 SOL = 45 real seconds at 1x** (abstraction for demo pacing, not real Martian time).
- Speed options: Paused, 1x, 3x. Simulation also pauses while a menu is open or the tab is hidden.
- Delta is clamped (max 0.25 s per frame accumulation) so a background tab cannot cause a huge step.

*Reason: a short demo video and judge session need visible progress without extra button presses. A pause button preserves the thinking time that makes it a trainer.*

### 17.2 Crew and scope

- Crew size: **4** (fixed for MVP).
- Resources: oxygen, energy, food, materials. Radiation is a stretch goal.

### 17.3 Failure and victory rules

| Condition | Behaviour |
|---|---|
| Energy reaches 0 | **Brownout**: all non-solar structures go inactive (no production, no consumption) until energy is above 0. Critical alert explains the cause. |
| Oxygen reaches 0 | Critical alert; if it stays at 0 for 1 SOL, **mission failed**. |
| Food reaches 0 | Critical alert; if it stays at 0 for 2 SOL, **mission failed**. |
| Habitat capacity < crew | Warning alert "Crew has no shelter"; mission cannot be completed until fixed. |
| **Victory** | Reach **SOL 6 start** (5 full sols survived) with: habitat capacity ≥ 4, comms tower active, no resource at 0. |

## 18. [ADDED] Starting Values and Structure Catalogue (Proposal)

All numbers are **per SOL** rates and are labelled in the UI as "simulation abstraction". Replace with existing values where the codebase already defines them.

### 18.1 Starting state

| Resource | Start |
|---|---|
| Oxygen | 200 |
| Energy | 100 |
| Food | 150 |
| Materials | 800 |

Crew demand (4 crew): oxygen −32/SOL (8 per crew), food −24/SOL (6 per crew). Resource buffers cap at 500 (energy 300).

### 18.2 Structures

| ID | Name | Category | Build cost | Effects per SOL | Status |
|---|---|---|---|---|---|
| `hab_01` | HAB-01 | habitat | 150 materials | capacity +4, energy −10 | Reported (verify) |
| `hab_02` | HAB-02 | habitat | 250 materials | capacity +6, energy −15 | Reported (verify) |
| `solar_farm` | Solar Farm | power | 100 materials | energy +40 | Reported (verify) |
| `comms_tower` | Communications Tower | communications | 80 materials | energy −8; enables "Contact Earth" objective | Reported (verify) |
| `oxygen_generator` | Oxygen Generator | life_support | 150 materials | energy −25, oxygen +40 | **Added** (create if missing) |
| `greenhouse` | Greenhouse | food | 200 materials | energy −15, food +30 | **Added** (create if missing) |

### 18.3 Balance sanity check (design intent)

- Materials: 800 start. A full viable base (2 solar 200 + HAB-01 150 + oxygen gen 150 + greenhouse 200 = 700) leaves 100 spare, enough for one comms tower (80). The player must prioritise; they cannot build everything.
- Energy: habitat −10, oxygen gen −25, greenhouse −15, comms −8 = −58/SOL needs at least 2 solar farms (+80).
- Oxygen: +40 from one generator beats −32 crew demand. Food: +30 from one greenhouse beats −24.
- Playtest and tune. A skilled player should win with about 100 spare materials; a careless one should fail by about SOL 4 to 5.

## 19. [ADDED] Guided Mission ("Junior Astronaut Trainer" layer)

A linear objective list in the mission panel. Each objective completes automatically from state and shows a one-to-two-sentence "why this matters" explanation.

| # | Objective | Completion trigger | Concept taught |
|---|---|---|---|
| 1 | Walk to the landing site and open the build menu | Build menu opened | Orientation |
| 2 | Build a **Solar Farm** | 1 active solar farm | Energy powers everything else |
| 3 | Build **HAB-01** | Habitat capacity ≥ 4 | Crew needs pressurised shelter |
| 4 | Build an **Oxygen Generator** | 1 active generator | Mars atmosphere is not breathable; oxygen must be produced |
| 5 | Build a **Greenhouse** | 1 active greenhouse | Food supply on long missions |
| 6 | Add a second **Solar Farm** to avoid brownout | Net energy ≥ 0 | Balancing production vs consumption |
| 7 | Build a **Communications Tower** | 1 active tower | Contact with Earth (signal delay is real; keep text generic) |
| 8 | Survive until **SOL 6** | Victory rule 17.3 | Resource management over time |

Rules: hints appear after 20 s of inactivity on an objective; the end screen summarises what the colony did well, what failed and why (from alert history).

## 20. [ADDED] 24-Hour Build Plan

Assumes about 2 to 3 people. Adjust to what the audit finds.

| Hours | Phase | Output |
|---|---|---|
| 0 to 2 | **Audit (Phase 0)** | Read the full codebase, run the app, produce the one-page audit and feature matrix. Decide what to keep. |
| 2 to 5 | **Stabilize + state (Phases 1 and 3a)** | Fix blockers; create or consolidate a single colony store; pure `simulateTick` with tests. |
| 5 to 10 | **Construction (Phase 2)** | Catalogue with 6 structures; preview, validate, commit, cancel; safeguards; tests. |
| 10 to 14 | **Integration (Phase 4)** | Structure effects drive simulation; live HUD; alerts; pause and speed. |
| 14 to 18 | **Mission layer** | Objectives, hints, win/lose, end screen, controls help. |
| 18 to 21 | **Polish + performance** | Loading screen, feedback cues, FPS pass, balance tuning via playtests. |
| 21 to 23 | **Release (Phase 6)** | Production build, deploy, regression checklist (10.3), fix P0s only. |
| 23 to 24 | **Submission** | Demo video, write-up, submission form (Section 21). |

**Cut order if behind schedule:** stretch goals → audio → hints → second habitat → greenhouse/oxygen visual polish. Never cut: single state, build flow, tick, HUD, win/lose, deploy.

## 21. [ADDED] Submission and Delivery Checklist

> Verify the exact requirements on the official NASA Space Apps challenge page; the items below are typical expectations, not confirmed rules.

- [ ] Deployed public URL (Vercel/Netlify/GitHub Pages) loads from a clean browser.
- [ ] Public GitHub repository with README (what it is, how to run, controls, tech stack, team).
- [ ] Demo video (about 1 to 3 minutes) showing the full loop and one failure case.
- [ ] Project description/summary mapped to the "Junior Astronaut Mission Trainer" track.
- [ ] List of NASA data/resources used (if any) with links.
- [ ] Disclosure of AI tools used, as required by the challenge.
- [ ] Asset provenance and licence list (models, textures, audio, fonts).
- [ ] No secrets or `.env` committed; `.env.example` if needed.
- [ ] Team members and roles listed.

## 22. [ADDED] Additional Acceptance Tests for MVP

| Test | Pass condition |
|---|---|
| Fixed timestep | Same inputs at 30 FPS and 144 FPS yield the same resources after 1 SOL (±0). |
| Tab hidden | Hiding the tab for 60 s does not advance more than the clamp. |
| Brownout | Removing energy to 0 deactivates non-solar structures and shows a critical alert with a reason. |
| Win path | Scripted build order from Section 19 reaches SOL 6 with victory. |
| Lose path | Building nothing leads to failure by oxygen within the expected SOL range. |
| Retry | "Retry" fully resets state, objectives and scene (no leftover structures). |
| Double-click safety | Rapid confirm creates exactly one structure and one deduction. |
| Fresh deploy | Production URL works from an incognito window with cache cleared. |
