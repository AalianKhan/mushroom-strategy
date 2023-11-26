import {ActionsSharedConfig} from "../shared/config/actions-config";
import {LovelaceCardConfig} from "../../homeassistant/data/lovelace";
import {EntitySharedConfig} from "../shared/config/entity-config";
import {AppearanceSharedConfig} from "../shared/config/appearance-config";

/**
 * Cover Card Config.
 *
 * @property {boolean} [show_buttons_control=false] Show buttons to open, close and stop cover.
 * @property {boolean} [show_position_control=false] Show a slider to control position of the cover.
 * @property {boolean} [show_tilt_position_control=false] Show a slider to control tilt position of the cover.
 *
 * @see https://github.com/piitaya/lovelace-mushroom/blob/main/docs/cards/cover.md
 */
export type CoverCardConfig = LovelaceCardConfig &
  EntitySharedConfig &
  AppearanceSharedConfig &
  ActionsSharedConfig & {
  show_buttons_control?: boolean;
  show_position_control?: boolean;
  show_tilt_position_control?: boolean;
};
