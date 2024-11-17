import {Helper} from "../Helper";
import {chips} from "../types/strategy/chips";
import {AbstractChip} from "./AbstractChip";
import {TemplateChipConfig} from "../types/lovelace-mushroom/utils/lovelace/chip/types";

// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Light Chip class.
 *
 * Used to create a chip to indicate how many lights are on and to turn all off.
 */
class LightChip extends AbstractChip {
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
    icon: "mdi:lightbulb-group",
    icon_color: "amber",
    content: Helper.getCountTemplate("light", [{operator: "eq", value: "on"}]),
    tap_action: {
      action: "call-service",
      service: "light.turn_off",
    },
    hold_action: {
      action: "navigate",
      navigation_path: "lights",
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

export {LightChip};
