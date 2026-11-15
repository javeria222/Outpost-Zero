import assert from "node:assert/strict";
import test from "node:test";
import {
  INITIAL_COLONY_STATE,
  RESOURCE_CAPACITY,
  STRUCTURE_CATALOGUE,
  commitStructure,
  simulateTick,
  validatePlacement,
} from "../src/game/simulateTick.ts";
import { accumulateFixedSteps } from "../src/game/fixedStep.ts";
import { landFlight, stepFlightAltitude, toggleFlight } from "../src/game/flightControls.ts";
import { useColonyStore } from "../src/game/useColonyStore.ts";

function runOneSolAtFps(fps, realSeconds = 45, speed = 1) {
  let state = structuredClone(INITIAL_COLONY_STATE);
  let accumulator = 0;

  for (let frame = 0; frame < fps * realSeconds; frame += 1) {
    const result = accumulateFixedSteps(accumulator, 1 / fps, speed);
    accumulator = result.remainder;
    for (let step = 0; step < result.steps; step += 1) {
      state = simulateTick(state, 1);
    }
  }

  return { state, accumulator };
}

test("fixed-step simulation advances one SOL consistently at 30 and 144 FPS", () => {
  const at30 = runOneSolAtFps(30);
  const at144 = runOneSolAtFps(144);

  assert.equal(at30.state.elapsedSeconds, 45);
  assert.equal(at144.state.elapsedSeconds, 45);
  assert.deepEqual(at30.state.resources, at144.state.resources);
  assert.equal(at30.state.sol, 2);
  assert.equal(at144.state.sol, 2);

  const at3x = runOneSolAtFps(60, 15, 3);
  assert.equal(at3x.state.elapsedSeconds, 45);
  assert.deepEqual(at3x.state.resources, at30.state.resources);
});

test("render deltas are clamped before fixed steps are accumulated", () => {
  assert.deepEqual(accumulateFixedSteps(0, 10, 1), { steps: 0, remainder: 0.25 });
  assert.deepEqual(accumulateFixedSteps(0, 10, 3), { steps: 0, remainder: 0.75 });
});

test("flight toggles predictably, ascends and descends without input drift", () => {
  const flying = toggleFlight({ enabled: false, altitude: 0 });
  assert.deepEqual(flying, { enabled: true, altitude: 0 });
  const risen = stepFlightAltitude(flying.altitude, true, false, 1, 120);
  assert.equal(risen, 12);
  assert.equal(stepFlightAltitude(risen, false, false, 1, 120), risen);
  assert.equal(stepFlightAltitude(risen, undefined, undefined, 1, 120), risen);
  assert.equal(stepFlightAltitude(risen, false, true, 0.5, 120), 6);
  assert.deepEqual(toggleFlight({ enabled: true, altitude: risen }), { enabled: false, altitude: 0 });
  assert.deepEqual(landFlight(), { enabled: false, altitude: 0 });
  assert.equal(stepFlightAltitude(0, false, true, 1, 120), 0);
  assert.equal(stepFlightAltitude(119, true, false, 1, 120), 120);
});

test("initial and reset colony materials are 3000 MAT; construction prices stay unchanged", () => {
  assert.equal(INITIAL_COLONY_STATE.resources.materials, 3000);
  assert.deepEqual(
    Object.fromEntries(Object.entries(STRUCTURE_CATALOGUE).map(([id, item]) => [id, item.buildCost.materials])),
    { hab_01: 150, hab_02: 250, solar_farm: 100, comms_tower: 80, oxygen_generator: 150, greenhouse: 200 },
  );
  useColonyStore.getState().resetMission();
  assert.equal(useColonyStore.getState().resources.materials, 3000);
});

test("simulateTick is immutable, deterministic, and respects resource caps", () => {
  const initial = structuredClone(INITIAL_COLONY_STATE);
  const first = simulateTick(initial, 1);
  const second = simulateTick(initial, 1);

  assert.deepEqual(first, second);
  assert.deepEqual(initial, INITIAL_COLONY_STATE);
  assert.equal(first.resources.oxygen, INITIAL_COLONY_STATE.resources.oxygen - 32 / 45);

  const capped = simulateTick({
    ...initial,
    resources: { ...initial.resources, oxygen: RESOURCE_CAPACITY.oxygen },
    structures: [{
      instanceId: "moxie-test",
      structureId: "oxygen_generator",
      x: 0,
      z: 0,
      rotation: 0,
      active: true,
    }],
  }, 1);
  assert.equal(capped.resources.oxygen, RESOURCE_CAPACITY.oxygen);
});

test("low resource alerts use the 25 percent capacity threshold", () => {
  const lowEnergy = simulateTick({
    ...INITIAL_COLONY_STATE,
    resources: { ...INITIAL_COLONY_STATE.resources, energy: 74 },
  }, 1);

  assert.ok(lowEnergy.alerts.some((alert) => alert.id === "low-energy"));

  const lowMaterials = simulateTick({
    ...INITIAL_COLONY_STATE,
    resources: { ...INITIAL_COLONY_STATE.resources, materials: 199 },
  }, 1);
  assert.ok(lowMaterials.alerts.some((alert) => alert.id === "low-materials"));
});

