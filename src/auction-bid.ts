import { chance, getPlayers, getRoles, hasUsedScroll, sumBy } from './common';

const players = getPlayers();
const roles = getRoles();

console.time('auction-bid');
// iterate over roles
for (const role of roles) {
  // filter out players without a role
  const remainingPlayers = players.filter(player => !player.role);

  // map out chances for each player based on current role
  const chances = remainingPlayers.map(player => {
    // find out if a player has a scroll for the current role (use first found)
    const scrolls = player.scrolls.filter(scroll => scroll.role === role && !scroll.used);

    // if player has a scroll, return a chance of 100%+{effect??0}%
    return 100 + sumBy(scrolls, scroll => scroll?.effect, 0);
  });

  const selectedPlayer = chance.weighted(remainingPlayers, chances);

  // assign role to selected player
  selectedPlayer.role = role;

  // if player has a scroll, mark scroll as used
  let usedScroll = false;
  for (const index in selectedPlayer.scrolls) {
    const scroll = selectedPlayer.scrolls[index];
    if (hasUsedScroll(role, scroll)) {
      usedScroll = scroll.used = true;
    }
  }

  // log out the selected player
  console.log(`${selectedPlayer.name} is a ${selectedPlayer.role} ${usedScroll ? '(A scroll was used...)' : ''}`);
}
console.timeEnd('auction-bid');

console.log('\n\n'); // spacer

// list all users
for (const { name, role, scrolls } of players) {
  console.log(`${name} is a ${role}\n\t(${scrolls.map(s => `${s.role} -> ${s.effect * 100}% [${s.used}]`)})`);
}