import {ActionsSharedConfig} from "../shared/config/actions-config";
import {LovelaceCardConfig} from "../../homeassistant/data/lovelace";
import {EntitySharedConfig} from "../shared/config/entity-config";
import {AppearanceSharedConfig} from "../shared/config/appearance-config";

/**
 * Fan Card Config.
 *
 * @property {boolean} [icon_animation=false] Animate the icon when fan is on.
 * @property {boolean} [show_percentage_control=false] Show a slider to control speed.
 * @property {boolean} [show_oscillate_control=false] Show a button to control oscillation.
 * @property {boolean} [icon_animation=false] Animate the icon when fan is on.
 *
 * @see https://github.com/piitaya/lovelace-mushroom/blob/main/docs/cards/fan.md
 */
export type FanCardConfig = LovelaceCardConfig &
  EntitySharedConfig &
  AppearanceSharedConfig &
  ActionsSharedConfig & {
  icon_animation?: boolean;
  show_percentage_control?: boolean;
  show_oscillate_control?: boolean;
  collapsible_controls?: boolean;
};
