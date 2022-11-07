import { logRoles } from "./debug";
import getRoster from "./distribution/assembler";
import { Role } from "./distribution/builder";
import { ChanceType } from "./distribution/types";
import { logger } from "./util/logger";

const roles = [
  //  // min: 5, each: 4, at least: 1
  //  new Role('werewolf').withActivation(5).withMinimum(1).withEach(4),
  //  // min: 5!, each: 5
  //  new Role('seer').withActivation(5, false).withEach(5),
  //  // min: 1, unique!
  //  new Role('death').withActivation(5, false).asUnique(),
  //  new Role('alpha-wolf').withActivation(5, false, 1 / 3).asUnique(),
  //  new Role('villager1').asRemainder(),
  //  new Role('villager2').asRemainder(),

  new Role('Mafia').withEach(4),
  new Role('Innocent Helpers', 'Sheriff', 'Doctor').withChance(1 / 3, ChanceType.INCREMENT).asUnique(),
  new Role('Civilian').asRemainder(),
].map(r => r.build());

function wrapDuration() {
  const start = performance.now();
  return () => (performance.now() - start);
}

//for (let i = 0; i < 20; i++) {
//  const duration = wrapDuration();
//  const result = RoleBuilder.buildGame(roles, i + 6);

//  logRoles(result.roles);

//  const uniqueRoles = Object.keys(result.composition).length;
//  console.log(`${i + 6} players took ${duration().toLocaleString()}ms (${uniqueRoles} unique roles)`);
//}

const playerCount = parseInt(process.argv[2] ?? 10);
const duration = wrapDuration();
const customResult = getRoster(roles, playerCount);
logger.info(`Custom of ${playerCount} players took ${duration().toLocaleString()}ms`);
console.log(customResult);
logRoles(customResult.roster);

for (let players = 0; players < 20; players++) {
  const overall = wrapDuration();
  for (let i = 0; i < 10_000; i++) {
    getRoster(roles, players + 6, {
      disableLogging: true
    });
  }
  const duration = overall();

  logger.log(`${players + 6} players took ${duration.toLocaleString()}ms (average: ${(duration / 10_000)}ms)`);
}

// Benchmark

//for (let players = 0; players < 20; players++) {
//  const timings = [];
//  for (let i = 0; i < 400_000; i++) {
//    const duration = wrapDuration();
//    RoleBuilder.canBuildGame(roles, players + 6);
//    timings.push(duration());
//  }

//  const total = timings.reduce((a, b) => a + b, 0);
//  console.log(`${players + 6} players took ${total / timings.length}ms (total: ${total}ms)`);
//}