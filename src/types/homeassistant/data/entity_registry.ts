import {LightColor} from "./light";

type EntityCategory = "config" | "diagnostic";

export interface EntityRegistryDisplayEntry {
  entity_id: string;
  name?: string;
  device_id?: string;
  area_id?: string;
  hidden?: boolean;
  entity_category?: EntityCategory;
  translation_key?: string;
  platform?: string;
  display_precision?: number;
}

/**
 * Home assistant entity.
 *
 * @property {string} id
 * @property {string} entity_id The id of this entity.
 * @property {string} name The name of this entity.
 * @property {string | null} icon
 * @property {string | null} platform
 * @property {string | null} config_entry_id
 * @property {string | null} device_id The id of the device to which this entity is linked.
 * @property {string | null} area_id The id of the area to which this entity is linked.
 * @property {string | null} disabled_by Indicates by what this entity is disabled.
 * @property {Object} hidden_by Indicates by what this entity is hidden.
 * @property {EntityCategory | null} entity_category
 * @property {boolean} has_entity_name
 * @property {string} [original_name]
 * @property {string} unique_id
 * @property {string} [translation_key]
 * @property {EntityRegistryOptions | null} options
 * @property {string[]} labels An array of label_id's
 */
export interface EntityRegistryEntry {
  id: string;
  entity_id: string;
  name: string | null;
  icon: string | null;
  platform: string;
  config_entry_id: string | null;
  device_id: string | null;
  area_id: string | null;
  disabled_by: "user" | "device" | "integration" | "config_entry" | null;
  hidden_by: Exclude<EntityRegistryEntry["disabled_by"], "config_entry">;
  entity_category: EntityCategory | null;
  has_entity_name: boolean;
  original_name?: string;
  unique_id: string;
  translation_key?: string;
  options: EntityRegistryOptions | null;
  labels: string[];
}

export interface SensorEntityOptions {
  display_precision?: number | null;
  suggested_display_precision?: number | null;
  unit_of_measurement?: string | null;
}

export interface LightEntityOptions {
  favorite_colors?: LightColor[];
}

export interface NumberEntityOptions {
  unit_of_measurement?: string | null;
}

export interface LockEntityOptions {
  default_code?: string | null;
}

export interface WeatherEntityOptions {
  precipitation_unit?: string | null;
  pressure_unit?: string | null;
  temperature_unit?: string | null;
  visibility_unit?: string | null;
  wind_speed_unit?: string | null;
}

export interface SwitchAsXEntityOptions {
  entity_id: string;
}

export interface EntityRegistryOptions {
  number?: NumberEntityOptions;
  sensor?: SensorEntityOptions;
  lock?: LockEntityOptions;
  weather?: WeatherEntityOptions;
  light?: LightEntityOptions;
  switch_as_x?: SwitchAsXEntityOptions;
  conversation?: Record<string, unknown>;
  "cloud.alexa"?: Record<string, unknown>;
  "cloud.google_assistant"?: Record<string, unknown>;
}

