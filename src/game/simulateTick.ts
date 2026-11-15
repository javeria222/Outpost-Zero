import type { BuildingType } from "./colonySimulation";

export const SOL_DURATION = 45; // 1 SOL = 45 real seconds at 1x
export const CREW_SIZE = 4;
export const CREW_OXYGEN_DEMAND_PER_SOL = 32; // 8 per crew
export const CREW_FOOD_DEMAND_PER_SOL = 24;   // 6 per crew
export const BUILD_RADIUS = 3.5;
export const WORLD_BOUND = 250;
export const RESOURCE_CAPACITY = {
  oxygen: 500,
  energy: 300,
  food: 500,
  materials: 800,
} as const;

export type ResourceId = "oxygen" | "energy" | "food" | "materials";

export type Resources = {
  oxygen: number;
  energy: number;
  food: number;
  materials: number;
};

export type StructureId =
  | "hab_01"
  | "hab_02"
  | "solar_farm"
  | "comms_tower"
  | "oxygen_generator"
  | "greenhouse";

export type StructureDefinition = {
  id: StructureId;
  name: string;
  description: string;
  category: "habitat" | "power" | "communications" | "life_support" | "food";
  buildCost: { materials: number };
  meshType: BuildingType;
  effects: {
    energyProduction?: number;   // per SOL
    energyConsumption?: number;  // per SOL
    oxygenProduction?: number;   // per SOL
    oxygenConsumption?: number;  // per SOL
    foodProduction?: number;     // per SOL
    foodConsumption?: number;    // per SOL
    habitatCapacity?: number;
  };
  visibleInMenu: boolean;
};

export const STRUCTURE_CATALOGUE: Record<StructureId, StructureDefinition> = {
  hab_01: {
    id: "hab_01",
    name: "HAB-01 Primary Habitat",
    description: "Pressurized habitat module supporting up to 4 junior astronauts.",
    category: "habitat",
    buildCost: { materials: 150 },
    meshType: "habitat",
    effects: {
      habitatCapacity: 4,
      energyConsumption: 10,
    },
    visibleInMenu: true,
  },
  hab_02: {
    id: "hab_02",
    name: "HAB-02 Expansion Habitat",
    description: "Expanded quarters providing additional capacity for 6 crew.",
    category: "habitat",
    buildCost: { materials: 250 },
    meshType: "habitat",
    effects: {
      habitatCapacity: 6,
      energyConsumption: 15,
    },
    visibleInMenu: true,
  },
  solar_farm: {
    id: "solar_farm",
    name: "Solar Farm",
    description: "Photovoltaic farm harvesting Martian sunlight to generate 40 kW/SOL.",
    category: "power",
    buildCost: { materials: 100 },
    meshType: "solar",
    effects: {
      energyProduction: 40,
    },
    visibleInMenu: true,
  },
  comms_tower: {
    id: "comms_tower",
    name: "Communications Tower",
    description: "High-gain antenna array establishing telemetry relay with Earth Mission Control.",
    category: "communications",
    buildCost: { materials: 80 },
    meshType: "battery", // communications antenna visual in BuildMode
    effects: {
      energyConsumption: 8,
    },
    visibleInMenu: true,
  },
  oxygen_generator: {
    id: "oxygen_generator",
    name: "MOXIE Oxygen Generator",
    description: "Extracts breathable oxygen from atmospheric CO2 for life support.",
    category: "life_support",
    buildCost: { materials: 150 },
    meshType: "lifeSupport",
    effects: {
      oxygenProduction: 40,
      energyConsumption: 25,
    },
    visibleInMenu: true,
  },
  greenhouse: {
    id: "greenhouse",
    name: "Hydroponic Greenhouse",
    description: "Closed-loop hydroponic bays growing fresh spirulina and microgreens.",
    category: "food",
    buildCost: { materials: 200 },
    meshType: "greenhouse",
    effects: {
      foodProduction: 30,
      energyConsumption: 15,
    },
    visibleInMenu: true,
  },
};

