import { logPlayerChances, logRoles } from "./debug";

/** The type of role to fill. */
enum RoleType {
  /** A fixed quantity of roles */
  FIXED = "fixed",
  /** A ratio of roles relative to the number of players. */
  RATIO = "ratio",
  /** Add role each {x} players. */
  INCREMENT = "increment",
  /** Add a new role when each threshold is reached. */
  THRESHOLDS = "thresholds",
  /** All remaining slots are filled with these roles. */
  REMAINDER = "remainder",
}

/** The type of chance to apply to a role */
enum ChanceType {
  /** If threshold is met, decrease total of role by 1 */
  DECREMENT = "decrement",
  /** If threshold is met, increase total of role by 1 */
  INCREMENT = "increment",
  /** Set total to a random number between 0 and threshold */
  RANDOM = "random"
}

/** This contains the necessary data to *assemble* the role roster that is to be assigned to players. */
interface RoleData {
  /** The type of role behaviour. */
  type: RoleType;
  /** The name of the role */
  name: string;
  /** Minimum number of players required to include this role. */
  activation: number;
  /** The physical chance the role will be included in the roster, after meeting the activation threshold. */
  activationChance: number;
  /** The absolute quantity of the role, after activation. */
  quantity: number;
  /** Minimum number of roles to add, after activation. */
  minimum: number;
  /** Maximum number of players allowed to play this role. */
  maximum: number;
  /** Include the initial player count that was required to get the role. */
  include: boolean;
  /** The number of players required to add another role. */
  each: number;
  /** The target role to replace when called upon. */
  replace: string;
  /** The chance of the role being given to a player */
  chance: number;
  /** The type of chance behaviour */
  chanceType: ChanceType;
  /**
   * The thresholds to add a new role.
   * @example
   * // activation: 5, include: false, thresholds: [2, 4]
   * new RoleBuilder('role').withActivation(5, false).thresholds([2, 4])
   * // 5 players are required to activate the role, and then 2 more players are required to add the role.
   */
  thresholds: number[];
}

export class RoleBuilder {
  data: Partial<RoleData>;

  constructor(name: string) {
    this.data = {
      name
    };
  }

  /**
   * How many players should join before this role is included
   * @param activation number of players required to activate this role
   * @param include whether to include the initial player count after the condition has been fulfilled
   * 
   * @description
   * `⌊ ({count} - {reset?min:0}) / {each} ⌋`
   */
  withActivation(activation: number, include = false, chance = 1) {
    this.data.activation = activation;
    this.data.activationChance = Math.min(Math.max(chance, 0), 1);
    this.data.include = include;
    return this;
  }

  withReplace(replace: string) {
    this.data.replace = replace;
    return this;
  }

  withFixed(count: number) {
    this.withType(RoleType.FIXED);
    this.data.quantity = count;
    return this;
  }

  withMinimum(count: number) {
    this.data.minimum = count;
    return this;
  }

  withMaximum(count: number) {
    this.data.maximum = count;
    return this;
  }

  asUnique() {
    this.withFixed(1);
    return this;
  }

  withType(type: RoleType) {
    this.data.type = type;
    return this;
  }

  withEach(each: number) {
    this.withType(RoleType.INCREMENT);
    this.data.each = each;
    return this;
  }

  withRatio(ratio: number) {
    this.withType(RoleType.RATIO);
    this.data.each = ratio;
    return this;
  }

  /**
   * The physical chance that this role appears in the roster
   * @param chance the chance of the role appearing (0-1, exclusive)
   * @returns
   */
  withChance(chance: number, type = ChanceType.RANDOM) {
    this.data.chance = chance;
    this.data.chanceType = type;
    return this;
  }

  /**
   * The individual thresholds to add a new role, whether in order or not
   * @param thresholds A list of player quantities to add a new role
   * @returns 
   */
  withThresholds(...thresholds: number[] | number[][]) {
    this.withType(RoleType.THRESHOLDS);
    this.data.thresholds = thresholds.flat();
    return this;
  }

  /**
   * Set the role to be a shared remainder role, which will fill the remaining slots in the roster.
   * Any roles assigned with this will share the remaining slots as equally as possible.
   */
  asRemainder() {
    this.withType(RoleType.REMAINDER);
    return this;
  }

