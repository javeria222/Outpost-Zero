import { create } from "zustand";
import {
  BUILD_RADIUS,
  commitStructure,
  INITIAL_COLONY_STATE,
  SOL_DURATION,
  validatePlacement,
  WORLD_BOUND,
  simulateTick,
  type ColonyState,
  type PlacementResult,
  type StructureId,
} from "./simulateTick.ts";

export { BUILD_RADIUS, WORLD_BOUND };
export type { PlacementResult };

export type ColonyStore = ColonyState & {
  placeStructure: (
    structureId: StructureId,
    x: number,
    z: number,
    rotation: number,
  ) => PlacementResult;
  tick: (deltaSeconds: number) => void;
  setSpeed: (speed: 1 | 3) => void;
  setPaused: (paused: boolean) => void;
  togglePaused: () => void;
  skipSol: () => void;
  resetMission: () => void;
  markBuildModeOpened: () => void;
};

export const useColonyStore = create<ColonyStore>((set, get) => ({
  ...INITIAL_COLONY_STATE,

  placeStructure: (structureId, x, z, rotation) => {
    const state = get();
    const validation = validatePlacement(state, structureId, x, z);
    if (!validation.ok) return validation;

    // Generate stable unique instance ID
    const instanceId =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${structureId}-${Date.now()}-${state.structures.length}`;

    const committed = commitStructure(state, structureId, x, z, rotation, instanceId);
    if (committed.result.ok) set(committed.state);
    return committed.result;
  },

  tick: (deltaSeconds) => {
    const current = get();
    if (current.simulationStatus !== "running" || current.missionStatus !== "playing") {
      return;
    }
    const next = simulateTick(current, deltaSeconds);
    set({ ...next });
  },

  setSpeed: (speed) => set({ speed }),

  setPaused: (paused) =>
    set({ simulationStatus: paused ? "paused" : "running" }),

  togglePaused: () =>
    set((state) => ({
      simulationStatus: state.simulationStatus === "running" ? "paused" : "running",
    })),

  skipSol: () => {
    // Advance by one full SOL using the same fixed one-second simulation step.
    const initial = get();
    let current: ColonyState = {
      ...initial,
      simulationStatus: "running",
    };
    const steps = SOL_DURATION;
    for (let i = 0; i < steps; i++) {
      current = simulateTick(current, 1);
      if (current.missionStatus !== "playing") break;
    }
    set({ ...current, simulationStatus: initial.simulationStatus });
  },

  resetMission: () => {
    set({
      ...INITIAL_COLONY_STATE,
      structures: [],
      alerts: [],
      alertHistory: [],
    });
  },

  markBuildModeOpened: () => set({ buildModeOpenedOnce: true }),
}));