export type PlacedStructure = {
  instanceId: string;
  structureId: StructureId;
  x: number;
  z: number;
  rotation: number;
  active: boolean;
};

export type AlertSeverity = "info" | "warning" | "critical";

export type ColonyAlert = {
  id: string; // stable identifier
  system: ResourceId | "construction";
  severity: AlertSeverity;
  reason: string;
};

export type MissionStatus = "playing" | "victory" | "failed";

export type ColonyState = {
  sol: number;
  elapsedSeconds: number;
  resources: Resources;
  structures: PlacedStructure[];
  alerts: ColonyAlert[];
  alertHistory: ColonyAlert[];
  missionStatus: MissionStatus;
  simulationStatus: "running" | "paused";
  speed: 1 | 3;
  failureReason?: string;
  oxygenZeroSeconds: number;
  foodZeroSeconds: number;
  buildModeOpenedOnce: boolean;
};

export type PlacementResult = { ok: boolean; reason?: string };

export const INITIAL_COLONY_STATE: ColonyState = {
  sol: 1,
  elapsedSeconds: 0,
  resources: {
    oxygen: 200,
    energy: 100,
    food: 150,
    materials: 3000,
  },
  structures: [],
  alerts: [],
  alertHistory: [],
  missionStatus: "playing",
  simulationStatus: "running",
  speed: 1,
  oxygenZeroSeconds: 0,
  foodZeroSeconds: 0,
  buildModeOpenedOnce: false,
};

export function validatePlacement(
  state: ColonyState,
  structureId: StructureId,
  x: number,
  z: number,
): PlacementResult {
  if (state.missionStatus !== "playing") {
    return { ok: false, reason: "Simulation is not in active play state." };
  }

  const definition = STRUCTURE_CATALOGUE[structureId];
  if (!definition) {
    return { ok: false, reason: `Unknown structure type: ${structureId}` };
  }
  if (state.resources.materials < definition.buildCost.materials) {
    return {
      ok: false,
      reason: `Insufficient materials. ${definition.name} requires ${definition.buildCost.materials} MAT.`,
    };
  }
  if (!Number.isFinite(x) || !Number.isFinite(z) || Math.abs(x) > WORLD_BOUND || Math.abs(z) > WORLD_BOUND) {
    return { ok: false, reason: "Placement out of bounds: Outpost perimeter exceeded." };
  }
  if (state.structures.some((item) => Math.hypot(item.x - x, item.z - z) < BUILD_RADIUS)) {
    return { ok: false, reason: "Invalid placement: structure overlaps with existing module." };
  }

  return { ok: true };
}

export function commitStructure(
  state: ColonyState,
  structureId: StructureId,
  x: number,
  z: number,
  rotation: number,
  instanceId: string,
): { state: ColonyState; result: PlacementResult } {
  const result = validatePlacement(state, structureId, x, z);
  if (!result.ok) return { state, result };

  const definition = STRUCTURE_CATALOGUE[structureId];
  return {
    state: {
      ...state,
      resources: {
        ...state.resources,
        materials: state.resources.materials - definition.buildCost.materials,
      },
      structures: [
        ...state.structures,
        { instanceId, structureId, x, z, rotation, active: true },
      ],
    },
    result,
  };
}

/**
 * Calculates current rates per SOL based on placed active structures and crew demand.
 */
export function calculateNetRates(structures: PlacedStructure[]) {
  let energyProduction = 0;
  let energyDemand = 0;
  let oxygenProduction = 0;
  let foodProduction = 0;
  let habitatCapacity = 0;

  for (const item of structures) {
    const def = STRUCTURE_CATALOGUE[item.structureId];
    if (!def) continue;

    // Solar produces even during brownout; other structures only produce/consume if active
    if (def.category === "power") {
      energyProduction += def.effects.energyProduction ?? 0;
    } else if (item.active) {
      energyDemand += def.effects.energyConsumption ?? 0;
      oxygenProduction += def.effects.oxygenProduction ?? 0;
      foodProduction += def.effects.foodProduction ?? 0;
      habitatCapacity += def.effects.habitatCapacity ?? 0;
    }
  }

  const netEnergyPerSol = energyProduction - energyDemand;
  const netOxygenPerSol = oxygenProduction - CREW_OXYGEN_DEMAND_PER_SOL;
  const netFoodPerSol = foodProduction - CREW_FOOD_DEMAND_PER_SOL;

  return {
    energyProduction,
    energyDemand,
    netEnergyPerSol,
    oxygenProduction,
    crewOxygenDemand: CREW_OXYGEN_DEMAND_PER_SOL,
    netOxygenPerSol,
    foodProduction,
    crewFoodDemand: CREW_FOOD_DEMAND_PER_SOL,
    netFoodPerSol,
    habitatCapacity,
  };
}

