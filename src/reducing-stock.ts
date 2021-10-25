import { chance, getPlayers, getRoles, hasUsedScroll, log, logChances, logScrolls, sumBy } from './common';

const players = getPlayers();
let roles = getRoles();

console.time('reducing-stock');
// iterate through names and assign roles based on scrolls available and random chance
for (let index in players) {
  const player = players[index];

  const chances = roles.map(role => {
    const scrolls = player.scrolls.filter(scroll => !hasUsedScroll(role, scroll));

    return 1 + sumBy(scrolls, scroll => scroll?.effect, 0);
  });

  const isLastRole = roles.length <= 1;

  player.role = isLastRole
    ? chance.weighted(roles, chances)
    : roles[0];

  
  if(isLastRole)
    log("Last player got the remaining role (chance.weighted was not used).");

  // find first matched role and remove it from the list
  let roleIndex = 0;
  for (let i = 0; i < roles.length; i++) {
    if (roles[i] === player.role) {
      roles.splice(i, 1);
      roleIndex = i;
      break;
    }
  }

  const calculatedChance = (chances[roleIndex] / (roles.length + 1) * 100).toFixed(2);

  log(`${player.name} is a ${player.role} - ${calculatedChance}%`);
}

log();

for (const player of players) {
  // determine if a negative effect scroll has been used
  for (const scroll of player.scrolls){
    if(hasUsedScroll(player.role!, scroll)) {
      scroll.use();
      log(`${player.name} used a ${scroll}`);
    }
  }
}

log();
console.timeEnd('reducing-stock');

logScrolls(players);
logChances(players);