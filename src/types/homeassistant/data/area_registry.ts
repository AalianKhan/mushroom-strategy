/**
 * Area Entity.
 *
 * @property {string} area_id The id of the area.
 * @property {string} name Name of the area.
 * @property {string|null} picture URL to a picture that should be used instead of showing the domain icon.
 * @property {string[]} aliases Array of aliases of the area.
 */
export interface AreaRegistryEntry {
  area_id: string;
  name: string;
  icon?: string;
  picture: string | null;
  aliases: string[];
}
