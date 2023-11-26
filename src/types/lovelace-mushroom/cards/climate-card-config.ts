import {HvacMode} from "../../homeassistant/data/climate";
import {LovelaceCardConfig} from "../../homeassistant/data/lovelace";
import {EntitySharedConfig} from "../shared/config/entity-config";
import {AppearanceSharedConfig} from "../shared/config/appearance-config";
import {ActionsSharedConfig} from "../shared/config/actions-config";

/**
 * Climate Card Config.
 *
 * @property {boolean} [show_temperature_control=false] Show buttons to control target temperature.
 * @property {HvacMode[]} [hvac_modes] List of hvac modes to display (auto, heat_cool, heat, cool, dry, fan_only, off).
 * @property {boolean} [collapsible_controls] Collapse controls when off.
 *
 * @see https://github.com/piitaya/lovelace-mushroom/blob/main/docs/cards/climate.md
 */
export type ClimateCardConfig = LovelaceCardConfig &
  EntitySharedConfig &
  AppearanceSharedConfig &
  ActionsSharedConfig & {
  show_temperature_control?: boolean;
  hvac_modes?: HvacMode[];
  collapsible_controls?: boolean;
};
