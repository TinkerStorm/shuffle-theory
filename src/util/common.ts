import { Chance } from 'chance';
import { Player, Role, roles as defaultRoles, Scroll } from '../data';
import { range } from './number';

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
      chance.pickone(range(min, max).filter(v => v !== 0)),
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

