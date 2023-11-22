import {ActionsSharedConfig} from "../shared/config/actions-config";
import {LovelaceCardConfig} from "../../homeassistant/data/lovelace";
import {EntitySharedConfig} from "../shared/config/entity-config";
import {AppearanceSharedConfig} from "../shared/config/appearance-config";

export const VACUUM_COMMANDS = [
  "on_off",
  "start_pause",
  "stop",
  "locate",
  "clean_spot",
  "return_home",
] as const;

export type VacuumCommand = (typeof VACUUM_COMMANDS)[number];

/**
 * Vacuum Card Config.
 *
 * @param {boolean} icon_animation Animate the icon when vacuum is cleaning.
 * @param {VacuumCommand[]} commands List of commands to display (start_pause, stop, locate, clean_spot, return_home).
 *
 * @see https://github.com/piitaya/lovelace-mushroom/blob/main/docs/cards/vacuum.md
 */
export type VacuumCardConfig = LovelaceCardConfig &
  EntitySharedConfig &
  AppearanceSharedConfig &
  ActionsSharedConfig & {
  icon_animation?: boolean;
  commands?: VacuumCommand[];
};
