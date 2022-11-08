import { Player } from "./data";
import logger from "./util/logger";
import { scaleTo, sumBy } from "./util/number";

class DebugUtil {
  @logger.wrap
  logRoles(roles: string[]) {
    const uniqueRoles = [...new Set(roles)];

    const table = {} as { [key: string]: { Count: number, Ratio: `${number}%` /*, Chance: number */ } };

    for (const role of uniqueRoles) {
      table[role] = {
        Count: roles.filter(r => r === role).length,
        Ratio: `${(roles.filter(r => r === role).length / roles.length) * 100}%`,
      }
    }

    logger.log(`\n\tRole distribution`);
    logger.log(`\tWhen ${roles.length} roles are in the game, the following roles are present:`);
    logger.table(table);
  }

  @logger.wrap
  logScrolls(players: Player[]): void {
    const scrollMap: { [player: string]: { [role: string]: string } } = {};

    const columns = players.map(p => p.role!).filter((v, i, a) => a.indexOf(v) === i).sort();
    columns.unshift("$Used");

    for (const { scrolls, usedScrolls, name } of players.sort()) {
      if (!usedScrolls.length) continue;

      for (const { role, effect } of usedScrolls) {
        (scrollMap[name] ??= {})[role] = effect.toFixed(3) + "%";
      }

      scrollMap[name]["$Used"] = (usedScrolls.length + " / " + scrolls.length);
    }

    logger.log("\tChance breakdown: Scrolls available + if used");
    console.log("\t(Players AND Roles without any modifiers will NOT show on this table.)");
    console.table(scrollMap, columns);
  }

  @logger.wrap
  logPlayerChances(players: Player[], roles: string[]): void {
    const revertEnabled = logger.wrapToggle();
    const uniqueRoles = [...new Set(roles)].sort();
    const playerMap = {} as { [player: string]: { [role: string]: string } };

    for (const role of uniqueRoles) {
      const chances = scaleTo(1, players.map((player) => {
        return 1 + sumBy(
          player.scrolls.filter((scroll) => scroll.role === role),
          (scroll) => scroll.effect
        );
      }));

      for (const index in chances) {
        const [{ name }, chance] = [players[+index], chances[index]];

        (playerMap[name] ??= {})[role] = `${(chance * 100).toFixed(3)}%`;
      }
    }
    logger.log(`\tChance breakdown: Role to Player (read from top to bottom)`);
    logger.table(playerMap);

    revertEnabled();
  }

  @logger.wrap
  logRoleChances(players: Player[], roles: string[]): void {
    const uniqueRoles = [...new Set(roles)].sort();
    const table = {} as { [player: string]: { [role: string]: string } };

    // for players loop through roles and print out the chance of each role
    for (const player of players) {
      const chances = {} as { [role: string]: number };

      for (const role of uniqueRoles) {
        const roleCount = roles.filter((r) => r === role).length;
        // chance is determined by the number of roles present in the game and any scrolls the player may have
        const chance = (roleCount / roles.length) + 1 + sumBy(
          player.scrolls.filter((scroll) => scroll.role === role),
          (scroll) => scroll.effect
        );

        chances[role] = chance;
      }

      const scaleFactor = sumBy(Object.values(chances), (c: any) => c);
      for (const role in chances) {
        const trueChance = chances[role] / scaleFactor;
        (table[player.name] ??= {})[role] = (trueChance * 100).toFixed(2) + "%";
      }
    }

    // this is a bit of a hack, but it's the only way I could think of to get the output to be formatted correctly
    // becomes problematic if there are more roles than the terminal can display on one line
    logger.log(`\tChance breakdown: Player to Role (read from index first)`);
    logger.table(table);
  }
}

const instance = new DebugUtil();
export default instance;
const { logPlayerChances, logRoleChances, logRoles, logScrolls } = instance;
export {
  logPlayerChances,
  logRoleChances,
  logRoles,
  logScrolls
};