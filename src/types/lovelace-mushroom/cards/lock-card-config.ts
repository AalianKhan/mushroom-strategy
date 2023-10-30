import {ActionsSharedConfig} from "../shared/config/actions-config";
import {LovelaceCardConfig} from "../../homeassistant/data/lovelace";
import {EntitySharedConfig} from "../shared/config/entity-config";
import {AppearanceSharedConfig} from "../shared/config/appearance-config";

/**
 * Lock Card Config.
 *
 * @see https://github.com/piitaya/lovelace-mushroom/blob/main/docs/cards/lock.md
 */
export type LockCardConfig = LovelaceCardConfig &
  EntitySharedConfig &
  AppearanceSharedConfig &
  ActionsSharedConfig;
