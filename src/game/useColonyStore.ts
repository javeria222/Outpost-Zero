import { create } from "zustand";
import {
  BUILD_RADIUS,
  INITIAL_COLONY_STATE,
  SOL_DURATION,
  STRUCTURE_CATALOGUE,
  WORLD_BOUND,
  simulateTick,
  type ColonyState,
  type StructureId,
} from "./simulateTick";

export { BUILD_RADIUS, WORLD_BOUND };

export type PlacementResult = {
  ok: boolean;
  reason?: string;
};

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
    if (state.missionStatus !== "playing") {
      return { ok: false, reason: "Simulation is not in active play state." };
    }

    const definition = STRUCTURE_CATALOGUE[structureId];
    if (!definition) {
      return { ok: false, reason: `Unknown structure type: ${structureId}` };
    }

    // Affordability validation
    if (state.resources.materials < definition.buildCost.materials) {
      return {
        ok: false,
        reason: `Insufficient materials. ${definition.name} requires ${definition.buildCost.materials} MAT.`,
      };
    }

    // World boundary validation
    if (Math.abs(x) > WORLD_BOUND || Math.abs(z) > WORLD_BOUND) {
      return {
        ok: false,
        reason: "Placement out of bounds: Outpost perimeter exceeded.",
      };
    }

    // Collision & proximity validation
    const overlap = state.structures.some(
      (s) => Math.hypot(s.x - x, s.z - z) < BUILD_RADIUS,
    );
    if (overlap) {
      return {
        ok: false,
        reason: "Invalid placement: structure overlaps with existing module.",
      };
    }

    // Generate stable unique instance ID
    const instanceId =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${structureId}-${Date.now()}-${state.structures.length}`;

    const newStructure = {
      instanceId,
      structureId,
      x,
      z,
      rotation,
      active: true,
    };

    set({
      resources: {
        ...state.resources,
        materials: state.resources.materials - definition.buildCost.materials,
      },
      structures: [...state.structures, newStructure],
    });

    return { ok: true };
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
    // Advance by 1 full SOL in 0.25s clamped steps for determinism
    let current: ColonyState = get();
    const steps = SOL_DURATION / 0.25;
    for (let i = 0; i < steps; i++) {
      current = simulateTick(current, 0.25);
      if (current.missionStatus !== "playing") break;
    }
    set(current);
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
