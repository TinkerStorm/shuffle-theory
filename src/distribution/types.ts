import { RoleAttributes } from "../util/types";

export interface RosterOptions {
  // extendedResults: boolean;
  // useRemainderRoles: boolean;
  /** Decide whether to log information about the roster generation process. */
  disableLogging: boolean;

  /** Whether to shuffle the role data before assembling the roster. */
  shuffleRoleData: boolean;
  /** Maximum number of retries to insert a role before giving up. */
  maxRetries: number;
}

export interface RosterResults {
  /** The list of roles created. */
  roster: string[];
  /** A map of role names to the number of roles provided. */
  composition: Record<string, number>;
  /** Does the roster slot count match the number of players? */
  exact: boolean;
  /** The total number of roles provided in the roster. */
  total: number;
  /** The number of roles that are missing from the roster. */
  excess?: number;
  /** The number of provided roles that will not be used. */
  shortfall?: number;
}

/** The type of role to fill. */
export enum RoleType {
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
export enum ChanceType {
  /** If threshold is met, decrease total of role by 1 */
  DECREMENT = "decrement",
  /** If threshold is met, increase total of role by 1 */
  INCREMENT = "increment",
  /** Set total to a random number between 0 and threshold */
  RANDOM = "random"
}

/** This contains the necessary data to *assemble* the role roster that is to be assigned to players. */
//export interface RoleData {
//  /** The type of role behaviour. */
//  type: RoleType;
//  /** The identifier of the role entry. */
//  label: string;
//  /** The list of roles to select from. */
//  selection: string[];
//  /** Minimum number of players required to include this role. */
//  activation: number;
//  /** The physical chance the role will be included in the roster, after meeting the activation threshold. */
//  activationChance: number;
//  /** The absolute quantity of the role, after activation. */
//  quantity: number;
//  /** Minimum number of roles to add, after activation. */
//  minimum: number;
//  /** Maximum number of players allowed to play this role. */
//  maximum: number;
//  /** Include the initial player count that was required to get the role. */
//  include: boolean;
//  /** The number of players required to add another role. */
//  each: number;
//  /** The target role to replace when called upon. */
//  replace: string;
//  /** The chance of the role being given to a player */
//  chance: number;
//  /** The type of chance behaviour */
//  chanceType: ChanceType;
//  /**
//   * The thresholds to add a new role.
//   * @example
//   * // activation: 5, include: false, thresholds: [2, 4]
//   * new RoleBuilder('role').withActivation(5, false).thresholds([2, 4])
//   * // 5 players are required to activate the role, and then 2 more players are required to add the role.
//   */
//  thresholds: number[];
//  /** Specifies the role should not be repeated after initial selection. */
//  unique: boolean;
//}

interface RoleActivation {
  /** The number of players required to activate the role. */
  value: number;
  /** The chance of the role being activated. */
  chance?: number;
  /** The number of players required to add another role. */
  include: boolean;
}

interface RoleRange {
  /** The minimum number of roles to add. */
  minimum?: number;
  /** The maximum number of roles to add. */
  maximum?: number;
}

export interface RoleChance {
  /** The chance of the role being included in the roster. */
  value: number;
  /** The type of chance behaviour */
  type: ChanceType;
}

interface RoleContext {
  /** Role has been disabled by activation (threshold or chance). */
  disabled: boolean;
}

export interface RoleData {
  /** The type of role behaviour. */
  type: RoleType;
  /** The identifier of the role entry. */
  label: string;
  /** The list of roles to select from. */
  selection: string[];
  /** The role to replace when called upon. */
  replace?: string;
  
  /** The absolute quantity of the role, after activation. */
  quantity: number;
  /** Specifies the role should not be repeated after initial selection. */
  unique: boolean;
  
  /**
   * How many players are required to add another role.
   * If `activation.include` is `true`, then the initial player count is included in the accumulation total.
   */
  each: number;
  
  /** The ratio of roles to add. */
  ratio: number;
  
  /**
   * The thresholds to add a new role.
   * If `activation.include` is `true`, then the initial player count is included in the accumulation total.
   */
  thresholds: number[];

  /** The activation descriptor attached to the role. */
  activation?: RoleActivation;
  /** The range descriptor attached to the role. */
  range?: RoleRange;
  /** The chance descriptor attached to the role. */
  chance?: RoleChance;

  /** The attributes for role selection, after completion. */
  attributes?: RoleAttributes;

  context?: RoleContext;
}