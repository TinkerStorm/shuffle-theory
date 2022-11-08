// Imports (Utils)
import logger from '../util/logger';

// Imports (Functions)
import { pickOneFrom, shuffleList } from "../util/list";
import { getMiddlePoint, wrap } from '../util/number';

// Imports (Types)
import { ChanceType, RoleData, RoleType, RosterOptions, RosterResults } from "./types";

function insertRole(roster: string[], role: RoleData, count: number, options: Partial<RosterOptions>) {
  const { unique, selection, replace, label } = role;
  const { maxRetries = 10 } = options;
  
  let i = 0, retries = 0;
  
  while (i < count && retries <= maxRetries) {
    const index = replace ? roster.indexOf(replace) : roster.length;

    if (index && index < 0) {
      logger.warn(`  [!] %s is not in the roster, skipping remaining iterations for %s`, [replace, label]);
      break; // no more roles to replace
    }

    const selected = selection.length === 1 ? selection[0] : pickOneFrom(selection);
    const combinedLabel = selected === label ? label : `${label} (${selected})`;

    if (unique && roster.includes(selected)) {
      logger.warn('    [!] %s is unique and already in the roster, skipping...', [selected]);
      retries++; // try again
      continue;
    }

    logger.info('  [*] %s [%o] (%o retries)', [combinedLabel, index + 1, retries]);

    if (replace && index < roster.length) roster.splice(index, 1, selected);
    else roster.push(selected);

    i++;

    if (unique && i >= selection.length) {
      logger.info(`  [!] %s (%s) is unique, skipping remaining iterations`, [label, selection.length]);
      break; // no more roles
    }
  }

  return roster;
}

function getQuantity(role: RoleData, initial: number) {
  const { label, type } = role;

  switch (type) {
    case RoleType.FIXED:
      return role.quantity;
    case RoleType.RATIO:
      return Math.floor(initial * role.ratio);
    case RoleType.THRESHOLDS:
      return role.thresholds.filter(t => t > initial).length;
    case RoleType.INCREMENT:
      return Math.floor(initial / role.each);
    case RoleType.REMAINDER:
      logger.warn(`  [!] %s is a remainder role, skipping...`, [label]);
      break;
    default:
      logger.error(`  [#] %s has an unknown or invalid type for standard use, skipping...`, [label]);
      break;
  }

  return 0;
}

function getChanceReturn(value: number, type: ChanceType, count: number) {
  if (type === ChanceType.RANDOM) {
    return Math.floor(Math.random() * (count + 1));
  }

  // TODO: review middle point start
  let change = Math.round(getMiddlePoint(0, value));

  for (let i = 0; i < count; i++) {
    change += type === ChanceType.INCREMENT ? 1 : -1;
  }

  return change;
}

export function getComposition(roster: string[]): Record<string, number> {
  const composition: Record<string, number> = {};
  for (const role of roster) {
    composition[role] = (composition[role] ?? 0) + 1;
  }
  return composition;
}

export function getRoster(
  roles: RoleData[],
  playerCount: number,
  options: Partial<RosterOptions> = {}
): RosterResults {
  if (options.shuffleRoleData) roles = shuffleList(roles);

  const roster: string[] = [];

  for (const role of roles.filter(r => r.type !== RoleType.REMAINDER)) {
    logger.info(`[^] ${role.label} (${role.type})`);

    if (role.activation && role.activation.chance! !== 1) {
      const { activation, label } = role;

      const value = Math.random();
      if (activation.chance! < value) {
        logger.warn(`  [!] ${label} has failed to activate (${activation.chance} < ${value})`);
        continue;
      }
    }

    const initial = !role.activation?.include ? playerCount - (role.activation?.value ?? 0) : playerCount;

    let count = getQuantity(role, initial);

    if (role.chance) {
      const { value, type } = role.chance;

      const before = count;
      const change = getChanceReturn(value, type, count);

      count = Math.min(Math.max(change, 0), before);

      logger.info(`  [%] ${role.label} chance (${before} -> ${change}, ${type})`);
    }

    if (role.range) {
      const { minimum, maximum } = role.range;
      count = Math.min(Math.max(count, minimum ?? 0), maximum ?? count);
    }

    if (isNaN(count)) {
      logger.error(`  [-] ${role.label} has an invalid count, skipping...`);
      continue;
    }

    if (count <= 0) {
      logger.warn(`  [<] ${role.label} has no count, skipping...`);
    }

    insertRole(roster, role, count, options);
  }

  const fillerRoles = roles.filter(r => r.type === RoleType.REMAINDER);

  if (fillerRoles.length > 0 && roster.length < playerCount) {
    logger.info(`[&] Adding filler roles... (${roster.length} of ${playerCount})`);

    if (fillerRoles.length > 1) {
      let index = 0;
      logger.info(`  [!] Multiple filler roles detected, alternating between them...`);
      while (roster.length < playerCount) {
        insertRole(roster, fillerRoles[index], 1, options);
        index = wrap(index + 1, 0, fillerRoles.length);
      }
    } else {
      const [role] = fillerRoles;
      const count = playerCount - roster.length;
      logger.info('[>] Only one filler role, adding %s of %s', [count, role.label]);
      const revert = logger.wrapToggle(false);
      insertRole(roster, role, count, options);
      revert();
    }
  }

  return {
    roster,
    composition: getComposition(roster),
    exact: roster.length === playerCount,
    total: roster.length,
    excess: roster.length - playerCount,
    shortfall: playerCount - roster.length,
  };
}

export default getRoster;