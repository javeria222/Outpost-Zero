export const FIXED_STEP_SECONDS = 1;
export const MAX_FRAME_DELTA_SECONDS = 0.25;

/** Convert render-frame time into whole simulation steps plus a fractional remainder. */
export function accumulateFixedSteps(
  accumulator: number,
  frameDeltaSeconds: number,
  speed: 1 | 3,
) {
  const safeAccumulator = Number.isFinite(accumulator) ? Math.max(0, accumulator) : 0;
  const safeFrameDelta = Number.isFinite(frameDeltaSeconds)
    ? Math.max(0, Math.min(frameDeltaSeconds, MAX_FRAME_DELTA_SECONDS))
    : 0;
  const total = safeAccumulator + safeFrameDelta * speed;
  const steps = Math.floor(total / FIXED_STEP_SECONDS + 1e-10);

  return {
    steps,
    remainder: Math.max(0, total - steps * FIXED_STEP_SECONDS),
  };
}
