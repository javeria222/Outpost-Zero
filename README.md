# OUTPOST ZERO

**A browser based Mars settlement and junior astronaut mission trainer by Team AstraX.**

OUTPOST ZERO places the player in a Martian landing zone and asks them to establish the life support, power, food, shelter, and communications systems needed to keep a four person crew alive. Structures cost materials, their effects feed the colony simulation, and the mission panel explains why each step matters.

The resource values and SOL duration are gameplay abstractions for a short educational experience. They are not mission planning data or scientific forecasts.

## Run locally

Use Node.js 22.18 or newer and npm.

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. The production and verification commands are:

```sh
npm test
npm run lint
npm run build
npm run preview
```

The production site is the static `dist/` directory. It can be deployed to a static host such as Vercel, Netlify, or GitHub Pages. Configure the host to run `npm ci` and `npm run build`, then publish `dist/`. No server, account, API key, or environment variable is required. A public deployment URL has not been configured in this repository.

## Controls

- Click the 3D scene to capture the mouse; move the mouse to look around.
- `W A S D` or the arrow keys move. `Shift` sprints on the ground and descends in flight mode.
- Press `E` to toggle flight on or off. In flight mode, `Space` ascends and `Shift` descends. Flight is capped at 120 metres; exiting flight returns safely to the ground.
- Choose a structure in the Construction panel, enter Build Mode, and click the ground to place it. The preview ring shows valid or invalid placement. Press `R` to rotate and `Esc` to cancel the preview or release the mouse.
- Use Pause, `1x`, and `3x` to control mission time. `Esc` outside Build Mode opens the field manual and pauses the simulation.
- Press `H` to toggle the field manual.
- Press `K` to reveal the hidden development control. Its button advances one SOL.

## Mission

The guided mission has eight steps: open construction, build power, shelter the crew, produce oxygen and food, balance the power grid, establish communications, and sustain the colony through SOL 6.

At 1x speed, one SOL takes 45 real seconds. The simulation uses one second fixed steps, pauses while the page is hidden or a modal/build session is open, and limits frame time so background tabs cannot cause a large resource jump.

On the first launch, the supplied Earth-to-Mars video at `public/cinematics/outpost-zero-earth-to-mars.mp4` plays before the interactive field tutorial. The tutorial has seven navigable sections, persistent completion, Skip Tutorial, and a final Start Mission action; only then does the gameplay scene and simulation start. ESC, H, or CONTROLS reopens the field manual, which also has Replay Intro. If the video is missing or cannot play, the intro reports the expected asset path and offers Skip Intro. The video has not been supplied in this checkout yet.

The colony starts with 200 oxygen, 100 energy, 150 food, and 3000 materials. Four crew consume 32 oxygen and 24 food per SOL. Structures are defined in `src/game/simulateTick.ts`:

| Structure | Cost | Effect per SOL |
| --- | ---: | --- |
| HAB-01 | 150 MAT | Capacity 4; uses 10 energy |
| HAB-02 | 250 MAT | Capacity 6; uses 15 energy |
| Solar Farm | 100 MAT | Produces 40 energy |
| Communications Tower | 80 MAT | Uses 8 energy |
| MOXIE Oxygen Generator | 150 MAT | Produces 40 oxygen; uses 25 energy |
| Hydroponic Greenhouse | 200 MAT | Produces 30 food; uses 15 energy |

Energy at zero causes brownout: non power structures stop operating until power recovers. Oxygen at zero for one SOL or food at zero for two SOLs fails the mission. Victory requires a habitat capacity of at least four, an active communications tower, and all resources above zero at SOL 6 or later. The debrief shows the outcome, remaining resources, structures, and alert history. Retry resets the colony and simulation controls.

## Technical overview

- React, TypeScript, Vite, Three.js, React Three Fiber, Drei, and Zustand.
- `src/game/useColonyStore.ts` is the authoritative colony store. Build confirmation is validated and committed there.
- `src/game/simulateTick.ts` contains the pure resource simulation, catalogue, construction validation, alerts, and mission outcomes.
- `src/game/fixedStep.ts` turns render-frame time into deterministic one-second simulation steps.
- `src/game/missionObjectives.ts` defines state-based mission objectives, educational explanations, and hints.
- `src/game/BuildMode.tsx` handles ground-plane placement previews and renders committed structures from store state.
- `src/App.tsx` composes the Mars scene, astronaut controls, loading/error fallback, HUD, and debrief.

The playable surface remains flat so movement, ground collision, and construction placement agree. Its visual terrain extends well beyond the bounded play area and is faded by Mars colored fog; it is not a globe-scale scientific terrain model.

## Tests and release notes

`npm test` uses Node's built in test runner with TypeScript source stripping. The suite checks 30/144 FPS equivalence, 1x/3x time progression, clamped frame deltas, immutable simulation updates, resource thresholds and failure rules, construction validation and single charging, store retry, and a winning build path.

The source scene uses procedural Three.js meshes and local SVG icons. The interface loads Barlow Condensed and Inter from Google Fonts with system fallbacks. No external Mars dataset or downloaded 3D model is bundled. Team members should add their names/roles and any challenge-required AI disclosure before submission.

## Team

**AstraX** — project team. Add individual member names and roles for the submission version.
