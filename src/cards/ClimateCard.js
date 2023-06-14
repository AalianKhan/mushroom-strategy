import {AbstractCard} from "./AbstractCard";

/**
 * Climate Card Class
 *
 * Used to create a card for controlling an entity of the climate domain.
 *
 * @class
 * @extends AbstractCard
 */
class ClimateCard extends AbstractCard {
  /**
   * Default options of the card.
   *
   * @type {climateCardOptions}
   * @private
   */
  #defaultOptions = {
    type: "custom:mushroom-climate-card",
    icon: undefined,
    hvac_modes: [
      "off",
      "cool",
      "heat",
      "fan_only",
    ],
    show_temperature_control: true,
  };

  /**
   * Class constructor.
   *
   * @param {hassEntity} entity The hass entity to create a card for.
   * @param {climateCardOptions} [options={}] Options for the card.
   * @throws {Error} If the Helper module isn't initialized.
   */
  constructor(entity, options = {}) {
    super(entity);
    this.mergeOptions(
        this.#defaultOptions,
        options,
    );
  }
}

export {ClimateCard};
