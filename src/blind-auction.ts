import { chance, getPlayers, getRoles, hasUsedScroll, sumBy } from './common';

import { logChances, logScrolls } from './debug';

const roles = getRoles();
const players = getPlayers();

console.time('blind-auction');

for (const role of roles) {
  const remainingPlayers = players.filter(player => !player.role);

  // get range of indexes for players
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
    // console.log(`${acc} at ${remainingIndexes[index]} with ${chance}`);
    if (acc >= randomChance) {
      playerIndex = +remainingIndexes[index];
      // console.log(`${remainingPlayers[playerIndex].name} (${playerIndex}) is a ${role} at ${randomChance}`);
      break;
    }
  }


  //const playerIndex = isLastPlayer
  //  ? remainingIndexes[0]
  //  : chance.weighted(remainingIndexes, chances);

  const selectedPlayer = remainingPlayers[playerIndex];

  selectedPlayer.role = role;

  // const playerIndex = remainingPlayers.indexOf(selectedPlayer);

  const percentages = chances.slice();
  let scaleFactor = sumBy(percentages, percentages => percentages) / percentages.length;
  for (let i = 0; i < percentages.length; i++)
    percentages[i] = percentages[i] / scaleFactor;

  const calculatedChance = (percentages[playerIndex] / remainingPlayers.length * 100).toFixed(2);
  let outcome = `${selectedPlayer.name} (${playerIndex}) is a ${selectedPlayer.role} - ${calculatedChance}% (${chances[playerIndex].toFixed(2)})\n`;
  outcome += `\t[${remainingIndexes.join(', ')}] - ${randomChance.toFixed(5)}\n`
  for (const index of remainingIndexes) {
    const player = remainingPlayers[index];
    const percentage = (percentages[index] / remainingPlayers.length * 100).toFixed(2);

    if (playerIndex === index) {
      continue;
    }

    const chance = (chances[index]).toFixed(2);
    outcome += `\t${player.name} (${index}) had a ${percentage}% chance (${chance})\n`;
  }
  console.debug(outcome);
}

for (const player of players) {
  for (const scroll of player.scrolls) {
    if (hasUsedScroll(player.role!, scroll)) {
      scroll.use();
    }
  }
}

console.timeEnd('blind-auction');

logScrolls(players);
logChances(players, roles);