import {SensorCard} from "./SensorCard";

/**
 * Sensor Card Class
 *
 * Used to create a card for controlling an entity of the binary_sensor domain.
 *
 * @class
 * @extends SensorCard
 */
class BinarySensorCard extends SensorCard {
  /**
   * Default options of the card.
   *
   * @type {sensorCardOptions}
   * @private
   */
  #defaultOptions = {
    type: "custom:mushroom-entity-card",
    icon: "mdi:power-cycle",
    icon_color: "green",
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

export {BinarySensorCard};
