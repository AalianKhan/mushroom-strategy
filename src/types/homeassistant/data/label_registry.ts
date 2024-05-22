/**
 * Label Entity.
 *
 * @property {string} color - The color of the label.
 * @property {string} description - The description of the label.
 * @property {string} icon - The icon of the label.
 * @property {string} label_id - The ID of the label.
 * @property {string} name - The name of the label.
 */
export interface LabelRegistryEntry {
  "color"?: string,
  "description"?: string,
  "icon"?: string,
  "label_id": string,
  "name": string
}
