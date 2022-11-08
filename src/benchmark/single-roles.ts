import { add, run } from './_common';

import { Role } from '../distribution/builder';
import getRoster from '../distribution/assembler';

{
  const roles = [
    new Role('Mafia').withEach(4),
    new Role('Sheriff').withActivation(5, true, 1 / 3).asUnique(),
    new Role('Witch').withActivation(7),
    new Role('Doctor').withActivation(5, false),
    new Role('Civilian').asRemainder(),
  ].map(r => r.build());

  for (let players = 6; players < 26; players++) {
    add(`${roles.length} roles, ${players} players`, () => {
      getRoster(roles, players);
    });
  }
}

run();