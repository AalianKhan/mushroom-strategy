import {LovelaceCardConfig} from "../../homeassistant/data/lovelace";
import {AppearanceSharedConfig} from "../shared/config/appearance-config";
import {EntitySharedConfig} from "../shared/config/entity-config";
import {ActionsSharedConfig} from "../shared/config/actions-config";

/**
 * Entity Card Config.
 *
 * @property {string} [icon_color=blue] Custom color for icon when entity is state is active.
 *
 * @see https://github.com/piitaya/lovelace-mushroom/blob/main/docs/cards/entity.md
 */
export type EntityCardConfig = LovelaceCardConfig &
  EntitySharedConfig &
  AppearanceSharedConfig &
  ActionsSharedConfig & {
  icon_color?: string;
};
