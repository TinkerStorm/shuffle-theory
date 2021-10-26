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
export function getScrolls(maxScrolls: number = 3, min: number = -0.1, max: number = 0.3): Scroll[] {
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

export const log = (...args: any[]) => console.log(...args);

export function logChances(players: Player[]): void {
  // roles are guaranteed to have the same ratio
  const uniqueRoles = getRoles(players.length).filter((role, index, roles) => roles.indexOf(role) === index);

  for (const role of uniqueRoles) {
    log();
    for (const player of players) {
      const appliedScrolls = player.scrolls.filter(scroll => hasUsedScroll(role, scroll));
      // TODO: account for the different effects from other players
      const chance = (
        (1 + sumBy(appliedScrolls, scroll => scroll.effect, 0)
      ) / players.length * 100);

      log(`[${role}] ${player.name} had ${chance.toFixed(2)}% chance.`);
    }
  }
}

export function logScrolls(players: Player[]): void {
  log();
  for (const player of players) {
    // (playerChance / overallChance * 100).toFixed(2) + % ??
    log(`${player.name} is a ${player.role}`);
    for (const scroll of player.scrolls) {
      log(`\t${scroll} ${scroll.used}`);
    }
  }
}

export function averageChance(players: Player[]): number {
  return players.reduce((acc, cur) => acc + (
    (1 + sumBy(cur.usedScrolls, scroll => scroll.effect, 0)
  ) / players.length * 100), 0);
}