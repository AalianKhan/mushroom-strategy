import {Helper} from "../Helper";
import {chips} from "../types/strategy/chips";
import {AbstractChip} from "./AbstractChip";
import {TemplateChipConfig} from "../types/lovelace-mushroom/utils/lovelace/chip/types";

// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Cover Chip class.
 *
 * Used to create a chip to indicate how many covers aren't closed.
 */
class CoverChip extends AbstractChip {
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
    icon: "mdi:window-open",
    icon_color: "cyan",
    content: Helper.getCountTemplate("cover", [{operator: "eq", value: "open"}]),
    tap_action: {
      action: "none",
    },
    hold_action: {
      action: "navigate",
      navigation_path: "covers",
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

export {CoverChip};
