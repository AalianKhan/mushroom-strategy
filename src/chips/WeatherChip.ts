import {chips} from "../types/strategy/chips";
import {WeatherChipConfig} from "../types/lovelace-mushroom/utils/lovelace/chip/types";
import {AbstractChip} from "./AbstractChip";

// noinspection JSUnusedGlobalSymbols False positive.
/**
 * Weather Chip class.
 *
 * Used to create a chip for showing the weather.
 */
class WeatherChip extends AbstractChip {
  /**
   * Default configuration of the chip.
   *
   * @private
   * @readonly
   */
  readonly #defaultConfig: WeatherChipConfig = {
    type: "weather",
    show_temperature: true,
    show_conditions: true,
  };

  /**
   * Class Constructor.
   *
   * @param {string} entityId Id of a weather entity.
   * @param {chips.WeatherChipOptions} options Weather Chip options.
   */
  constructor(entityId: string, options: chips.WeatherChipOptions = {}) {
    super();
    this.#defaultConfig = {
      ...this.#defaultConfig,
      ...{entity: entityId},
      ...options,
    };

    this.config = Object.assign(this.config, this.#defaultConfig, options);
  }
}

export {WeatherChip};
