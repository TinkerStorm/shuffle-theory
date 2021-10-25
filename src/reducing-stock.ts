import { chance, getPlayers, getRoles, hasUsedScroll } from './common';

const players = getPlayers();
let roles = getRoles();

console.time('reducing-stock');
// iterate through names and assign roles based on scrolls available and random chance
for (let index in players) {
  const player = players[index];

  const chances = roles.map(role => {
    const scroll = player.scrolls.find(scroll => !hasUsedScroll(role, scroll));

    return 1 + (scroll?.effect ?? 0);
  });

  const isLastRole = roles.length <= 1;

  player.role = isLastRole
    ? chance.weighted(roles, chances)
    : roles[0];

  
  if(isLastRole)
    console.log("Last player got the remaining role (chance.weighted was not used).");


  // mark scroll as used
  let usedScroll = false;
  for (const i in player.scrolls) {
    const scroll = player.scrolls[i];
    if (hasUsedScroll(player.role, scroll)) {
      scroll.used = true;
      usedScroll = true;
    }
  }

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

  console.log(`${player.name} is a ${player.role} ${usedScroll ? '(A scroll was used...)' : ''} - ${calculatedChance}%`);
}
console.timeEnd('reducing-stock');

console.log('\n\n'); // spacer

// list all users
for (const user of players) {
  console.log(`${user.name} is a ${user.role}\n\t(${user.scrolls.map(s => `${s.role} -> ${(s.effect * 100).toFixed(2)}% [${s.used}]`)})`);
}