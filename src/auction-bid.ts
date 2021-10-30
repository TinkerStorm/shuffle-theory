import { chance, getPlayers, getRoles, hasUsedScroll, log, logChances, logScrolls, sumBy } from './common';

const roles = getRoles();
const players = getPlayers();

console.time('auction-bid');
// iterate over roles
for (const role of roles) {
  // filter out players without a role
  const remainingPlayers = players.filter(player => !player.role);

  // map out chances for each player based on current role
  const chances = remainingPlayers.map(player => {
    // find out if a player has a scroll for the current role (use first found)
    const scrolls = player.scrolls.filter(scroll => !hasUsedScroll(role, scroll));
    // if player has a scroll, return a chance of 100%+{effect??0}%
    return 1 + sumBy(scrolls, scroll => scroll?.effect, 0);
  });

  const isLastPlayer = remainingPlayers.length === 1;

  const selectedPlayer = isLastPlayer
    ? remainingPlayers[0]
    : chance.weighted(remainingPlayers, chances);

  // assign role to selected player
  selectedPlayer.role = role;

  // log out the selected player
  const playerIndex = remainingPlayers.indexOf(selectedPlayer);
  
  let scaleFactor = sumBy(chances, chance => chance) / chances.length;
  for(let i = 0; i < chances.length; i++)
    chances[i] = chances[i] / scaleFactor;
    
  const calculatedChance = (chances[playerIndex] / remainingPlayers.length * 100).toFixed(2);
  log(`${selectedPlayer.name} (${playerIndex}) is a ${selectedPlayer.role} - ${calculatedChance}%`);

  // log remaining player chances
  for (const [index, player] of remainingPlayers.entries()) {
    if(playerIndex === index) {
      continue;
    }

    const chance = (chances[index] / remainingPlayers.length * 100).toFixed(2);
    log(`\t${player.name} (${index}) had a ${chance}% chance`);
  }
  log();
}
log();

for (const player of players) {
  // determine if a negative effect scroll has been used
  for (const scroll of player.scrolls) {
    if (hasUsedScroll(player.role!, scroll)) {
      scroll.use();
      log(`${player.name} used a ${scroll}`);
    }
  }
}

log();
console.timeEnd('auction-bid');

logScrolls(players);
logChances(players, roles);