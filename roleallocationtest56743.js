class Role {
  constructor(name, each, min = 1, afterMin = false) {
    this.name = name;
    this.each = each;
    this.min = min;
    this.afterMin = afterMin;
  }

  // future
  getChosenRole() {
    return this.name;
  }

  quantityFrom(playerCount) {
    // Take any remaining role slots
    if (this.each <= 0) return Infinity;
    if (playerCount < this.min) return 0;
    // ⌊ ({count} - {reset?min:0}) / {each} ⌋
    console.log([this.name, playerCount - (this.afterMin ? this.min : 0), this.each]);

    return Math.floor((playerCount - (this.afterMin ? this.min : 0)) / this.each);
  }
}

class BaseRole {}
class AlignmentRole {} // a group of roles within a team
class TeamRole {} // a game team (town, mafia, etc.)
class WildcardRole {} // a role slot that can be any role

const roles = [
  new Role("Detective", 5, 5, true),
  new Role("Villager", 0),
  new Role("Werewolf", 4),
]
  .filter((_, index, array) => array.findIndex((r, i) => r.each === 0 && index === i))
  .sort((a, b) => b.each - a.each);

function getRoleCounts(playerCount) {
  const result = {};
  let remaining = playerCount;

  for (const role of roles) {
    const count = role.quantityFrom(playerCount);

    if (count === 0) continue;

    else if (count === Infinity) {
      result[role.name] = remaining;
      console.log("Found %s, it will take all remaining slots", role.name);
      break;
    }

    else {
      result[role.name] = count;
      remaining -= count;
    }
  }

  return result;
}

console.log(getRoleCounts(10));