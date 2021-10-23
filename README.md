# shuffle-theory
Research into different shuffling theories and how they may effect a service as it scales across shards and clusters.

## Method Comparison

The only comparison to make is how the roles are distributed, which have suttle differences in their state management.

> **Note:** The following is a comparison between the calling of `console.time` and `console.timeEnd` and the time taken to execute the function.
> - Lines 8 to 41 for [`reducing-stock`](./src/reducing-stock.ts#L8-L41)
> - Lines 8 to 38 for [`auction-bid`](./src/auction-bid.ts#L8-L41)

The chance of a role being assigned to a player is determined by `chance.shuffle`. When a role's chance is calculated, it can be anywhere between `70%` and `130%` - for now they are scaled up as integers, but I am unsure on the effect it may have on the chance outcomes.

- `reducing-stock` will iterate through players and assign them a role based on their chances (including applied scrolls).
- `auction-bid` will iterate through roles to find a player based on the chance they have (any scroll they have active), there is an extra step to fetch the player and then assign the role to that reference.

## Run Instructions

> Using `yarn`

```bash
gh clone TinkerStorm/shuffle-theory
yarn
yarn build

# these steps will not build the project
yarn mode:stock
yarn mode:auction

# or you can run all stages
yarn all
```

## Development Notes

- [`reducing-stock`](./src/reducing-stock.ts#L8-L41) took around 2 hours to make.
- [`auction-bid`](./src/auction-bid.ts#L8-L41) took around 1 hour to make, using what I had learned from `reducing-stock` to change its iteration target.

> This sandbox assumes that all players with active scrolls are unique scrolls per role. Multiple scrolls per role *can* be supported, but it strays dangerously close to imbalance of chance ratios between players.

They are equally fast, but the `reducing-stock` is a bit more bias towards players at the top of the list, favoring their scrolls before other players have a chance.

> This is not fair benchmarking... I know.

| Method | Iteratee | Stock | Time (5 runs) |
| ------ | -------- | ----- | ---- |
| `reducing-stock` | Player | Roles | 6.106 ms |
| `auction-bid` | Role | Players | 6.151 ms |

---

`chance.weighted(values, weights)` returns a value, which may prove troublesome if multiple instances of the same reference exist... using first match as `array.indexOf(value)` is good enough *to workaround this* but not as a permenant solution to scale in production.

### GitHub CoPilot

On `reducing-stock` copilot had provided me with a 'functional' approach to remove **all** matching references from the array... only problem with that is I can't stop it early without an external variable check (which may also be out-of-sync). Lodash's `remove` function does the exact same by asking for a predicate to remove elements if the predicate returns true (again requiring an external reference).

## License

This project is licensed under GNU General Public License v3.0, see the [LICENSE](LICENSE) file for more information. The `package.json` has also been marked as private, meaning it should not be published on the registry at this time.

## Credit

This takes inspiration from [`weighted-rng`](https://npm.im/weighted-rng) by [Mackan](https://github.com/Sven65) using the weight mapping to determine what element should be returned - this may end up using it once names and scrolls aren't required to be completely randomized.

In a future iteration, this may end up using a name dictionary from [jslife](https://github.com/ArchboxDev/jslife) by [ArchboxDev](https://github.com/ArchboxDev) (@bubmet and [@mount2010](https://github.com/mount2010)) to provide an alternative source of names during initial development stages. Eventually, this will have it's own names dictionary to select from (at least [that's the idea](https://github.com/TinkerStorm/names)).

## Future Plans

There are a few things I would like to consider adding to this project:

- Role ratios (e.g. `{ name: "Werewolf", ratio: 0.30 }`) - this would allow for a more dynamic role distribution as players are scaled.
> Alternative format may include a tuple of `[players, count]` - for each group of `players` (modulus divide at 0, `roster % players == 0`) provide `count` roles of this type.
- Initial role weights (e.g. `{ name: "Werewolf", weight: 0.70 }`) - `weight` would be the *initial* chance of a role being assigned to a player, as it is now just more focused on balanced distribution.
> Role weight multipliers are another option, but that would imply a more complex algorithm.
- Absolute role counts after a target has been reached (e.g. `{ name: "Jester", count: 1, target: 9 }`).
- Implement a proper interface for other modules to use (with provided players, roles, etc.).