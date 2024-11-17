import {Helper} from "../Helper";
import {AbstractChip} from "./AbstractChip";
import {chips} from "../types/strategy/chips";
import {TemplateChipConfig} from "../types/lovelace-mushroom/utils/lovelace/chip/types";

// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Climate Chip class.
 *
 * Used to create a chip to indicate how many climates are operating.
 */
class ClimateChip extends AbstractChip {
  /**
   * Default configuration of the chip.
   *
   * @type {TemplateChipConfig}
   *
   * @readonly
   * @private
   */
  readonly #defaultConfig: TemplateChipConfig = {
    type: "template",
    icon: "mdi:thermostat",
    icon_color: "orange",
    content: Helper.getCountTemplate("climate", [{operator: "ne", value: "off"}]),
    tap_action: {
      action: "none",
    },
    hold_action: {
      action: "navigate",
      navigation_path: "climates",
    },
  };

  /**
   * Class Constructor.
   *
   * @param {chips.TemplateChipOptions} options The chip options.
   */
  constructor(options: chips.TemplateChipOptions = {}) {
    super();

    this.config = Object.assign(this.config, this.#defaultConfig, options);
  }
}

export {ClimateChip};
