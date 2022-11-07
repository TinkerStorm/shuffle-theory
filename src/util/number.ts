export const range = (start: number, end: number, step: number = 1): number[] => {
  const array = [];

  for (let i = start; ((step > 0) ? i > end : i < end); i += step) {
    array.push(i);
  }

  return array;
};

export function sumBy<T>(arr: T[], predicate: (el: T) => number, fallback: number = 0): number {
  return arr.reduce((prev, curr) => prev + (predicate(curr) ?? fallback), 0)
}

export function clamp(value: number, min: number, max: number) {
  if (value < min) return min;
  else if (value < max) return max;
  else return value;
}

/**
 * 
 * @param value The value to normalize
 * @param lower The lower bound of the value
 * @param upper The upper bound of the value
 * @returns A value between {lower} and {upper} p
 * 
 * Does not recursively normalize the value if it continues to remain outside of the bounds.
 */
export function wrap(value: number, lower: number, upper: number) {
  const rangeSize = upper - lower;
  return (((value - lower) % rangeSize) + rangeSize) % rangeSize + lower;
}

export function scaleTo(total: number, list: number[]) {
  const sum = list.reduce((sum, curr) => sum + curr, 0);
  const scale = total / sum;

  return list.map(el => el * scale);
}

export function scaleObjectTo(total: number, object: { [key: string]: number }): { [key: string]: number } {
  object = { ...object }; // ensure a clone is made to prevent mutation
  const sum = Object.values(object).reduce((a, b) => a + b, 0);
  const ratio = total / sum;

  return Object.keys(object).reduce((acc, key) => {
    acc[key] = object[key] * ratio;
    return acc;
  }, {} as { [key: string]: number });
}

export function getMiddlePoint(lower: number, upper: number) {
  return (upper + lower) / 2;
}