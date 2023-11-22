import {LovelaceCardConfig} from "../../homeassistant/data/lovelace";
import {LovelaceChipConfig} from "../utils/lovelace/chip/types";

/**
 * Chips Card Configuration
 *
 * @param {LovelaceChipConfig[]} chips Chips Array
 * @param {string} [alignment=start] Chips alignment (end, center, justify), when empty default behavior is start.
 *
 * @see https://github.com/piitaya/lovelace-mushroom/blob/main/docs/cards/chips.md
 */
export interface ChipsCardConfig extends LovelaceCardConfig {
  chips: LovelaceChipConfig[];
  alignment?: string;
}
