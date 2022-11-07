import { ChanceType, RoleData, RoleType } from "./types";

export class Role {
  data: Partial<RoleData>;

  constructor(label: string, ...selection: string[]) {
    this.data = { label };
    this.withSelection(...(selection.length ? selection : [label]));
    this.withActivation(0, true);
  }

  build() {
    return this.data as RoleData;
  }

  withSelection(...selection: string[]) {
    this.data.selection = selection;
    return this;
  }

  /**
   * How many players should join before this role is included
   * @param value number of players required to activate this role
   * @param include whether to include the initial player count after the condition has been fulfilled
   * 
   * @description
   * `⌊ ({count} - {reset?min:0}) / {each} ⌋`
   */
   withActivation(value: number, include = false, chance = 1) {
    this.data.activation = { value, include, chance }
    return this;
  }

  withReplace(replace: string) {
    this.data.replace = replace;
    return this;
  }

  withFixed(quantity: number) {
    this.withType(RoleType.FIXED);
    this.data.quantity = quantity;
    return this;
  }

  withMinimum(minimum: number) {
    this.data.range ??= {};
    this.data.range.minimum = minimum;
    return this;
  }

  withMaximum(maximum: number) {
    this.data.range ??= {};
    this.data.range.maximum = maximum;
    return this;
  }

  withRange(minimum: number, maximum: number) {
    this.data.range = { minimum, maximum };
    return this;
  }

  asUnique() {
    this.withFixed(this.data.selection?.length ?? 1);
    this.data.unique = true;
    return this;
  }

  withType(type: RoleType) {
    this.data.type = type;
    return this;
  }

  withEach(each: number) {
    this.withType(RoleType.INCREMENT);
    this.data.each = each;
    return this;
  }

  withRatio(ratio: number) {
    this.withType(RoleType.RATIO);
    this.data.each = ratio;
    return this;
  }

  /**
   * The physical chance that this role appears in the roster
   * @param chance the chance of the role appearing (0-1, exclusive)
   * @returns
   */
  withChance(value: number, type = ChanceType.RANDOM) {
    this.data.chance = { value, type };
    return this;
  }

  /**
   * The individual thresholds to add a new role, whether in order or not
   * @param thresholds A list of player quantities to add a new role
   * @returns 
   */
  withThresholds(...thresholds: number[]) {
    this.withType(RoleType.THRESHOLDS);
    this.data.thresholds = thresholds.flat();
    return this;
  }

  /**
   * Set the role to be a shared remainder role, which will fill the remaining slots in the roster.
   * Any roles assigned with this will share the remaining slots as equally as possible.
   */
  asRemainder() {
    this.withType(RoleType.REMAINDER);
    return this;
  }
}