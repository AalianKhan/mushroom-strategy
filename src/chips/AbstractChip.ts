import {HassServiceTarget} from "home-assistant-js-websocket";
import {LovelaceChipConfig} from "../types/lovelace-mushroom/utils/lovelace/chip/types";
import {Helper} from "../Helper";
import {generic} from "../types/strategy/generic";
import isCallServiceActionConfig = generic.isCallServiceActionConfig;

/**
 * Abstract Chip class.
 *
 * To create a new chip, extend this one.
 *
 * @class
 * @abstract
 */
abstract class AbstractChip {
  /**
   * Configuration of the chip.
   *
   * @type {LovelaceChipConfig}
   */
  config: LovelaceChipConfig = {
    type: "template"
  };

  /**
   * Class Constructor.
   */
  protected constructor() {
    if (!Helper.isInitialized()) {
      throw new Error("The Helper module must be initialized before using this one.");
    }
  }

  // noinspection JSUnusedGlobalSymbols Method is called on dymanically imported classes.
  /**
   * Get the chip.
   *
   * @returns  {LovelaceChipConfig} A chip.
   */
  getChip(): LovelaceChipConfig {
    return this.config;
  }

  /**
   * Set the target to switch.
   *
   * @param {HassServiceTarget} target Target to switch.
   */
  setTapActionTarget(target: HassServiceTarget) {
    if ("tap_action" in this.config && isCallServiceActionConfig(this.config.tap_action)) {
      this.config.tap_action.target = target;

      return;
    }

    if (Helper.debug) {
      console.warn(
        this.constructor.name
        + " - Target not set: Invalid target or tap action.");
    }
  }
}

export {AbstractChip};
