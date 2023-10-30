import {ActionConfig, LovelaceCardConfig} from "../../../data/lovelace";

/**
 * Home Assistant Picture Entity Config.
 *
 * @property {string} entity An entity_id used for the picture.
 * @property {string} [name] Overwrite entity name.
 * @property {string} [image] URL of an image.
 * @property {string} [camera_image] Camera entity_id to use. (not required if entity is already a camera-entity).
 * @property {string} [camera_view=auto] “live” will show the live view if stream is enabled.
 * @property {Record<string, unknown>} [state_image] Map entity states to images (state: image URL).
 * @property {string[]} [state_filter] State-based CSS filters.
 * @property {string} [aspect_ratio] Forces the height of the image to be a ratio of the width.
 *                                   Valid formats: Height percentage value (23%) or ratio expressed with colon or “x”
 *                                   separator (16:9 or 16x9).
 *                                   For a ratio, the second element can be omitted and will default to “1”
 *                                   (1.78 equals 1.78:1).
 * @property {ActionConfig} [tap_action] Action taken on card tap.
 * @property {ActionConfig} [hold_action] Action taken on card tap and hold.
 * @property {ActionConfig} [double_tap_action] Action taken on card double tap.
 * @property {boolean} [show_name=true] Shows name in footer.
 * @property {string} [theme=true] Override the used theme for this card with any loaded theme.
 *
 * @see https://www.home-assistant.io/dashboards/picture-entity/
 */
export interface PictureEntityCardConfig extends LovelaceCardConfig {
  entity: string;
  name?: string;
  image?: string;
  camera_image?: string;
  camera_view?: "live" | "auto";
  state_image?: Record<string, unknown>;
  state_filter?: string[];
  aspect_ratio?: string;
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  double_tap_action?: ActionConfig;
  show_name?: boolean;
  show_state?: boolean;
  theme?: string;
}
