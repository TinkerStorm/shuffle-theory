import { chance, getPlayers, getRoles, hasUsedScroll, Player } from './common';

const players = getPlayers();
let roles = getRoles();

console.time('reducing-stock');
// iterate through names and assign roles based on scrolls available and random chance
for (let index in players) {
  const player = players[index];

  const chances = roles.map(role => {
    const scroll = player.scrolls.find(scroll => scroll.role === role && !scroll.used);

    return 100 + (scroll?.effect ?? 0);
  });

  player.role = chance.weighted(roles, chances);

  let usedScroll = false;

  // mark scroll as used
  for (const i in player.scrolls) {
    const scroll = player.scrolls[i];
    if (hasUsedScroll(player.role, scroll)) {
      usedScroll = scroll.used = true;
      break;
    }
  }

  // find first matched role and remove it from the list
  for (let i = 0; i < roles.length; i++) {
    if (roles[i] === player.role) {
      roles.splice(i, 1);
      break;
    }
  }

  console.log(`${player.name} is a ${player.role} ${usedScroll ? '(A scroll was used...)' : ''}`);
}
console.timeEnd('reducing-stock');

console.log('\n\n'); // spacer

// list all users
for (const user of players) {
  console.log(`${user.name} is a ${user.role}\n\t(${user.scrolls.map(s => `${s.role} -> ${s.effect}[${s.used}]`)})`);
}