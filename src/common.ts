import { Chance } from 'chance';

export const chance = new Chance();

export interface Player {
  name: string;
  scrolls: Scroll[];
  role?: string
}

export interface Scroll {
  role: string;
  effect: number;
  used: boolean;
}

export function getPlayers(count: number): Player[] {
  const array = Array(count).fill(0).map(() => ({
    name: chance.name(),
    scrolls: chance.pickset(getScrolls(), chance.integer({ min: 0, max: 3 })),
    /** @type {?string} */
    role: undefined
  }));

  return chance.shuffle(array);
};

export const getRoles = () => chance.shuffle([
  "Villager", "Villager", "Villager", "Villager", "Villager",
  "Werewolf", "Werewolf",
  "Seer", "Seer",
  "Hunter"
]);

export const getScrolls = () => [
  { role: 'Villager', effect: chance.integer({ min: -30, max: 30 }), used: false },
  { role: 'Werewolf', effect: chance.integer({ min: -30, max: 30 }), used: false },
  { role: 'Seer', effect: chance.integer({ min: -30, max: 30 }), used: false },
  { role: 'Hunter', effect: chance.integer({ min: -30, max: 30 }), used: false }
];