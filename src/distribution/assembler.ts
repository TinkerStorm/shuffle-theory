// Imports (Util)
import { logger } from '../util/logger';

// Imports (Functions)
import { pickOneFrom, shuffleList } from "../util/list";
import { getMiddlePoint, wrap } from '../util/number';

// Imports (Types)
import { ChanceType, RoleData, RoleType, RosterOptions, RosterResults } from "./types";

function insertRole(roster: string[], role: RoleData, count: number, options: Partial<RosterOptions>) {
  const { unique, selection, replace, label } = role;
  const index = replace ? roster.indexOf(replace) : roster.length;
  const { maxRetries = 10 } = options;

  const shouldPrint = !options.disableLogging;

  let i = 0, retries = 0;

  while (i < count && retries <= maxRetries) {
    if (index && index < 0) {
      if (shouldPrint) logger.warn(`[!] ${replace} is not in the roster, skipping remaining iterations for ${label}`);
      break; // no more roles to replace
    }

    const selected = selection.length === 1 ? selection[0] : pickOneFrom(selection);

    // debugging label
    const combinedLabel = selected === label ? label : `${label} (${selected})`;

    if (unique && roster.includes(selected)) {
      if (shouldPrint) logger.warn(`${combinedLabel} is unique, retrying...`);
      retries++; // try again
      continue;
    }

    if (shouldPrint) logger.star(`${combinedLabel} (${roster.length}) ${retries > 0 ? `(${retries} retries)` : ''}`);

    if (replace && index < roster.length) roster.splice(index, 1, selected);
    else roster.push(selected);

    i++;

    if (unique && i >= selection.length) {
      if (shouldPrint) logger.success(`${combinedLabel} is unique, but there are no more roles to use`);
      break; // no more roles
    }
  }

  return roster;
}

function getQuantity(role: RoleData, initial: number, options: Partial<RosterOptions>) {
  const shouldPrint = !options.disableLogging;

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
      if (shouldPrint) logger.warn(`${label} is a remainder role, skipping...`);
      break;
    default:
      logger.error(`${label} has an unknown or invalid type for standard use, skipping...`);
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
  data: RoleData[],
  playerCount: number,
  options: Partial<RosterOptions> = {}
): RosterResults {
  if (options.shuffleRoleData) data = shuffleList(data);

  const roster: string[] = [];

  for (const role of data.filter(r => r.type !== RoleType.REMAINDER)) {
    if (role.activation && role.activation.chance! !== 1) {
      const { activation, label } = role;

      const value = Math.random();
      if (activation.chance! < value) {
        if (!options.disableLogging)
          logger.note(`${label} has failed to activate (${activation.chance} < ${value})`);
        continue;
      }
    }

    const initial = !role.activation?.include ? playerCount - (role.activation?.value ?? 0) : playerCount;

    let count = getQuantity(role, initial, options);

    if (role.chance) {
      const { value, type } = role.chance;

      const before = count;
      const change = getChanceReturn(value, type, count);

      count = Math.min(Math.max(change, 0), before);

      if (!options.disableLogging) logger.star(`${role.label} chance (${before} -> ${change}, ${type})`);
    }

    if (role.range) {
      const { minimum, maximum } = role.range;
      count = Math.min(Math.max(count, minimum ?? 0), maximum ?? count);
    }

    if (isNaN(count)) {
      logger.error(`${role.label} has an invalid count, skipping...`);
      continue;
    }

    insertRole(roster, role, count, options);
  }

  const fillerRoles = data.filter(r => r.type === RoleType.REMAINDER);

  if (fillerRoles.length > 0 && roster.length < playerCount) {
    if (!options.disableLogging) logger.note(`Adding filler roles... (${roster.length} of ${playerCount})`);

    let index = 0;
    while (roster.length < playerCount) {
      const role = fillerRoles[index];
      insertRole(roster, role, 1, options);
      index = wrap(index + 1, 0, fillerRoles.length);
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