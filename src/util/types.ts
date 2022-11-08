export interface RoleAttributes {
  /** The name of the role - forcibly updated in the roster after selection. */
  name: string;
  /** If the role originates from a group of roles. */
  group?: string;
  /** The associated chance of a player getting this role. */
  chance?: number;
}