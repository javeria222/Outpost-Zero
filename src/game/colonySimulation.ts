
export type BuildingType =
  | "habitat"
  | "solar"
  | "lifeSupport"
  | "greenhouse"
  | "waterRecycler"
  | "shielding"
  | "battery";

export type Resources = {
  power: number;
  oxygen: number;
  water: number;
  food: number;
  materials: number;
  credits: number;
};

export type BuildingDefinition = {
  id: BuildingType;
  name: string;
  description: string;
  cost: number;
  power: number;
  oxygen: number;
  water: number;
  food: number;
  maxHealth: number;
};

export type PlacedBuilding = {
  instanceId: string;
  type: BuildingType;
  x: number;
  z: number;
  rotation: number;
  health: number;
};

export type ColonyState = {
  sol: number;
  resources: Resources;
  buildings: PlacedBuilding[];
  event: string | null;
  eventLog: string[];
  status: "building" | "survived" | "failed";
  lastReport: string;
};

export const BUILDINGS: Record<BuildingType, BuildingDefinition> = {
  habitat: {
    id: "habitat",
    name: "Habitat Module",
    description: "Provides crew accommodation and basic colony capacity.",
    cost: 100,
    power: -2,
    oxygen: -1,
    water: -1,
    food: -1,
    maxHealth: 100,
  },
  solar: {
    id: "solar",
    name: "Solar Array",
    description: "Generates electricity. Output drops during dust storms.",
    cost: 100,
    power: 12,
    oxygen: 0,
    water: 0,
    food: 0,
    maxHealth: 100,
  },
  lifeSupport: {
    id: "lifeSupport",
    name: "Life Support",
    description: "Produces breathable oxygen for the crew.",
    cost: 140,
    power: -4,
    oxygen: 8,
    water: -1,
    food: 0,
    maxHealth: 100,
  },
  greenhouse: {
    id: "greenhouse",
    name: "Hydroponic Greenhouse",
    description: "Produces food but requires power and water.",
    cost: 120,
    power: -3,
    oxygen: 1,
    water: -3,
    food: 7,
    maxHealth: 100,
  },
  waterRecycler: {
    id: "waterRecycler",
    name: "Water Recycler",
    description: "Recovers water from colony waste streams.",
    cost: 90,
    power: -2,
    oxygen: 0,
    water: 6,
    food: 0,
    maxHealth: 100,
  },
  shielding: {
    id: "shielding",
    name: "Radiation Shielding",
    description: "Improves habitat protection during radiation events.",
    cost: 120,
    power: 0,
    oxygen: 0,
    water: 0,
    food: 0,
    maxHealth: 100,
  },
  battery: {
    id: "battery",
    name: "Energy Storage",
    description: "Adds reserve capacity for periods of low generation.",
    cost: 80,
    power: 0,
    oxygen: 0,
    water: 0,
    food: 0,
    maxHealth: 100,
  },
};

const INITIAL_RESOURCES: Resources = {
  power: 24,
  oxygen: 35,
  water: 35,
  food: 35,
  materials: 100,
  credits: 600,
};

export function createNewColony(): ColonyState {
  return {
    sol: 1,
    resources: { ...INITIAL_RESOURCES },
    buildings: [],
    event: null,
    eventLog: [
      "SOL 01 — Colony deployment initiated.",
      "Establish essential infrastructure.",
    ],
    status: "building",
    lastReport: "Awaiting construction orders.",
  };
}

function addLog(state: ColonyState, message: string): string[] {
  return [...state.eventLog, `SOL ${String(state.sol).padStart(2, "0")} — ${message}`]
    .slice(-12);
}

export function constructBuilding(
  state: ColonyState,
  type: BuildingType,
  x: number,
  z: number,
  rotation = 0,
): ColonyState {
  if (state.status !== "building") return state;

  const definition = BUILDINGS[type];

  if (state.resources.credits < definition.cost) {
    return {
      ...state,
      lastReport: `Insufficient credits. ${definition.name} costs ${definition.cost} CR.`,
    };
  }

  // Keep buildings separated so the placement system cannot overlap them.
  const occupied = state.buildings.some((building) => {
    const dx = building.x - x;
    const dz = building.z - z;
    return Math.hypot(dx, dz) < 3.5;
  });

  if (occupied) {
    return {
      ...state,
      lastReport: "Invalid placement: another structure is too close.",
    };
  }

  const building: PlacedBuilding = {
    instanceId: `${type}-${Date.now()}-${state.buildings.length}`,
    type,
    x,
    z,
    rotation,
    health: definition.maxHealth,
  };

  return {
    ...state,
    resources: {
      ...state.resources,
      credits: state.resources.credits - definition.cost,
    },
    buildings: [...state.buildings, building],
    eventLog: addLog(state, `Constructed ${definition.name}.`),
    lastReport: `${definition.name} constructed for ${definition.cost} CR.`,
  };
}

