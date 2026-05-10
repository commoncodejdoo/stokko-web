/**
 * Deterministic random-walk generator used as a stub for sparklines until
 * we have a real time-series source (Phase W9 — `WarehouseDailySnapshot`
 * table + cron snapshot job on the backend).
 *
 * Same seed → same output, so the chart doesn't jump around on re-render.
 */

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface SparklineStubOpts {
  seed: string;
  length?: number;
  /** Numeric anchor — last value approximates this. Helps make the chart
   *  feel correlated to whatever it's accompanying (qty / value / count). */
  endValue?: number;
  /** Volatility 0-1. Lower = smoother, higher = jaggier. */
  volatility?: number;
}

/**
 * Returns `length` numbers forming a smooth random walk that ends near
 * `endValue`. Used as a temporary visualisation — TODO replace with the
 * real daily-snapshot endpoint when Phase W9 ships.
 */
export function sparklineStub({
  seed,
  length = 14,
  endValue = 50,
  volatility = 0.15,
}: SparklineStubOpts): number[] {
  const rand = mulberry32(hashString(seed));
  const points: number[] = [];
  let value = endValue * (0.6 + rand() * 0.3);
  const targetEnd = endValue || 1;
  for (let i = 0; i < length; i++) {
    const progress = i / Math.max(1, length - 1);
    const drift = (targetEnd - value) * progress * 0.2;
    const noise = (rand() - 0.5) * Math.abs(targetEnd) * volatility;
    value = Math.max(0, value + drift + noise);
    points.push(Number(value.toFixed(2)));
  }
  // Pin the last point near targetEnd so the chart "lands" sensibly.
  if (length > 0) points[length - 1] = Math.max(0, targetEnd);
  return points;
}
