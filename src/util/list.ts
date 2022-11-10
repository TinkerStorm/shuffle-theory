export function shuffleList<T>(list: T[]): T[] {
  // list.sort(() => Math.random() - 0.5);
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}

export function pickOneFrom<T>(list: T[], chances?: number[]): T {
  if (chances && chances.length) {
    if (chances.length !== list.length) {
      throw new Error('Chances must be the same length as the list');
    }
    
    // Any item with a chance of 0 or less is impossible to pick
    if (chances.some((c) => c < 0)) {
      throw new Error('Chances must be greater than or equal to 0');
    }

    // pick one based on chances
    const total = chances.reduce((a, b) => a + b, 0);
    const random = Math.random() * total;
    let sum = 0;
    for (let i = 0; i < list.length; i++) {
      sum += chances[i];
      if (random < sum)
        return list[i];
    }
  }
  
  // pick one at random, also used if no chances were selected (edge case)
  return list[Math.floor(Math.random() * list.length)];
}