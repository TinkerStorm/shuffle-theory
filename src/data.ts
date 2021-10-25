
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
export class Scroll {
  used: boolean = false;

  constructor(
    public role: string,
    public effect: number
  ) {

  }

  get effectString() {
    return `${this.effect > 0 ? "+" : ""}${((this.effect) * 100).toFixed(2)}%`;
  }

  use() {
    this.used = true;
  }

  chanceMap(players: Player[]): { [player: string]: number } {
    const map = Object.create(null);
    //#region loop1 - intial map
    for (const player of players) {
      map[player.name] = 1;
      // get effect from scrolls
      for (const scroll of player.scrolls.filter(scroll => scroll.role == this.role)) {
        if (scroll.role === this.role) {
          map[player.name] += scroll.effect;
        }
      }
    }
    //#endregion
    //#region loop2 - scale to players
    const scaleFactor = players.length + players.map(player => player.scrolls
      .filter(scroll => scroll.role === this.role)
      .map(scroll => scroll.effect)
    ).flat().reduce((a, b) => a + b, 0) / players.length;
    for (const player of players) {
      map[player.name] *= scaleFactor;
    }
    //#endregion
    return map;
  }

  toString() {
    return `${this.role} scroll of ${this.effectString}`;
  }
}

export class Player {
  role?: string;

  constructor(
    public name: string,
    public scrolls: Scroll[] = []
  ) {

  }

  get usedScrolls() {
    return this.scrolls.filter(s => s.used);
  }

  static COUNT = 10;
}