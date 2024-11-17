import {Helper} from "../Helper";
import {chips} from "../types/strategy/chips";
import {AbstractChip} from "./AbstractChip";
import {TemplateChipConfig} from "../types/lovelace-mushroom/utils/lovelace/chip/types";

// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Switch Chip class.
 *
 * Used to create a chip to indicate how many switches are on and to turn all off.
 */
class SwitchChip extends AbstractChip {
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
    icon: "mdi:dip-switch",
    icon_color: "blue",
    content: Helper.getCountTemplate("switch", [{operator: "eq", value: "on"}]),
    tap_action: {
      action: "call-service",
      service: "switch.turn_off",
    },
    hold_action: {
      action: "navigate",
      navigation_path: "switches",
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

export {SwitchChip};
