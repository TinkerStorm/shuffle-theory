import { Chance } from 'chance';
import { Player, Role, roles as defaultRoles, Scroll } from './data';

export const chance = new Chance();

export function getPlayers(count: number = Player.COUNT): Player[] {
  const array = Array(count).fill(0).map(() =>
    new Player(chance.name(), getScrolls())
  );

  return chance.shuffle(array);
};

/**
 * @param count The number of players to generate roles for.
 * @param roles The roles to generate.
 * @returns An array of roles scaled up (or down) based on the player count provided.
 */
export function getRoles(count: number = Player.COUNT, roles: Role[] = defaultRoles): string[] {
  const sum = roles.reduce((sum, role) => sum + role.ratio, 0);
  // count / sum(roles.*.ratio)
  const scaleFactor = count / sum;

  const array = roles.flatMap<string>(role => {
    // determine the number of roles to generate
    const roleCount = Math.round(role.ratio * scaleFactor);
    // generate an array of roleCount length, filled with the role name
    return Array(roleCount).fill(role.name);
  });

  return chance.shuffle(array);
}

/**
 * 
 * @param count The number of scrolls to generate
 * @param min The minimum effect of each scroll
 * @param max The maximum effect of each scroll
 * @returns An array of scrolls
 */
export function getScrolls(maxScrolls: number = 3, min: number = -0.3, max: number = 0.3): Scroll[] {
  return chance.pickset(
    defaultRoles.map(role => new Scroll(
      role.name,
      chance.floating({ min, max })
    )),
    chance.integer({ min: 0, max: maxScrolls })
  );
}

export function hasUsedScroll(role: string, scroll: Scroll): boolean {
  return !scroll.used && (
    scroll.role === role && scroll.effect >= 0 // it shouldn't be 0, but consider it an edge case in this research
  ) || (
    scroll.role !== role && scroll.effect < 0
  );
}

export function sumBy<T>(arr: T[], predicate: (el: T) => number, fallback: number = 0): number {
  return arr.reduce((prev, curr) => prev + (predicate(curr) ?? fallback), 0)
}

export function clamp(value: number, min: number, max: number) {
  if (value < min) return min;
  else if (value < max) return max;
  else return value;
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
