import { scaleTo, sumBy } from "./common";
import { Player } from "./data";

export function logScrolls(players: Player[]): void {
  let output = "";

  for (const { usedScrolls, name } of players) {
    if (usedScrolls.length > 0) {
      output += `\n${name} used ${usedScrolls.length} scrolls.`;
      usedScrolls.forEach((scroll) => output += `\n\t${scroll}`);
    }
  }

  console.debug(output);
}

export function logChances(players: Player[], roles: string[]): void {
  const uniqueRoles = [...new Set(roles)];

  for (const role of uniqueRoles) {
    const chances = scaleTo(1, players.map((player) => {
      return 1 + sumBy(
        player.scrolls.filter((scroll) => scroll.role === role),
        (scroll) => scroll.effect
      );
    }));

    const playerMaxLength = Math.max(...players.map(p => p.name.length)) + 1;
    console.log(`\n\t${role}`);
    console.log(`${'Player'.padEnd(playerMaxLength)} | Chance`);
    //log(chanceMap);
    for (const index in chances) {
      const [{ name }, chance] = [players[+index], chances[index]];

      const pad = (chance < 0.1) ? ' ' : '';
      console.log(`${name.padEnd(playerMaxLength)} | ${pad}${(chance * 100).toFixed(3)}%`);
    }
  }
}