import { Chance } from 'chance';

import { Role, roles as defaultRoles, Scroll } from './data';

export const chance = new Chance();

export interface Player {
  name: string;
  scrolls: Scroll[];
  role?: string
}

// chance.mixin({
//   scroll: function (): Scroll {
//     return {
//       role: chance.pickone(defaultRoles).name,
//       effect: chance.floating({ min: -.5, max: .5, fixed: 2 }),
//       used: false
//     }
//   }
// });

export function getPlayers(count: number = 10): Player[] {
  const array = Array(count).fill(0).map(() => ({
    name: chance.name(),
    scrolls: getScrolls(),
    role: undefined
  }));

  return chance.shuffle(array);
};

/**
 * @param count The number of players to generate roles for.
 * @param roles The roles to generate.
 * @returns An array of roles scaled up (or down) based on the player count provided.
 */
export function getRoles(count: number = 10, roles: Role[] = defaultRoles): string[] {
  const scaleFactor = sumBy(roles, role => role.ratio, 0);

  return roles.map(role => {
    // determine the number of roles to generate
    const roleCount = Math.round(role.ratio * scaleFactor);
    // generate an array of roleCount length, filled with the role name
    return Array(roleCount).fill(role.name);
  }).flat();
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
    defaultRoles.map(role => ({
      role: role.name,
      effect: chance.floating({ min, max }),
      used: false
    })),
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