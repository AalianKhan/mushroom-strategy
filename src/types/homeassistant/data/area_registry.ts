/**
 * Area Entity.
 *
 * @property {string} area_id The id of the area.
 * @property {string|null} floor_id The id of the area's floor.
 * @property {string} name Name of the area.
 * @property {string|null} picture URL to a picture that should be used instead of showing the domain icon.
 * @property {string|null} icon Icon to show.
 * @property {string[]} labels Labels allow grouping elements irrespective of their physical location or type.
 * @property {string[]} aliases Array of aliases of the area.
 */
export interface AreaRegistryEntry {
  area_id: string;
  floor_id: string | null;
  name: string;
  picture: string | null;
  icon: string | null;
  labels: string[];
  aliases: string[];
}
