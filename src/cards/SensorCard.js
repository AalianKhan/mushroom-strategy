import {AbstractCard} from "./AbstractCard";

/**
 * Sensor Card Class
 *
 * Used to create a card for controlling an entity of the sensor domain.
 *
 * @class
 * @extends AbstractCard
 */
class SensorCard extends AbstractCard {
  /**
   * Default options of the card.
   *
   * @type {sensorCardOptions}
   * @private
   */
  #defaultOptions = {
    type: "custom:mushroom-entity-card",
    icon_color: "green",
    animate: true,
    line_color: "green",
  };

  /**
   * Class constructor.
   *
   * @param {hassEntity} entity The hass entity to create a card for.
   * @param {sensorCardOptions} [options={}] Options for the card.
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

export {SensorCard};
