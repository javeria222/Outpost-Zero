import {
  calculateNetRates,
  type ColonyState,
} from "./simulateTick";

export type MissionObjective = {
  id: string;
  stepNumber: string;
  title: string;
  whyThisMatters: string;
  hint: string;
  isCompleted: (state: ColonyState) => boolean;
};

export const MISSION_OBJECTIVES: MissionObjective[] = [
  {
    id: "open-build-menu",
    stepNumber: "01",
    title: "Open the Construction Menu",
    whyThisMatters:
      "Establishing infrastructure is the first duty of a surface expedition commander.",
    hint: "Click the 'ENTER BUILD MODE' button in the right-hand panel.",
    isCompleted: (state) => state.buildModeOpenedOnce,
  },
  {
    id: "build-solar",
    stepNumber: "02",
    title: "Build a Solar Farm",
    whyThisMatters:
      "All colony life support depends on power. Photovoltaic arrays provide essential daytime electricity.",
    hint: "Select Solar Farm (100 MAT) in the construction dropdown and place it on open ground.",
    isCompleted: (state) =>
      state.structures.some((s) => s.structureId === "solar_farm" && s.active),
  },
  {
    id: "build-hab",
    stepNumber: "03",
    title: "Construct HAB-01 Primary Habitat",
    whyThisMatters:
      "Astronauts cannot survive in suits indefinitely; pressurized shelter is required for the 4-person crew.",
    hint: "Select HAB-01 (150 MAT) and place it on open ground.",
    isCompleted: (state) => {
      const rates = calculateNetRates(state.structures);
      return rates.habitatCapacity >= 4;
    },
  },
  {
    id: "build-oxygen",
    stepNumber: "04",
    title: "Deploy an Oxygen Generator",
    whyThisMatters:
      "Mars has no breathable air. MOXIE technology extracts vital oxygen from atmospheric CO2.",
    hint: "Select 'MOXIE Oxygen Generator' (150 MAT) to counter the 32 O2/SOL crew demand.",
    isCompleted: (state) =>
      state.structures.some(
        (s) => s.structureId === "oxygen_generator" && s.active,
      ),
  },
  {
    id: "build-greenhouse",
    stepNumber: "05",
    title: "Establish a Hydroponic Greenhouse",
    whyThisMatters:
      "Ration packs run out. Closed-loop hydroponics ensure long-term crew nutrition.",
    hint: "Select 'Hydroponic Greenhouse' (200 MAT) to produce +30 Food per Sol.",
    isCompleted: (state) =>
      state.structures.some((s) => s.structureId === "greenhouse" && s.active),
  },
  {
    id: "balance-energy",
    stepNumber: "06",
    title: "Balance the Power Grid (Net ≥ 0)",
    whyThisMatters:
      "Multiple active facilities consume power. If battery storage empties, life support enters brownout.",
    hint: "Build a second Solar Farm so your net energy rate stays positive.",
    isCompleted: (state) => {
      const rates = calculateNetRates(state.structures);
      const solarCount = state.structures.filter(
        (s) => s.structureId === "solar_farm",
      ).length;
      return solarCount >= 2 && rates.netEnergyPerSol >= 0;
    },
  },
  {
    id: "build-comms",
    stepNumber: "07",
    title: "Deploy Communications Tower",
    whyThisMatters:
      "Deep space telemetry links the outpost with Earth Mission Control for guidance and rescue support.",
    hint: "Select 'Communications Tower' (80 MAT) and place it at the outpost.",
    isCompleted: (state) =>
      state.structures.some(
        (s) => s.structureId === "comms_tower" && s.active,
      ),
  },
  {
    id: "survive-sol6",
    stepNumber: "08",
    title: "Sustain the Outpost through SOL 5",
    whyThisMatters:
      "Junior Astronaut certification requires sustaining life support through all 5 sols with zero critical deficits.",
    hint: "Keep energy, oxygen, and food above zero until reaching Sol 6.",
    isCompleted: (state) => state.sol >= 6 && state.missionStatus === "victory",
  },
];
