export type FlightState = { enabled: boolean; altitude: number };

export function landFlight(): FlightState {
  return { enabled: false, altitude: 0 };
}

/** Toggle EVA flight; exiting settles the astronaut safely onto the ground. */
export function toggleFlight(state: FlightState): FlightState {
  return state.enabled
    ? landFlight()
    : { enabled: true, altitude: Math.max(0, state.altitude) };
}

export function stepFlightAltitude(
  altitude: number,
  ascend: boolean | undefined,
  descend: boolean | undefined,
  deltaSeconds: number,
  maximumAltitude: number,
): number {
  // Unpressed keys are absent from the sparse key map, so normalize undefined
  // to false instead of allowing Number(undefined) to poison altitude with NaN.
  const direction = (ascend ? 1 : 0) - (descend ? 1 : 0);
  return Math.max(0, Math.min(maximumAltitude, altitude + direction * 12 * deltaSeconds));
}
