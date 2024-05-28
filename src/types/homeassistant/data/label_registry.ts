/**
 * Label Entity.
 *
 * @property {string | null} color - The color name of the label.
 * @property {string | null} description - The description of the label.
 * @property {string | null} icon - The icon of the label.
 * @property {string} label_id - The ID of the label. Id is given at the creation of the label and can not be changed later.
 * @property {string} name - The name of the label.
 */
export interface LabelRegistryEntry {
  color: string | null,
  description: string | null,
  icon: string | null,
  label_id: string,
  name: string
}
