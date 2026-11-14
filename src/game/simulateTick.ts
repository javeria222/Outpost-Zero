import type { BuildingType } from "./colonySimulation";

export const SOL_DURATION = 45; // 1 SOL = 45 real seconds at 1x
export const CREW_SIZE = 4;
export const CREW_OXYGEN_DEMAND_PER_SOL = 32; // 8 per crew
export const CREW_FOOD_DEMAND_PER_SOL = 24;   // 6 per crew
export const BUILD_RADIUS = 3.5;
export const WORLD_BOUND = 45;

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
    name: "Solar Array",
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
    meshType: "battery", // mapped to battery mesh in BuildMode
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

export const INITIAL_COLONY_STATE: ColonyState = {
  sol: 1,
  elapsedSeconds: 0,
  resources: {
    oxygen: 200,
    energy: 100,
    food: 150,
    materials: 800,
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

  // Delta clamping: prevent massive tick steps from tab backgrounding
  const dt = Math.max(0, Math.min(deltaSeconds, 0.25));
  if (dt <= 0) return state;

  const nextElapsed = state.elapsedSeconds + dt;
  const nextSol = Math.floor(nextElapsed / SOL_DURATION) + 1;

  // Determine current active status and brownout
  const rates = calculateNetRates(state.structures);

  // Brownout check: if energy <= 0 and demand > 0
  const isBrownout = state.resources.energy <= 0 && rates.energyDemand > 0;

  // Update structure active states immutably
  let structuresChanged = false;
  const nextStructures = state.structures.map((s) => {
    const def = STRUCTURE_CATALOGUE[s.structureId];
    const shouldBeActive = def.category === "power" || !isBrownout;
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

  const nextEnergy = Math.max(0, Math.min(300, state.resources.energy + dEnergy));
  const nextOxygen = Math.max(0, Math.min(500, state.resources.oxygen + dOxygen));
  const nextFood = Math.max(0, Math.min(500, state.resources.food + dFood));

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
  } else if (nextOxygen < 50) {
    newAlerts.push({
      id: "low-oxygen",
      system: "oxygen",
      severity: "warning",
      reason: "Oxygen reserves below 25% buffer. Increase generation.",
    });
  }

  // Energy & Brownout alerts
  if (isBrownout) {
    newAlerts.push({
      id: "brownout",
      system: "energy",
      severity: "critical",
      reason: "Colony brownout: Power grid depleted. Non-solar systems offline.",
    });
  } else if (nextEnergy < 25) {
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
  } else if (nextFood < 37.5) {
    newAlerts.push({
      id: "low-food",
      system: "food",
      severity: "warning",
      reason: "Food reserves below 25% buffer. Construct a greenhouse.",
    });
  }

  // Habitat shelter warning
  if (activeRates.habitatCapacity < CREW_SIZE) {
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
    const hasShelter = activeRates.habitatCapacity >= CREW_SIZE;
    const hasComms = nextStructures.some(
      (s) => s.structureId === "comms_tower" && s.active,
    );
    const noStarvationOrAsphyxiation =
      nextOxygen > 0 && nextEnergy > 0 && nextFood > 0;

    if (hasShelter && hasComms && noStarvationOrAsphyxiation) {
      missionStatus = "victory";
    } else {
      missionStatus = "failed";
      failureReason = !hasShelter
        ? "Colony failed: Outpost survived 5 Sols but lacked adequate crew shelter."
        : !hasComms
          ? "Colony failed: Earth contact could not be verified (no active Comms Tower)."
          : "Colony failed: Sol 6 reached with one or more critical resource deficits.";
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
    structures: nextStructures,
    alerts: newAlerts,
    alertHistory: nextAlertHistory,
    missionStatus,
    failureReason,
    oxygenZeroSeconds: nextOxygenZeroSeconds,
    foodZeroSeconds: nextFoodZeroSeconds,
  };
}