test("resource alert history keeps stable ids without duplicating repeated alerts", () => {
  let state = {
    ...INITIAL_COLONY_STATE,
    resources: { ...INITIAL_COLONY_STATE.resources, energy: 74 },
  };
  state = simulateTick(state, 1);
  state = simulateTick(state, 1);

  assert.equal(state.alertHistory.filter((alert) => alert.id === "low-energy").length, 1);
});

test("brownout deactivates non-solar structures and records a critical reason", () => {
  const state = {
    ...INITIAL_COLONY_STATE,
    resources: { ...INITIAL_COLONY_STATE.resources, energy: 0 },
    structures: [{
      instanceId: "hab-test",
      structureId: "hab_01",
      x: 0,
      z: 0,
      rotation: 0,
      active: true,
    }],
  };
  const next = simulateTick(state, 1);

  assert.equal(next.structures[0].active, false);
  assert.ok(next.alerts.some((alert) => alert.id === "brownout" && alert.severity === "critical"));

  const crossing = simulateTick({
    ...INITIAL_COLONY_STATE,
    resources: { ...INITIAL_COLONY_STATE.resources, energy: 0.1 },
    structures: [{ ...state.structures[0], active: true }],
  }, 1);
  assert.equal(crossing.resources.energy, 0);
  assert.equal(crossing.structures[0].active, false);
  assert.ok(crossing.alerts.some((alert) => alert.id === "brownout"));
});

test("oxygen at zero for one SOL fails the mission", () => {
  const state = {
    ...INITIAL_COLONY_STATE,
    resources: { ...INITIAL_COLONY_STATE.resources, oxygen: 0 },
    oxygenZeroSeconds: 44,
  };
  const next = simulateTick(state, 1);

  assert.equal(next.missionStatus, "failed");
  assert.match(next.failureReason, /oxygen/i);
});

test("food at zero for two SOLs fails the mission", () => {
  const state = {
    ...INITIAL_COLONY_STATE,
    resources: { ...INITIAL_COLONY_STATE.resources, food: 0 },
    foodZeroSeconds: 89,
  };
  const next = simulateTick(state, 1);

  assert.equal(next.missionStatus, "failed");
  assert.match(next.failureReason, /food/i);
});

test("a colony with no construction eventually fails from oxygen depletion", () => {
  let state = INITIAL_COLONY_STATE;
  for (let second = 0; second < 450 && state.missionStatus === "playing"; second += 1) {
    state = simulateTick(state, 1);
  }

  assert.equal(state.missionStatus, "failed");
  assert.match(state.failureReason, /oxygen/i);
  assert.ok(state.sol >= 7 && state.sol <= 8);
});

test("construction validates affordability, bounds, overlap and charges exactly once", () => {
  const insufficient = {
    ...INITIAL_COLONY_STATE,
    resources: { ...INITIAL_COLONY_STATE.resources, materials: 149 },
  };
  assert.equal(validatePlacement(insufficient, "hab_01", 0, 0).ok, false);
  assert.equal(validatePlacement(INITIAL_COLONY_STATE, "hab_01", 251, 0).ok, false);

  const placed = commitStructure(INITIAL_COLONY_STATE, "hab_01", 0, 0, 0, "hab-1");
  assert.equal(placed.result.ok, true);
  assert.equal(placed.state.resources.materials, 2850);
  assert.equal(placed.state.structures.length, 1);

  const duplicate = commitStructure(placed.state, "solar_farm", 0, 0, 0, "solar-1");
  assert.equal(duplicate.result.ok, false);
  assert.equal(duplicate.state.resources.materials, 2850);
  assert.equal(duplicate.state.structures.length, 1);
});

test("Zustand placement commits once and retry resets mission state", () => {
  const store = useColonyStore.getState();
  store.resetMission();

  const first = useColonyStore.getState().placeStructure("solar_farm", 0, 0, 0);
  const duplicate = useColonyStore.getState().placeStructure("solar_farm", 0, 0, 0);
  assert.equal(first.ok, true);
  assert.equal(duplicate.ok, false);
  assert.equal(useColonyStore.getState().resources.materials, 2900);
  assert.equal(useColonyStore.getState().structures.length, 1);

  useColonyStore.getState().setSpeed(3);
  useColonyStore.getState().setPaused(true);
  useColonyStore.getState().skipSol();
  assert.equal(useColonyStore.getState().sol, 2);
  assert.equal(useColonyStore.getState().simulationStatus, "paused");

  useColonyStore.getState().resetMission();
  assert.equal(useColonyStore.getState().structures.length, 0);
  assert.equal(useColonyStore.getState().resources.materials, 3000);
  assert.equal(useColonyStore.getState().speed, 1);
  assert.equal(useColonyStore.getState().simulationStatus, "running");
});

test("the guided mission build path can reach SOL 6 victory", () => {
  let state = INITIAL_COLONY_STATE;
  const buildOrder = [
    "solar_farm",
    "hab_01",
    "oxygen_generator",
    "greenhouse",
    "solar_farm",
    "comms_tower",
  ];

  buildOrder.forEach((structureId, index) => {
    const result = commitStructure(state, structureId, index * 10, 0, 0, `build-${index}`);
    assert.equal(result.result.ok, true, result.result.reason);
    state = result.state;
  });

  for (let second = 0; second < 225; second += 1) {
    state = simulateTick(state, 1);
    if (state.missionStatus !== "playing") break;
  }

  assert.equal(state.sol, 6);
  assert.equal(state.missionStatus, "victory");
  assert.ok(state.resources.materials > 0);
});
