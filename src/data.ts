
//#region Role
export interface Role {
  /**
   * The name of the role.
   * @description
   * Cross-referenced with `scrolls` that modify the chances for a player to get this role.
   * > Ideally, this would be a database identifier - if roles become dynamic and user defined.
   */
  name: string;
  /**
   * This is the role's scale factor.
   * @description
   * This is scaled by the number of players in the game at runtime.
   */
  ratio: number;
  /**
   * The chance of the role being assigned to a player.
   * Not used by current implementation.
   */
  chance?: number;
  // description: string;
}

export const roles: Role[] = [
  {
    name: "Citizen",
    ratio: .5,
  },
  {
    name: "Werewolf",
    ratio: .3,
  },
  {
    name: "Spotter",
    ratio: .1,
  },
  {
    name: "Hunter",
    ratio: .1,
  }
];
//#endregion

//#region Scroll
export interface Scroll {
  /**
   * The role that the scroll modifies.
   * @description
   * Cross-referenced with `roles` that modify the chances for a player to get this role.
   */
  role: string; // Role#name
  /**
   * The effect modifier to be applied to the role's chances.
   */
  effect: number;
  /**
   * The used state of the scroll. (Defaults to `false`)
   */
  used: boolean;
}