export function advanceSol(state: ColonyState): ColonyState {
  if (state.status !== "building") return state;

  const nextSol = state.sol + 1;
  const next: ColonyState = {
    ...state,
    sol: nextSol,
    resources: { ...state.resources },
    event: null,
  };

  const log = (message: string) => {
    next.eventLog = addLog(next, message);
  };

  // Environmental events affect the actual resource simulation.
  if (nextSol === 8) {
    next.event = "DUST STORM";
    log("Dust storm: solar generation reduced by 60% this sol.");
  } else if (nextSol === 15) {
    next.event = "WATER LEAK";
    next.resources.water = Math.max(0, next.resources.water - 12);
    log("Water leak: 12 water units lost.");
  } else if (nextSol === 22) {
    next.event = "GRID FAULT";
    next.resources.power = Math.max(0, next.resources.power - 10);
    log("Power-grid fault: 10 stored power units lost.");
  }

  let powerGeneration = 0;
  let powerDemand = 0;
  let oxygenChange = 0;
  let waterChange = 0;
  let foodChange = 0;

  for (const building of next.buildings) {
    if (building.health <= 0) continue;

    const definition = BUILDINGS[building.type];
    const healthFactor = building.health / definition.maxHealth;

    if (definition.power > 0) {
      powerGeneration += definition.power * healthFactor;
    } else {
      powerDemand += Math.abs(definition.power) * healthFactor;
    }

    oxygenChange += definition.oxygen * healthFactor;
    waterChange += definition.water * healthFactor;
    foodChange += definition.food * healthFactor;
  }

  if (next.event === "DUST STORM") {
    powerGeneration *= 0.4;
  }

  const netPower = powerGeneration - powerDemand;
  next.resources.power = Math.max(
    0,
    Math.min(100, next.resources.power + netPower),
  );

  // If power reaches zero, powered systems cannot operate normally.
  if (next.resources.power === 0 && powerDemand > 0) {
    oxygenChange = Math.min(0, oxygenChange);
    foodChange = Math.min(0, foodChange);
  }

  next.resources.oxygen = Math.max(
    0,
    Math.min(100, next.resources.oxygen + oxygenChange),
  );

  next.resources.water = Math.max(
    0,
    Math.min(100, next.resources.water + waterChange),
  );

  next.resources.food = Math.max(
    0,
    Math.min(100, next.resources.food + foodChange),
  );

  const shortages: string[] = [];

  if (next.resources.power === 0) shortages.push("power");
  if (next.resources.oxygen === 0) shortages.push("oxygen");
  if (next.resources.water === 0) shortages.push("water");
  if (next.resources.food === 0) shortages.push("food");

  if (shortages.length > 0) {
    next.status = "failed";
    next.lastReport = `Mission failed: critical shortage of ${shortages.join(", ")}.`;
    log(next.lastReport);
    return next;
  }

  if (nextSol >= 30) {
    const essentialBuildingsExist =
      next.buildings.some((b) => b.type === "habitat") &&
      next.buildings.some((b) => b.type === "solar") &&
      next.buildings.some((b) => b.type === "lifeSupport");

    if (essentialBuildingsExist) {
      next.status = "survived";
      next.lastReport = "Mission complete: the colony survived through Sol 30.";
      log(next.lastReport);
    } else {
      next.status = "failed";
      next.lastReport =
        "Mission failed: essential habitat, power, and life-support infrastructure is incomplete.";
      log(next.lastReport);
    }

    return next;
  }

  next.lastReport = shortages.length
    ? `Warning: low resources — ${shortages.join(", ")}.`
    : `Sol ${nextSol} simulation complete.`;

  log(next.lastReport);
  return next;
}
