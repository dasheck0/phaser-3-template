/**
 * clamp — constrain a number to [min, max].
 *
 * @param value - The number to constrain
 * @param min   - Lower bound (default 0)
 * @param max   - Upper bound (default 1)
 *
 * @example
 * clamp(1.5)        // → 1
 * clamp(-0.2)       // → 0
 * clamp(3, 0, 10)   // → 3
 * clamp(-5, 0, 10)  // → 0
 */
export const clamp = (value: number, min = 0, max = 1): number =>
  Math.min(max, Math.max(min, value));

/**
 * lerp — linear interpolation between two values.
 *
 * @param a - Start value
 * @param b - End value
 * @param t - Interpolation factor [0..1]
 */
export const lerp = (a: number, b: number, t: number): number =>
  a + (b - a) * clamp(t);

/**
 * normalize — map a value from [min, max] to [0, 1].
 */
export const normalize = (value: number, min: number, max: number): number =>
  clamp((value - min) / (max - min));
