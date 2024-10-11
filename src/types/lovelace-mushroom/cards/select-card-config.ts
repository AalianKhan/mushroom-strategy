import {ActionsSharedConfig} from "../shared/config/actions-config";
import {LovelaceCardConfig} from "../../homeassistant/data/lovelace";
import {EntitySharedConfig} from "../shared/config/entity-config";
import {AppearanceSharedConfig} from "../shared/config/appearance-config";

/**
 * Select Card Config.
 *
 * @property {string} [icon_color=blue] Custom color for icon when entity state is active.
 *
 * @see https://github.com/piitaya/lovelace-mushroom/blob/main/docs/cards/select.md
 */
export type SelectCardConfig = LovelaceCardConfig &
  EntitySharedConfig &
  AppearanceSharedConfig &
  ActionsSharedConfig & {
  icon_color?: string;
};
