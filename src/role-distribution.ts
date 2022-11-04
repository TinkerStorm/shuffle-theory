import { stdout } from "node:process";

//#region Configure
const FROM = -20;
const UNTIL = 41;
const DEBUG = true;
//#endregion

//#region Roles
const ROLES = [
  { name: "Villager", ratio: 10 },
  { name: "Werewolf", ratio: 5 },
  { name: "Seer", ratio: 1 },
  { name: "Robber", ratio: 1 },
  { name: "Troublemaker", ratio: 1 },
  { name: "Drunk", ratio: 1 },
  { name: "Insomniac", ratio: 1 },
  { name: "Hunter", ratio: 1 },
  { name: "Tanner", ratio: 1 },
]
//#endregion

const methods = {
  floor: Math.floor,
  round: Math.round,
  ceil: Math.ceil
}

const sum = ROLES.reduce((sum, role) => sum + role.ratio, 0);

for (let i = FROM; i < UNTIL; i++) {
  const scaleFactor = i / sum;

  if (!DEBUG) {
    stdout.write(`\n| ${i} | `);
  }

  for (let [key, method] of Object.entries(methods)) {
    const count = ROLES.reduce((sum, role) => {
      const roleCount = role.ratio * scaleFactor;
      if (DEBUG) {
        console.log(`[${key}, ${i}] ${role.name} (${role.ratio}) = ${method(roleCount)}: ${roleCount}`);
      }
      return sum + method(roleCount);
    }, 0);

    if (!DEBUG) {
      stdout.write(` ${(count - i).toString().padStart(2, " ")} |`);
    }
  }
}