/**
 * Pure simulation tick update function.
 * Evaluates production, consumption, brownout, alert state, and win/fail rules.
 */
export function simulateTick(
  state: ColonyState,
  deltaSeconds: number,
): ColonyState {
  if (state.missionStatus !== "playing" || state.simulationStatus !== "running") {
    return state;
  }

  // The app supplies one-second fixed steps; reject larger external steps.
  const dt = Math.max(0, Math.min(deltaSeconds, 1));
  if (dt <= 0) return state;

  const nextElapsed = state.elapsedSeconds + dt;
  const nextSol = Math.floor(nextElapsed / SOL_DURATION) + 1;

  // Determine current active status and brownout
  const rates = calculateNetRates(state.structures);

  // Systems resume once stored energy is above zero; a depleted grid browns out.
  const brownoutAtStart = state.resources.energy <= 0 && rates.energyDemand > 0;

  // Update structure active states immutably
  let structuresChanged = false;
  const nextStructures = state.structures.map((s) => {
    const def = STRUCTURE_CATALOGUE[s.structureId];
    const shouldBeActive = def.category === "power" || !brownoutAtStart;
    if (s.active !== shouldBeActive) {
      structuresChanged = true;
      return { ...s, active: shouldBeActive };
    }
    return s;
  });

  // Re-calculate with updated structure activity if status shifted
  const activeRates = structuresChanged ? calculateNetRates(nextStructures) : rates;

  // Resource deltas applied per second (rate / 45)
  const dEnergy = (activeRates.netEnergyPerSol / SOL_DURATION) * dt;
  const dOxygen = (activeRates.netOxygenPerSol / SOL_DURATION) * dt;
  const dFood = (activeRates.netFoodPerSol / SOL_DURATION) * dt;

  const nextEnergy = Math.max(0, Math.min(RESOURCE_CAPACITY.energy, state.resources.energy + dEnergy));
  const nextOxygen = Math.max(0, Math.min(RESOURCE_CAPACITY.oxygen, state.resources.oxygen + dOxygen));
  const nextFood = Math.max(0, Math.min(RESOURCE_CAPACITY.food, state.resources.food + dFood));
  const brownoutActive =
    nextEnergy <= 0 && (activeRates.energyDemand > 0 || brownoutAtStart);
  const finalStructures = brownoutActive
    ? nextStructures.map((structure) => {
        const def = STRUCTURE_CATALOGUE[structure.structureId];
        return def.category === "power" || !structure.active
          ? structure
          : { ...structure, active: false };
      })
    : nextStructures;
  const stateRates = calculateNetRates(finalStructures);

  // Track time at zero for failure criteria (Spec 17.3)
  const nextOxygenZeroSeconds =
    nextOxygen === 0 ? state.oxygenZeroSeconds + dt : 0;
  const nextFoodZeroSeconds =
    nextFood === 0 ? state.foodZeroSeconds + dt : 0;

  // Evaluate Alerts (Stable IDs)
  const newAlerts: ColonyAlert[] = [];

  // Oxygen alerts
  if (nextOxygen === 0) {
    newAlerts.push({
      id: "critical-oxygen",
      system: "oxygen",
      severity: "critical",
      reason: "Atmospheric oxygen exhausted! Life support failing.",
    });
  } else if (nextOxygen < RESOURCE_CAPACITY.oxygen * 0.25) {
    newAlerts.push({
      id: "low-oxygen",
      system: "oxygen",
      severity: "warning",
      reason: "Oxygen reserves below 25% buffer. Increase generation.",
    });
  }

  // Energy & Brownout alerts
  if (brownoutActive) {
    newAlerts.push({
      id: "brownout",
      system: "energy",
      severity: "critical",
      reason: "Colony brownout: Power grid depleted. Non-solar systems offline.",
    });
  } else if (nextEnergy < RESOURCE_CAPACITY.energy * 0.25) {
    newAlerts.push({
      id: "low-energy",
      system: "energy",
      severity: "warning",
      reason: "Energy storage low. Expand solar array to prevent brownout.",
    });
  }

  // Food alerts
  if (nextFood === 0) {
    newAlerts.push({
      id: "critical-food",
      system: "food",
      severity: "critical",
      reason: "Food rations depleted! Crew starvation imminent.",
    });
  } else if (nextFood < RESOURCE_CAPACITY.food * 0.25) {
    newAlerts.push({
      id: "low-food",
      system: "food",
      severity: "warning",
      reason: "Food reserves below 25% buffer. Construct a greenhouse.",
    });
  }

  // Construction reserves
  if (state.resources.materials === 0) {
    newAlerts.push({
      id: "critical-materials",
      system: "materials",
      severity: "critical",
      reason: "Construction materials are exhausted. The outpost cannot build more infrastructure.",
    });
  } else if (state.resources.materials < RESOURCE_CAPACITY.materials * 0.25) {
    newAlerts.push({
      id: "low-materials",
      system: "materials",
      severity: "warning",
      reason: "Construction reserves are below 25%. Prioritize the remaining materials.",
    });
  }

  // Habitat shelter warning
  if (stateRates.habitatCapacity < CREW_SIZE) {
    newAlerts.push({
      id: "no-shelter",
      system: "construction",
      severity: "warning",
      reason: "Crew shelter deficit: Available habitat capacity is under 4 crew.",
    });
  }

  // Accumulate unique alert history for debriefing screen
  const nextAlertHistory = [...state.alertHistory];
  for (const alert of newAlerts) {
    if (!nextAlertHistory.some((h) => h.id === alert.id)) {
      nextAlertHistory.push(alert);
    }
  }

  // Evaluate Win / Lose conditions (Spec Section 17.3)
  let missionStatus: MissionStatus = "playing";
  let failureReason: string | undefined = undefined;

  // Failure: Oxygen at 0 for 1 SOL (45 seconds)
  if (nextOxygenZeroSeconds >= SOL_DURATION) {
    missionStatus = "failed";
    failureReason = "Critical life support failure: Outpost ran out of oxygen for a full Sol.";
  }
  // Failure: Food at 0 for 2 SOLs (90 seconds)
  else if (nextFoodZeroSeconds >= SOL_DURATION * 2) {
    missionStatus = "failed";
    failureReason = "Mission compromised: Outpost food rations were exhausted for over 2 Sols.";
  }
  // Victory: Reach SOL 6 with capacity >= 4, comms tower active, and no resource at 0
  else if (nextSol >= 6) {
    const hasShelter = stateRates.habitatCapacity >= CREW_SIZE;
    const hasComms = finalStructures.some(
      (s) => s.structureId === "comms_tower" && s.active,
    );
    const noEmptyResources =
      nextOxygen > 0 &&
      nextEnergy > 0 &&
      nextFood > 0 &&
      state.resources.materials > 0;

    if (hasShelter && hasComms && noEmptyResources) {
      missionStatus = "victory";
    }
  }

  return {
    ...state,
    sol: nextSol,
    elapsedSeconds: nextElapsed,
    resources: {
      oxygen: nextOxygen,
      energy: nextEnergy,
      food: nextFood,
      materials: state.resources.materials,
    },
    structures: finalStructures,
    alerts: newAlerts,
    alertHistory: nextAlertHistory,
    missionStatus,
    failureReason,
    oxygenZeroSeconds: nextOxygenZeroSeconds,
    foodZeroSeconds: nextFoodZeroSeconds,
  };
}
