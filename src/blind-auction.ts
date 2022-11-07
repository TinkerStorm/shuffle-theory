import { chance, getPlayers, getRoles, hasUsedScroll } from './util/common';
import { sumBy } from './util/number';

import { logPlayerChances, logRoleChances, logRoles, logScrolls } from './debug';

const roles = getRoles();
const players = getPlayers();

console.time('blind-auction');

for (const roleIndex in roles) {
  const role = roles[roleIndex];
  const remainingPlayers = players.filter(player => !player.role);
  if (remainingPlayers.length === 0) {
    console.log(`No remaining players, remaining roles: ${roles.slice(+roleIndex).join(', ')}`);
    break;
  }

  const remainingIndexes = chance.shuffle([...remainingPlayers.keys()]);

  const chances = remainingIndexes.map(index => {
    const scrolls = remainingPlayers[index].scrolls.filter(scroll => !hasUsedScroll(role, scroll));
    return 1 + sumBy(scrolls, scroll => scroll?.effect, 0);
  });

  const isLastPlayer = remainingIndexes.length === 1;

  let playerIndex = -1;
  const sum = sumBy(chances, chance => chance);
  const randomChance = Math.random() * sum;
  let acc = 0;
  for (const index in chances) {
    const chance = chances[index];
    acc += chance;
    if (acc >= randomChance) {
      playerIndex = +remainingIndexes[index];
      break;
    }
  }

  const selectedPlayer = remainingPlayers[playerIndex];

  selectedPlayer.role = role;

  const percentages = chances.slice();
  let scaleFactor = sumBy(percentages, percentages => percentages) / percentages.length;
  for (let i = 0; i < percentages.length; i++)
    percentages[i] = percentages[i] / scaleFactor;

  const calculatedChance = (percentages[playerIndex] / remainingPlayers.length * 100).toFixed(2);
  console.log(`\n${selectedPlayer.name} (${playerIndex}) is a ${selectedPlayer.role} (${roleIndex}) - ${calculatedChance}% (${chances[playerIndex].toFixed(2)})`);
  console.log(`\t[${remainingIndexes.join(', ')}] - ${randomChance.toFixed(5)}`)
  for (const index of remainingIndexes) {
    const player = remainingPlayers[index];
    const percentage = (percentages[index] / remainingPlayers.length * 100).toFixed(2);

    if (playerIndex === index) {
      continue;
    }

    const chance = (chances[index]).toFixed(2);
    console.log(`\t${player.name} (${index}) had a ${percentage}% chance (${chance})`);
  }
}

for (const player of players) {
  for (const scroll of player.scrolls) {
    if (hasUsedScroll(player.role!, scroll)) {
      scroll.use();
    }
  }
}

console.timeEnd('blind-auction');

logRoles(roles);
logScrolls(players);
logPlayerChances(players, roles);
logRoleChances(players, roles);