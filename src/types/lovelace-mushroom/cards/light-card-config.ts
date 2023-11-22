import {ActionsSharedConfig} from "../shared/config/actions-config";
import {LovelaceCardConfig} from "../../homeassistant/data/lovelace";
import {EntitySharedConfig} from "../shared/config/entity-config";
import {AppearanceSharedConfig} from "../shared/config/appearance-config";

/**
 * Light Card Config.
 *
 * @property {string} [icon_color=blue] Custom color for icon and brightness bar when the lights are on and
 *                                      use_light_color is false.
 * @property {boolean} [show_brightness_control=false] Show a slider to control brightness.
 * @property {boolean} [show_color_temp_control=false] Show a slider to control temperature color.
 * @property {boolean} [show_color_control=false] Show a slider to control RGB color.
 * @property {boolean} [collapsible_controls=false] Collapse controls when off.
 * @property {boolean} [use_light_color=false] Colorize the icon and slider according light temperature or color.
 *
 * @see https://github.com/piitaya/lovelace-mushroom/blob/main/docs/cards/light.md
 */
export type LightCardConfig = LovelaceCardConfig &
  EntitySharedConfig &
  AppearanceSharedConfig &
  ActionsSharedConfig & {
  icon_color?: string;
  show_brightness_control?: boolean;
  show_color_temp_control?: boolean;
  show_color_control?: boolean;
  collapsible_controls?: boolean;
  use_light_color?: boolean;
};
