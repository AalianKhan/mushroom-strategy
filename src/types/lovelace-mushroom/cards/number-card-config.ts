import {ActionsSharedConfig} from "../shared/config/actions-config";
import {LovelaceCardConfig} from "../../homeassistant/data/lovelace";
import {EntitySharedConfig} from "../shared/config/entity-config";
import {AppearanceSharedConfig} from "../shared/config/appearance-config";

export const DISPLAY_MODES = ["slider", "buttons"] as const;

type DisplayMode = (typeof DISPLAY_MODES)[number];

/**
 * Number Card Config.
 *
 * @property {string} [icon_color=blue] Custom color for icon when entity state is active.
 * @property {DisplayMode} [display_mode=slider] Slider or Button controls.
 *
 * @see https://github.com/piitaya/lovelace-mushroom/blob/main/docs/cards/number.md
 */
export type NumberCardConfig = LovelaceCardConfig &
  EntitySharedConfig &
  AppearanceSharedConfig &
  ActionsSharedConfig & {
  icon_color?: string;
  display_mode?: DisplayMode;
};
