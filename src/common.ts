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

  const array = roles.map(role => {
    // determine the number of roles to generate
    const roleCount = Math.round(role.ratio * scaleFactor);
    // generate an array of roleCount length, filled with the role name
    return Array(roleCount).fill(role.name);
  }).flat();

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

export const log = (...args: any[]) => console.log(...args);

export function logChances(players: Player[], roles: string[]): void {
  const uniqueRoles = [...new Set(roles)];

  for (const role of uniqueRoles) {      
    const chanceMap = players.reduce<{[player:string]:number}>((map, player) => {
      const chance = sumBy(
        player.scrolls.filter(scroll => scroll.role === role),
        scroll => scroll.effect
      );
      map[player.name] = 1 + chance;
      return map;
    }, {});
    
    let chanceSum = Object.values(chanceMap).reduce((prev, curr) => prev + curr, 0);
    for (const player of Object.keys(chanceMap)) {
      chanceMap[player] /= chanceSum;
    }

    const playerMaxLength = Math.max(...players.map(p => p.name.length)) + 1;
    log(`\n\t${role}`);
    log(`${'Player'.padEnd(playerMaxLength)} | Chance`);
    //log(chanceMap);
    for (const [name, chance] of Object.entries(chanceMap)) {
      const pad = chance < 0.1 ? ' ' : '';
      log(`${name.padEnd(playerMaxLength)} | ${pad}${(chance * 100).toFixed(3)}%`);
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
    log();
  }
}