  static canBuildGame(roles: RoleData[], players: number, useGreedyExcess = true) {
    roles = cloneShuffle(roles);
    let total = 0;
    const finalRoles: string[] = [];
    let greedyRoles: RoleData[] = roles.filter(r => r.type === RoleType.REMAINDER);

    const add = (name: string, count: number, type: string = "role") => {
      // console.log("[%s] %s | %s -> %s", type ?? "role", name, count, total + count);
      finalRoles.push(...Array(count).fill(name));
      total += count;
    }

    const replace = (name: string, count: number, target: string) => {
      // console.log("[%s] %s -> %s | %s -> %s", "replace", name, target, count);
      for (let i = 0; i < finalRoles.length; i++) {
        if (finalRoles[i] === name) {
          finalRoles[i] = target;
          count--;
          if (count <= 0) break;
        }
      }
    }

    for (const role of roles.filter(r => r.type !== RoleType.REMAINDER)) {
      let count = 0;

      if (role.activationChance) {
        const returnedChance = Math.random();
        if (role.activationChance < returnedChance) {

          //console.log(
          //  "[role:chance(activation/failed)] %s | %s%% < %s%%",
          //  role.name,
          //  (role.activationChance * 100).toFixed(5),
          //  (returnedChance * 100).toFixed(5)
          //);
          continue;
        }
      }

      const initial = role.include ? players : players - role.activation;

      switch (role.type) {
        case RoleType.FIXED:
          count = role.quantity;
          break;
        case RoleType.RATIO:
          count = Math.floor(initial * role.each);
          break;
        case RoleType.THRESHOLDS:
          count = role.thresholds.filter(t => t > initial).length;
          break;
        default:
        case RoleType.INCREMENT:
          count = Math.floor(initial / role.each);
          break;
      }

      if (role.chance) {
        let change = 0;
        switch (role.chanceType) {
          case ChanceType.DECREMENT:
          case ChanceType.INCREMENT:
            for (let i = 0; i < count; i++) {
              if (Math.random() < role.chance) {
                change += role.chanceType === ChanceType.INCREMENT ? 1 : -1;
              }
            }
            break;
          case ChanceType.RANDOM:
            count = Math.floor(Math.random() * (count + 1));
            break;
        }

        count += change;

        //console.log("[role:chance(%s)] %s | %s + %s", role.chanceType, role.name, count, change);
      }

      if ('quantity' in role && count < role.minimum) {
        //console.log("[role:at-least] %s | %s -> %s", role.name, count, role.minimum);
      }

      if (role.minimum) count = Math.max(count, role.minimum);
      if (role.maximum) count = Math.min(count, role.maximum);

      if (isNaN(count)) {
        throw new Error(`Critical error: ${role.name} has returned with NaN count\n${JSON.stringify(role, null, 2)}`);
      }

      if (role.replace) {
        replace(role.name, count, role.replace);
      } else {
        add(role.name, count);
      }

      if (isNaN(total)) {
        throw new Error(`Critical error: ${role.name} has returned with NaN total`);
      }
    }

    if (greedyRoles.length > 0) {
      const count = Math.floor((players - total) / greedyRoles.length);
      for (const role of greedyRoles) {
        add(role.name, count, "greedy");
      }
    }

    let index = 0;
    const target = useGreedyExcess ? greedyRoles : roles;
    while (total < players) {
      const role = target[index];
      add(role.name, 1, "failover");
      index = (index + 1) % target.length;
    }

    return {
      roles: cloneShuffle(finalRoles),
      composition: finalRoles.reduce<Record<string, number>>((acc, cur) => {
        acc[cur] = (acc[cur] ?? 0) + 1;
        return acc;
      }, {}),
      exact: total === players,
      total,
      ...(total > players && {
        excess: total - players
      }),
      ...(total < players && {
        shortfall: players - total
      })
    };
  }

  build() {
    return this.data as RoleData;
  }
}

const roles = [
  // min: 5, each: 4, at least: 1
  new RoleBuilder('werewolf').withActivation(5).withMinimum(1).withEach(4),
  // min: 5!, each: 5
  new RoleBuilder('seer').withActivation(5, false).withEach(5),
  // min: 1, unique!
  new RoleBuilder('death').withActivation(5, false).asUnique(),
  new RoleBuilder('alpha-wolf').withActivation(5, false, 1 / 3).asUnique(),
  new RoleBuilder('villager1').asRemainder(),
  new RoleBuilder('villager2').asRemainder(),
].map(r => r.build());

//const roles = [
//  new RoleBuilder('werewolf').withThresholds(5, 10, 15).build(),
//  new RoleBuilder('villager').asRemainder().build(),
//]

const cloneShuffle = (arr: any[]) => {
  const clone = [...arr];
  for (let i = clone.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [clone[i], clone[j]] = [clone[j], clone[i]];
  }
  return clone;
}

function wrapDuration() {
  const start = performance.now();
  return () => (performance.now() - start);
}

for (let i = 0; i < 20; i++) {
  const duration = wrapDuration();
  const result = RoleBuilder.canBuildGame(roles, i + 6);

  logRoles(result.roles);

  const uniqueRoles = Object.keys(result.composition).length;
  console.log(`${i + 6} players took ${duration().toLocaleString()}ms (${uniqueRoles} unique roles)`);
}

//for (let players = 0; players < 20; players++) {
//  const overall = wrapDuration();
//  for (let i = 0; i < 10_000; i++) {
//    RoleBuilder.canBuildGame(roles, players + 6);
//  }
//  console.log(`${players + 6} players took ${overall().toLocaleString()}ms`);
//}

// Benchmark

for (let players = 0; players < 20; players++) {
  const timings = [];
  for (let i = 0; i < 400_000; i++) {
    const duration = wrapDuration();
    RoleBuilder.canBuildGame(roles, players + 6);
    timings.push(duration());
  }

  const total = timings.reduce((a, b) => a + b, 0);
  console.log(`${players + 6} players took ${total / timings.length}ms (total: ${total}ms)`);
}